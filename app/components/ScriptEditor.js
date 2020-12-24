import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AceEditor from 'react-ace';
import Card from '@material-ui/core/Card';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import moment from 'moment'
import {FaArrowLeft} from 'react-icons/fa';
import TstatEditor from './experiment-configuration/TstatEditor'
import ReactTable from "react-table";
import Select from 'react-select';
import NewFileModal from './NewFileModal';
import DeleteFileModal from './DeleteFileModal';

import 'brace/mode/python';
import 'brace/theme/monokai';

var fs = require('fs');
var path = require('path');
var util = require('util');
const remote = require('electron').remote;
const app = remote.app;

var editorComponent;

const styles = {
  cardRoot: {
    position: 'absolute',
    backgroundColor: 'black',
    verticalAlign: 'bottom',
    horizontalAlign: 'left'
  },
  cardEditor:{
    top: '65px',
    left: '425px',
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
      newFileAlertOpen: false,
      exptDirFiles: [],
      newFileAlertDirections: "Enter the new filename",
      deleteFileAlertDirections: "",
      deleteFileAlertOpen: false,
      selectedEditor:exptEditorOptions[0],    
    };        
  }



  componentDidMount(){
    this.loadTable();
    this.readfile('custom_script.py');    
  }

  componentDidUpdate(prevProps) {
    if (this.props.exptDir !== prevProps.exptDir) {      
      if (this.props.exptDir !== 'undefined'){
        this.readfile('custom_script.py');        
        this.setState({exptDir: this.props.exptDir})        
      }
    }
  }

  loadTable = () => {
    var allFiles = fs.readdirSync(this.state.exptDir);
    var filesData = [];    
    for (var i = 0; i < allFiles.length; i++) {
      var stats = fs.lstatSync(path.join(this.state.exptDir, allFiles[i]));
      var timestamp = new Date(util.inspect(stats.mtime));
      var lastModified = moment(timestamp).valueOf();
      var lastModifiedString = moment(timestamp).fromNow();
      filesData.push({filename: allFiles[i], modified: lastModified, modifiedString: lastModifiedString});
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

  deletefile = () => {
    var directions = "Are you sure you want to delete " + this.state.selection + "?";
    this.setState({deleteFileAlertDirections: directions}, function() {
      this.setState({deleteFileAlertOpen: true});
    }.bind(this));    
};

  resetparams = () => {
  fs.unlinkSync(path.join(this.state.exptDir, 'eVOLVER_parameters.json'));
  this.loadTable();
};

  newFileAlertAnswer = (newFileName) => {
    this.setState({newFileAlertOpen: false});
    if(newFileName != '') {
      var filename = path.join(this.state.exptDir, newFileName);
      fs.writeFileSync(filename, '');
    }
    this.loadTable();
  };

  deleteFileAlertAnswer = (response) => {
    this.setState({deleteFileAlertOpen: false});
    if (response) {
      var filename = path.join(this.state.exptDir, this.state.selection);
      fs.unlinkSync(filename);
    }
    this.loadTable();
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
      <button class="eb" onClick={this.savefile}>Save</button>
      <button class="eb" onClick={this.newfile}>New File</button>
      <button class="eb" onClick={this.deletefile}>Delete</button>
      <button class="eb" onClick={this.resetparams}>Reset Params</button>
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
              />              
          </Card>
          {buttons}
          {filesComponent}
          </div>;      
    }
    else if (this.state.selectedEditor.value == 'turbidostat') {
      editorComponent = <div><TstatEditor onSave={this.handleSaveParameters}/></div>
    }

    return (
      <div>
          
          <h2 className="editorTitle"> Experiment Editor: <span style={{color:"#f58245"}}>{this.state.exptName}</span></h2>
          
          {editorComponent}
          
          {selector}
          <NewFileModal
            alertOpen = {this.state.newFileAlertOpen}
            alertQuestion = {this.state.newFileAlertDirections}
            onAlertAnswer = {this.newFileAlertAnswer} />     

          <DeleteFileModal
            alertOpen = {this.state.deleteFileAlertOpen}
            alertQuestion = {this.state.deleteFileAlertDirections}
            onAlertAnswer = {this.deleteFileAlertAnswer} />

        <Link className="expEditorHomeBtn" id="experiments" to={routes.EXPTMANAGER}><FaArrowLeft/></Link>                  
      </div>
    );
  }
}

export default withStyles(styles)(ScriptEditor);
