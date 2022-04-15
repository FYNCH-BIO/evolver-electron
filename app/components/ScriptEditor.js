import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AceEditor from 'react-ace';
import Card from '@material-ui/core/Card';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import moment from 'moment'
import {FaArrowLeft, FaPlay, FaChartBar, FaStop, FaCopy, FaSave, FaTrashAlt, FaFolderOpen, FaPen} from 'react-icons/fa';
import TstatEditor from './experiment-configuration/TstatEditor'
import ReactTable from "react-table";
import Select from 'react-select';
import ModalClone from './python-shell/ModalClone';
import DeleteExptModal from './DeleteExptModal';
import EvolverSelect from './evolverConfigs/EvolverSelect'
import ReactTooltip from 'react-tooltip';
const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const md5File = require('md5-file');

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
    left: '520px',
    overflowY: 'auto'
  },
  cardFiles: {
    top: '150px',
    left: '-100px',
    overflowY: 'auto'
  }
};

const exptEditorOptions = [
  {value: 'turbidostat', label: 'Turbidostat'},
  {value: 'chemostat', label:'Chemostat'},
  {value: 'growthcurve', label: 'Growth Curve'},
  {value: 'fileEditor', label: 'File Editor'}
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
      changeNameAlertOpen: false,
      changeExptNameDirections: "Enter new experiment name",
      cloneExptAlertDirections: "Enter new experiment name",
      deleteExptAlertDirections: "",
      deleteExptAlertOpen: false,
      newFileAlertDirections: "Enter the new filename",
      deleteExptAlertButtonText: "Delete",
      saveAlertButtonText: "Save File",
      saveFileAlertDirections: "By saving, you will no longer be able to use the graphical experiment editor features. Continue?",
      saveFileAlertOpen: false,
      selectedEditor:exptEditorOptions[0],
      showAllFilesButtonTextOptions: ['Show All Files', 'Hide Files'],
      showAllFilesButtonText: 'Show All Files',
      disablePlay: false,
      showAllFiles: false,
      option: 0,
      changeNameDisabled: false,
      vialConfiguration: [],
      evolverIp: this.props.evolverIp
    };

    var customScriptMd5 = md5File.sync(path.join(this.state.exptDir, 'custom_script.py'));
    var evolverScriptMd5 = md5File.sync(path.join(this.state.exptDir, 'eVOLVER.py'));

    var templateCustomScriptMd5 = md5File.sync(path.join(app.getPath('userData'), 'template', 'custom_script.py'));
    var templateEvolverScriptMd5 = md5File.sync(path.join(app.getPath('userData'), 'template', 'eVOLVER.py'));

    var editedExpts = store.get('editedExpts', {});

    if (customScriptMd5 != templateCustomScriptMd5 || evolverScriptMd5 != templateEvolverScriptMd5) {
      if (!editedExpts[this.state.exptName]) {
        editedExpts[this.state.exptName] = 1;
        store.set('editedExpts', editedExpts);
      }
    }

    if (editedExpts[this.state.exptName]) {
      this.setState({option: 1, selectedEditor: exptEditorOptions[1]});
    }

    ipcRenderer.on('running-expts', (event, arg) => {
      var disablePlay = false;
      var changeNameDisabled = false;
      for (var i = 0; i < arg.length; i++) {
        if (arg[i] === path.join(this.state.exptDir)) {
          disablePlay = true;
          changeNameDisabled = true;
        }
      }
      this.setState({disablePlay: disablePlay, changeNameDisabled: changeNameDisabled});
    });

    ipcRenderer.send('running-expts');
  }
  
  componentDidMount(){
    this.loadTable();
    this.loadSaveParameters();
    this.readfile('custom_script.py');
    ipcRenderer.send('running-expts');
    var editedExpts = store.get('editedExpts', {});
    if (editedExpts[this.state.exptName] && !this.state.option) {
      this.setState({option: 1, selectedEditor: exptEditorOptions.find(a => a.value == 'fileEditor')});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.exptDir !== prevProps.exptDir) {
      if (this.props.exptDir !== 'undefined'){
        this.readfile('custom_script.py');
        this.setState({exptDir: this.props.exptDir})
      }
    }
    var editedExpts = store.get('editedExpts', {});
    if (editedExpts[this.state.exptName] && !this.state.option) {
      this.setState({option: 1, selectedEditor: exptEditorOptions.find(a => a.value == 'fileEditor')});
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
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) throw err;
      console.log('OK: ' + filename);
      this.setState({scriptContent: data})
    }.bind(this));
  };

  savefile = () => {
    if (this.state.selectedEditor.value == 'fileEditor') {
        var editedExpts = store.get('editedExpts', {});
        if (!editedExpts[this.state.exptName]) {
          this.setState({saveFileAlertOpen: true});
        }
        else {
          this.saveFileAlertAnswer(true);
        }
    }
  };

  saveFileAlertAnswer = (response) => {
    this.setState({saveFileAlertOpen: false});
    if (!response) {
      return;
    }
    var filename = path.join(this.state.exptDir, this.state.selection);
    var data = editorComponent.props.children[0].props.children.props.value;
    fs.writeFileSync(filename, data);
    console.log('saved!');
    var editedExpts = store.get('editedExpts', {});
    if (!editedExpts[this.state.exptName]) {
      editedExpts[this.state.exptName] = 1;
    }
    store.set('editedExpts', editedExpts);
    this.setState({option: 1});
  };

  newfile = () => {
    console.log('nf');
    this.setState({newFileAlertOpen: true});
  };

  deleteexpt = () => {
    var editedExpts = store.get('editedExpts', {});
    delete editedExpts[this.state.exptName];
    store.set('editedExpts', editedExpts)
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
  var editedExpts = store.get('editedExpts', {});
  if (editedExpts[this.state.exptName] && !this.state.option) {
    this.setState({option: 1});
  }
  this.loadTable();
};

  loadSaveParameters = () => {
      var filename = path.join(this.state.exptDir, 'eVOLVER_parameters.json');
      var vialConfiguration;
      var vialConfigurationRaw;
      if (fs.existsSync(filename)) {
          vialConfigurationRaw = fs.readFileSync(filename);          
          vialConfiguration = JSON.parse(vialConfigurationRaw)['vial_configuration'];
          vialConfigurationRaw = JSON.parse(vialConfigurationRaw);
      }      
      this.setState({vialConfiguration: vialConfiguration});
      if (vialConfigurationRaw) {
        if (vialConfigurationRaw.function == 'turbidostat') {
            this.setState({selectedEditor: exptEditorOptions.find(a => a.value == 'turbidostat'), evolverIp: vialConfigurationRaw.ip})
        }
        else if (vialConfigurationRaw.function == 'chemostat') {
            this.setState({selectedEditor: exptEditorOptions.find(a => a.value == 'chemostat'), evolverIp: vialConfigurationRaw.ip})
        }
        else if (vialConfigurationRaw.fucntion == 'growthrate') {
            this.setState({selectedEditor: exptEditorOptions.find(a => a.value == 'growthrate'), evolverIp: vialConfigurationRaw.ip})
        }
    }
  }

  handleSaveParameters = (vialData) => {
      var filename = path.join(this.state.exptDir, 'eVOLVER_parameters.json');
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
    this.setState({evolverIp: evolver.value});
    store.set('evolverExptMap', evolverExptMap);
  }

  changeExptName = () => {
    this.setState({changeNameAlertOpen: true});
  }

  changeNameAlertAnswer = (response) => {
    this.setState({changeNameAlertOpen: false});
    if (response) {
      this.setState({exptName: response})
      fs.rename(this.state.exptDir, path.join(path.dirname(this.state.exptDir), response));
    }
  }

  render() {
    var exptNameFormatted = this.state.exptName;
    if (exptNameFormatted.length > 17) {
      exptNameFormatted = exptNameFormatted.substring(0, 17) + "...";
    }
    const opacity = this.state.option ? .3 : 1;
    const selectorStyles = {
      control: styles => ({...styles, backgroundColor: 'black', height: '2px', 'width': '200px'}),
      menu: styles => ({...styles, width:'200px', backgroundColor: 'black', border: '2px', borderStyle: 'solid', borderColor:'white'}),
      singleValue: styles => ({...styles, color: 'white', opacity: opacity}),
      option: provided => {
        return {
          ...provided,
          backgroundColor: 'black',
          width: '200px',

        };
      },
    };
    const { classes } = this.props;
    var columns = [
      {
        Header: "File",
        accessor: "filename",
        width: 325
      },
      {
        Header: "Last Modified",
        accessor: "modifiedString",
        width: 150
      }
    ];

    var buttons = <div class="editor-buttons">
      <ReactTooltip />
      {this.state.disablePlay ? <button class="ebfe" data-tip="Stop the experiment (end data collection and end culture routines)" onClick={() => this.onStop(this.state.exptDir)}> <FaStop size={25}/> </button> : (<button data-tip="Start experiment (begin collecting data and executing culture routine)"class="ebfe" onClick={() => this.handlePlay(this.state.exptDir)} disabled={this.state.changeNameDisabled}><FaPlay size={25}/></button>)}
      <Link class="scriptFinderEditBtn" id="graphs" to={{pathname: routes.GRAPHING, exptDir: this.state.exptDir, evolverIp: this.state.evolverIp}}><button data-tip="View data for this experiment" class="ebfe" onClick={() => this.onGraph()}> <FaChartBar size={25}/> </button></Link>
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
        defaultValue={exptEditorOptions[this.state.option]}
        onChange = {this.selectorChange}
        isDisabled = {this.state.option}
        value = {this.state.selectedEditor}
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
           <p style={{position: 'absolute', left: '53px', top: '250px', width: '375px', textAlign: 'center'}}>NOTE: If you are running a t-stat or other pre-defined module, you do not need to modify these files!</p>

      </div>

    editorComponent = null;
    if (this.state.selectedEditor.value == 'fileEditor') {
      editorComponent = <div><Card classes={{root:classes.cardRoot}} className={classes.cardEditor}>
            <AceEditor
              value={this.state.scriptContent}
              width='585px'
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
    else {
      editorComponent = <div><TstatEditor onSave={this.handleSaveParameters} evolverIp={this.state.evolverIp} function={this.state.selectedEditor.value} vialConfiguration={this.state.vialConfiguration}/></div>
    }

    return (
      <div>
          <div className="editorEvolverSelect">
            <EvolverSelect title="SELECT eVOLVER" onRef={function (ref) {}} selectEvolver = {this.handleSelectEvolver} selectedExperiment = {this.state.exptDir} evolverIp={this.state.evolverIp}/>
          </div>
          <div className="editorTitle"><ReactTooltip /><span style={{fontWeight: "bold"}}>Expt Editor: </span><span style={{color:"#f58245"}} data-tip={this.state.exptName}>{exptNameFormatted}</span><button class="edit-expt-name-btn" data-tip="Change Experiment Name" onClick={this.changeExptName} disabled={this.state.changeNameDisabled}><FaPen size={15}/></button></div>
          {buttons}
          {editorComponent}
          {selector}
          <ModalClone
            alertOpen = {this.state.changeNameAlertOpen}
            alertQuestion = {this.state.changeExptNameDirections}
            onAlertAnswer = {this.changeNameAlertAnswer}
            stayOnPage = {true}
          />
          <ModalClone
            alertOpen = {this.state.cloneExptAlertOpen}
            alertQuestion = {this.state.cloneExptAlertDirections}
            onAlertAnswer = {this.cloneExptAlertAnswer} />
          <DeleteExptModal
            alertOpen = {this.state.saveFileAlertOpen}
            alertQuestion = {this.state.saveFileAlertDirections}
            buttonText = "Save File"
            useLink = {false}
            onAlertAnswer = {this.saveFileAlertAnswer}
          />
          <DeleteExptModal
            alertOpen = {this.state.deleteExptAlertOpen}
            alertQuestion = {this.state.deleteExptAlertDirections}
            buttonText = "Delete"
            useLink = {true}
            onAlertAnswer = {this.deleteExptAlertAnswer} />

        <Link className="expEditorHomeBtn" id="experiments" to={{pathname:routes.EXPTMANAGER, evolverIp:this.state.evolverIp}}><FaArrowLeft/></Link>
      </div>
    );
  }
}

export default withStyles(styles)(ScriptEditor);
