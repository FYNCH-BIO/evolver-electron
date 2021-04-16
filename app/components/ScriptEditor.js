import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AceEditor from 'react-ace';
import Card from '@material-ui/core/Card';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import moment from 'moment'
import {FaArrowLeft, FaPlay, FaChartBar, FaStop, FaCopy, FaSave, FaTrashAlt, FaFolderOpen} from 'react-icons/fa';
import TstatEditor from './experiment-configuration/TstatEditor'
import ReactTable from "react-table";
import Select from 'react-select';
import ModalClone from './python-shell/ModalClone';
import DeleteExptModal from './DeleteExptModal';
import EvolverSelect from './evolverConfigs/EvolverSelect'
import ReactTooltip from 'react-tooltip';
const { ipcRenderer } = require('electron');
const Store = require('electron-store');

import 'brace/mode/python';
import 'brace/theme/monokai';

var fs = require('fs');
var path = require('path');
var util = require('util');
var rimraf = require('rimraf');
const remote = require('electron').remote;
const {shell} = require('electron').remote;
const app = remote.app;
const store = new Store();

var editorComponent;
var filesToShow = ['eVOLVER.py', 'custom_script.py'];

const filesToCopy = ['custom_script.py', 'eVOLVER.py', 'nbstreamreader.py', 'pump_cal.txt', 'eVOLVER_parameters.json'];

const styles = {
  cardRoot: {
    position: 'absolute',
    backgroundColor: 'black',
    verticalAlign: 'bottom',
    horizontalAlign: 'left'
  },
  cardEditor:{
    top: '63px',
    left: '430px',
    overflowY: 'auto'
  },
  cardFiles: {
    top: '150px',
    left: '-100px',
    overflowY: 'auto'
  }
};

const selectorStyles = {
  control: styles => ({...styles, backgroundColor: 'black', height: '2px', 'width': '200px'}),
  menu: styles => ({...styles, width:'200px', backgroundColor: 'black', border: '2px', borderStyle: 'solid', borderColor:'white'}),
  singleValue: styles => ({...styles, color: 'white'}),
  option: provided => {
    return {
      ...provided,
      backgroundColor: 'black',
      width: '200px',

    };
  },
};

const exptEditorOptions = [
  {value: 'fileEditor', label: 'File Editor'},
  {value: 'turbidostat', label: 'Turbidostat'},
  {value: 'chemostat', label: 'Chemostat'}
]

class ScriptEditor extends React.Component {

  constructor(props) {
    super(props);
    var exptName = path.basename(this.props.exptDir);
    this.state = {
      exptDir: this.props.exptDir,
      exptName: exptName,
      scriptContent: '',
      selection: 'custom_script.py',
      hoveredRow: null,
      cloneExptAlertOpen: false,
      exptDirFiles: [],
      cloneExptAlertDirections: "Enter new experiment name",
      deleteExptAlertDirections: "",
      deleteExptAlertOpen: false,
      selectedEditor:exptEditorOptions[0],
      showAllFilesButtonTextOptions: ['Show All Files', 'Hide Files'],
      showAllFilesButtonText: 'Show All Files',
      disablePlay: false,
      showAllFiles: false
    };

    ipcRenderer.on('running-expts', (event, arg) => {
      var disablePlay = false
      for (var i = 0; i < arg.length; i++) {
        if (arg[i] === path.join(this.state.exptDir)) {
          disablePlay = true;
        }
      }
      this.setState({disablePlay: disablePlay});
    });

    ipcRenderer.send('running-expts');
  }



  componentDidMount(){
    this.loadTable();
    this.readfile('custom_script.py');
    ipcRenderer.send('running-expts');
  }

  componentDidUpdate(prevProps) {
    if (this.props.exptDir !== prevProps.exptDir) {
      if (this.props.exptDir !== 'undefined'){
        this.readfile('custom_script.py');
        this.setState({exptDir: this.props.exptDir})
      }
    }
    ipcRenderer.send('running-expts');
  }

  loadTable = () => {
    var allFiles = fs.readdirSync(this.state.exptDir);
    var filesData = [];
    for (var i = 0; i < allFiles.length; i++) {
      var stats = fs.lstatSync(path.join(this.state.exptDir, allFiles[i]));
      var timestamp = new Date(util.inspect(stats.mtime));
      var lastModified = moment(timestamp).valueOf();
      var lastModifiedString = moment(timestamp).fromNow();
      if ((filesToShow.includes(allFiles[i]) || this.state.showAllFiles) && !stats.isDirectory()) {
        filesData.push({filename: allFiles[i], modified: lastModified, modifiedString: lastModifiedString});
      }
    }
    this.setState({exptDirFiles: filesData});
  };

  onChange = (newValue) => {
    this.setState({scriptContent: newValue});
  };

  isSelected = rowInfo => {
    if (typeof rowInfo !== 'undefined'){
      if (rowInfo.row.filename == this.state.selection) {
        return true;
      }
    }
   };

   isHovered = rowInfo => {
    if (typeof rowInfo !== 'undefined') {
      if (rowInfo.index == this.state.hoveredRow) {
        return true;
      }
    }
   };

  readfile = () => {
    var filename = path.join(this.state.exptDir, this.state.selection);
    var scriptContent;
    console.log(filename)
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) throw err;
      console.log('OK: ' + filename);
      this.setState({scriptContent: data})
    }.bind(this));
  };

  savefile = () => {
    var filename = path.join(this.state.exptDir, this.state.selection);
    var data = editorComponent.props.children[0].props.children.props.value;
    fs.writeFileSync(filename, data);
    console.log('saved!');
  };

  newfile = () => {
    console.log('nf');
    this.setState({newFileAlertOpen: true});
  };

  deleteexpt = () => {
    console.log('deleting this shit'  )
    var directions = "Are you sure you want to delete the experiment " + this.state.exptName + "?";
    this.setState({deleteExptAlertDirections: directions}, function() {
      this.setState({deleteExptAlertOpen: true});
    }.bind(this));
};

  cloneexpt = () => {
    this.setState({cloneExptAlertOpen: true});
  }

  resetparams = () => {
  fs.unlinkSync(path.join(this.state.exptDir, 'eVOLVER_parameters.json'));
  this.loadTable();
};

  cloneExptAlertAnswer = (newExptName) => {
    this.setState({cloneExptAlertOpen: false});
    if(newExptName != '') {
      this.createNewExperiment(newExptName);
    }
  };

  createNewExperiment = (newExptName) => {
      var newDir = path.join(path.dirname(this.state.exptDir), newExptName);
      var oldDir = this.state.exptDir;
      console.log(newDir);
      if (!fs.existsSync(newDir)) {
          fs.mkdirSync(newDir);
      }
      filesToCopy.forEach(function (filename) {
        if (fs.existsSync(path.join(oldDir, filename))) {
          fs.copyFileSync(path.join(oldDir, filename), path.join(newDir, filename));
        }
      });
  }

  deleteExptAlertAnswer = (response) => {
    this.setState({deleteExptAlertOpen: false});
    if (response) {
      console.log(this.state.exptDir);
      rimraf.sync(this.state.exptDir);
    }
  };

  selectorChange = (value_selected) => {
  this.setState({selectedEditor: exptEditorOptions.find(a => a.value == value_selected.value)})
  this.loadTable();
};

  handleSaveParameters = (vialData) => {
      var filename = path.join(this.state.exptDir, 'eVOLVER_parameters.json');
      console.log(vialData);
      var filehandle = fs.openSync(filename, 'w');
      fs.writeSync(filehandle, JSON.stringify(vialData));
  };

  showFileBrowser = () => {
    shell.showItemInFolder(this.state.exptDir);
  }

  handlePlay = (exptToPlay) => {
    ipcRenderer.send('start-script', exptToPlay);
    this.setState({disablePlay: true});
  }

  onStop = (exptToStop) =>  {
    ipcRenderer.send('stop-script', exptToStop);
  }

  onGraph = (exptToGraph) => {
    console.log('to the plots');
  }

  handleSelectEvolver = (evolver) => {
    var evolverExptMap = store.get('evolverExptMap', {});
    evolverExptMap[this.state.exptDir] = evolver.label;
    store.set('evolverExptMap', evolverExptMap);
  }

  render() {
    const { classes } = this.props;
    var columns = [
      {
        Header: "File",
        accessor: "filename",
        width: 250
      },
      {
        Header: "Last Modified",
        accessor: "modifiedString",
        width: 200
      }
    ];

    var buttons = <div class="editor-buttons">
      <ReactTooltip />
      {this.state.disablePlay ? <button class="ebfe" data-tip="Stop the experiment (end data collection and end culture routines)" onClick={() => this.onStop(this.state.exptDir)}> <FaStop size={25}/> </button> : (<button data-tip="Start experiment (begin collecting data and executing culture routine)"class="ebfe" onClick={() => this.handlePlay(this.state.exptDir)} disabled={this.state.disablePlay}><FaPlay size={25}/></button>)}
      <Link class="scriptFinderEditBtn" id="graphs" to={{pathname: routes.GRAPHING, exptDir: path.join(app.getPath('userData'), this.state.exptDir)}}><button data-tip="View data for this experiment" class="ebfe" onClick={() => this.onGraph()}> <FaChartBar size={25}/> </button></Link>
      <button class="ebfe" data-tip="Save file" onClick={this.savefile}><FaSave size={25}/></button>
      <button class="ebfe" data-tip="Clone this experiment, creating a new one with identical configuration" onClick={() => this.cloneexpt()}><FaCopy size={25}/></button>
      <button class="ebfe" data-tip="View experiments in the file browser" onClick={this.showFileBrowser}><FaFolderOpen size={25}/></button>
      <button class="ebfe" data-tip="Delete this experiment" onClick={this.deleteexpt}><FaTrashAlt size={25}/></button>
    </div>;

    var selector = <div class="select-div">
      <Select
        options={exptEditorOptions}
        class-name="select-dropdown"
        styles={selectorStyles}
        defaultValue={exptEditorOptions[0]}
        onChange = {this.selectorChange}
      />
    </div>;


    var filesComponent =
      <div class="filesTable">
           <ReactTable
              data={this.state.exptDirFiles}
              columns={columns}
              showPagination={false}
              pageSize={10}
              height={200}
              resizable={false}
              showPageSizeOptions= {false}
              loading={false}
              defaultSorted={[{id: "modified",desc: true}]}
              className="-striped -highlight ft"
              getTdProps={(state, rowInfo, column, instance) => {
                return {
                  onClick: (e, handleOriginal) => {
                    if (rowInfo && this.state.selection !== rowInfo.row.filename) {
                      this.setState({selection: rowInfo.row.filename}, () => {
                        this.readfile();
                      })
                    }
                  },
                  onMouseEnter: (e) => {
                    if (rowInfo) {
                      this.setState({hoveredRow: rowInfo.index})
                    }
                  },
                  onMouseLeave: (e) => {
                    if (rowInfo) {
                      this.setState({hoveredRow: null})
                    }
                  },
                  style: {
                      fontWeight: this.isSelected(rowInfo) ? "bold" : null,
                      color: this.isSelected(rowInfo) ? "#f58245" : null,
                      background: this.isHovered(rowInfo) ? "#2a2a2a" : null
                  }
                }
              }}
           />

      </div>

    editorComponent = null;
    if (this.state.selectedEditor.value == 'fileEditor') {
      editorComponent = <div><Card classes={{root:classes.cardRoot}} className={classes.cardEditor}>
            <AceEditor
              value={this.state.scriptContent}
              width='675px'
              height='570px'
              mode="python"
              theme="monokai"
              onChange={this.onChange}
              name="pythonScriptEditor"
              editorProps={{$blockScrolling: true}}
              commands={[{name: 'saveFile', bindKey: {win: 'Ctrl+S', mac: 'Cmd+S'}, exec: this.savefile}]}
              />
          </Card>
          {filesComponent}
          </div>;
    }
    else if (this.state.selectedEditor.value == 'turbidostat') {
      editorComponent = <div><TstatEditor onSave={this.handleSaveParameters} evolverIp={this.props.evolverIp}/></div>
    }

    return (
      <div>
          <div className="editorEvolverSelect">
            <EvolverSelect title="SELECT eVOLVER" onRef={function (ref) {}} selectEvolver = {this.handleSelectEvolver} selectedExperiment = {this.state.exptDir}/>
          </div>
          <div className="editorTitle"> <span style={{fontWeight: "bold"}}>Experiment Editor: </span><span style={{color:"#f58245"}}>{this.state.exptName}</span></div>
          {buttons}
          {editorComponent}
          {selector}
          <ModalClone
            alertOpen = {this.state.cloneExptAlertOpen}
            alertQuestion = {this.state.cloneExptAlertDirections}
            onAlertAnswer = {this.cloneExptAlertAnswer} />

          <DeleteExptModal
            alertOpen = {this.state.deleteExptAlertOpen}
            alertQuestion = {this.state.deleteExptAlertDirections}
            onAlertAnswer = {this.deleteExptAlertAnswer} />

        <Link className="expEditorHomeBtn" id="experiments" to={routes.EXPTMANAGER}><FaArrowLeft/></Link>
      </div>
    );
  }
}

export default withStyles(styles)(ScriptEditor);
