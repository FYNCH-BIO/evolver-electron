// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft, FaPlay, FaChartBar, FaStop, FaCopy, FaSave, FaTrashAlt, FaFolderOpen, FaPen} from 'react-icons/fa';
import VialArrayGraph from './graphing/VialArrayGraph';
import VialArrayBtns from './graphing/VialArrayBtns';
import VialMenu from './graphing/VialMenu';
import AceEditor from 'react-ace';
import ReactTooltip from 'react-tooltip';
const { ipcRenderer } = require('electron');
import DeleteExptModal from './DeleteExptModal';
import ModalClone from './python-shell/ModalClone';

const remote = require('electron').remote;
const app = remote.app;
const { dialog } = require('electron').remote

const Store = require('electron-store');
const store = new Store();

var path = require('path');
var os = require('os');
var zipdir = require('zip-dir');
var fs = require('fs');
var Tail = require('tail').Tail;
var readline = require('readline');
var rimraf = require('rimraf');

const styles = {
};

const ymaxChoicesOD = ['0.1', '0.5', '1.0', '2.0'];
const ymaxChoicesTemp = ['30', '35', '40', '45'];
const xAxisNameOD = 'OPTICAL DENSITY';
const xAxisNameTemp = 'TEMPERATURE (C)';
const filesToCopy = ['custom_script.py', 'eVOLVER.py', 'nbstreamreader.py', 'pump_cal.txt', 'eVOLVER_parameters.json'];


class Graph extends React.Component {
  constructor(props) {
    super(props);
    var exptName = path.basename(this.props.exptDir);
    this.state = {
      exptDir: this.props.exptDir,
      exptName: exptName,
      ymax: '0.5',
      ymaxChoices: ymaxChoicesOD,
      ymaxTitle: 'YAXIS - MAX VALUE',
      timePlotted: '5h',
      timePlottedChoices: ['ALL', '5h', '12h', '24h'],
      timePlottedTitle: 'XAXIS - RECENT DATA:',
      downsample: 5,
      parameterChoices: ['OD', 'Temp'],
      parameter: 'OD',
      parameterTitle: 'PARAMETER:',
      xaxisName: xAxisNameOD,
      activePlot: 'ALL',
      logToggleText: 'VIEW LOGS',
      logToggleOptions: ['VIEW GRAPH', 'VIEW LOGS'],
      logToggleState: true,
      logData: '',
      disablePlay: false,
      changeNameDisabled: false,
      deleteExptAlertOpen: false,
      deleteExptAlertDirections: "",
      cloneOpen: false,
      cloneDirections: 'Enter a new experiment name:',
      exptLocation: app.getPath('userData') 
    };
    
    if (store.get('exptLocation')) {
        this.setState({exptLocation: store.get('exptLocation')});
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

  componentDidMount() {
    var options = {fromBeginning: false, follow: true, nLines: 200}
    var logFilename = path.join(this.props.exptDir, 'data', 'evolver.log');

    if (fs.existsSync(logFilename)) {
      var tail = new Tail(logFilename, options);
      const file = readline.createInterface({
        input: fs.createReadStream(logFilename)
        });
      var reverseFile = '';
      file.on('line', function(line){
        reverseFile = line + '\n' + reverseFile;
        }.bind(this));
      file.on('close', function(line){
        this.setState({logData: reverseFile});
        }.bind(this));

      tail.on("line", function(data) {
        var logData = this.state.logData;
        logData = data + '\n' + logData;
        this.setState({logData: logData});
      }.bind(this));
      tail.on("error", function(error) {
        console.log('ERROR: ', error);
      });
    } else {
      this.setState({logData: 'No log file found'})
    };
  }

  handleYmax = event => {
    console.log(event)
    this.setState({
      ymax: event
    })
  };

  handleTimePlotted = event => {
    var downsample;
    if (event == 'ALL'){
      downsample = -1;
    }
    if (event == '5h'){
      downsample = 5;
    }
    if (event == '12h'){
      downsample = 15;
    }
    if (event == '24h'){
      downsample = 20;
    }

    this.setState({
      timePlotted: event,
      downsample: downsample
    })
  };

  handleParameterSelect = event => {
    var ymaxChoices, ymax, xaxisName
    if (event == 'OD'){
      ymax = '0.5'
      ymaxChoices = ymaxChoicesOD;
      xaxisName = xAxisNameOD;
    }
    if (event == 'Temp'){
      ymax = '40'
      ymaxChoices = ymaxChoicesTemp;
      xaxisName = xAxisNameTemp;
    }
    this.setState({
      parameter: event,
      ymax: ymax,
      ymaxChoices: ymaxChoices,
      xaxisName: xaxisName,
    })
  }

  downloadData = () => {
    var pathToDownload;
    var isWin = os.platform() === 'win32';
    if (!isWin) {
      pathToDownload  = dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory']});
    }
    else {
      pathToDownload = dialog.showOpenDialog({properties: ['openDirectory', 'promptToCreate']});
    }

    var zipFilename = path.join(pathToDownload[0], path.basename(this.props.exptDir) + '.zip');
    zipdir(this.props.exptDir, {saveTo: zipFilename});
  }

  toggleLog = () => {
    var logToggleState = !this.state.logToggleState;
    var logToggleText = logToggleState ? this.state.logToggleOptions[1] : this.state.logToggleOptions[0];
    this.setState({logToggleState: logToggleState, logToggleText: logToggleText});
  }

  handleActivePlot = (event) => {
    this.setState({activePlot: event})
  }
  
  setAllGraphs = () => {
    this.setState({activePlot: 'ALL'});
  }
  
  handlePlay = (exptToPlay) => {
      ipcRenderer.send('start-script', exptToPlay);
      this.setState({disablePlay:true});
  }
  
  onStop = (exptToStop) => {
      ipcRenderer.send('stop-script', exptToStop);
  }
  
  handleReset = (exptToStop) => {
      var directions = "Are you sure you want to reset the experiment " + this.state.exptName + "?";
      this.setState({deleteExptAlertDirections: directions}, function() {
          this.setState({deleteExptAlertOpen: true});
      }.bind(this));
  }
  
  deleteExptAlertAnswer = (response) => {
      this.setState({deleteExptAlertOpen: false});
      if (response) {
          if (this.state.disablePlay) {
            ipcRenderer.send('stop-script', this.state.exptDir);
          }          
          if (fs.existsSync(path.join(this.state.exptDir, 'data'))) {
            rimraf.sync(path.join(this.state.exptDir, 'data'));              
          }          
      }
  }
  
  cloneExpt = () => {
      this.setState({cloneOpen: true});
  }
  
  onResumeClone = (exptName) => {
      this.setState({cloneOpen: false});
        if (exptName !== false) {
          this.createNewExperiment(exptName);
        }
  }
  
  handleDataZoom = () => {
      this.setState({timePlotted:'None'});      
  }
  
    createNewExperiment = (exptName) => {
        var newDir = path.join(this.state.exptLocation, 'experiments', exptName);
        var oldDir = path.join(this.state.exptDir);
        console.log(oldDir);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir);
        }
        filesToCopy.forEach(function (filename) {
          if (fs.existsSync(path.join(oldDir, filename))) {
            fs.copyFileSync(path.join(oldDir, filename), path.join(newDir, filename));
          }
        });
    }  

  render() {
    const { classes } = this.props;
      var backButton = this.state.activePlot == 'ALL' ? 
        <Link className="backHomeBtn" style={{zIndex: '10', position: 'absolute', top: '5px', left: '-20px'}} id="experiments" to={{pathname:routes.EXPTMANAGER, socket: this.props.socket, logger:this.props.logger, evolverIp: this.props.evolverIp}}><FaArrowLeft/></Link> :
        <button className="backHomeBtn" style={{zIndex: '10', position: 'absolute', top: '3px', left: '-55px'}}onClick={this.setAllGraphs}><FaArrowLeft/></button>;
      var exptName = path.basename(this.props.exptDir);
      var dataDisplay = this.state.logToggleState ?
        <VialArrayGraph
            parameter={this.state.parameter}
            exptDir={this.props.exptDir}
            activePlot = {this.state.activePlot}
            ymax={this.state.ymax}
            timePlotted={this.state.timePlotted}
            downsample = {this.state.downsample}
            yaxisName = {this.state.xaxisName}
            xaxisName = {'EXPERIMENT TIME (h)'}
            onDataZoom = {this.handleDataZoom}
            dataType = {{type: 'experiment'}}/> :
        <div className="logViewer"><AceEditor
            value={this.state.logData}
            width='750px'
            height='570px'
            mode="elixer"
            theme="terminal"
            readOnly={true}
            name="logViewer"
            showGutter={false}
            setOptions={{autoScrollEditorIntoView:true}}
            editorProps={{$blockScrolling: true}}/></div>
      var exptControlButtons = <div class="expt-buttons-graph">
        <ReactTooltip />
        {this.state.disablePlay ? <button class="ebfe" data-tip="Stop the experiment (end data collection and end culture routines)" onClick={() => this.onStop(this.state.exptDir)}><FaStop size={25}/></button> : <button data-tip="Start experiment (begin collecting data and execute culture routine)" class="ebfe" onClick={() => this.handlePlay(this.state.exptDir)} disabled={this.state.changeNameDisabled}><FaPlay size={25}/></button>}
        <button class="ebfe" data-tip="Reset experiment (delete all data)" onClick={() => this.handleReset(this.state.exptDir)}><FaTrashAlt size={25}/></button>
        <button class="ebfe" data-tip="Clone this experiment, creating a new one with identical configuration" onClick={() => this.cloneExpt()}><FaCopy size={25}/></button>
        </div>;

    return ( 
     <div>
        {backButton}
        <h4 className="graphTitle">{exptName}</h4>
        {dataDisplay}
        <div style={{position: 'absolute', top: '85px', left: '-10px'}}>
          <VialArrayBtns
            labels={this.state.parameterChoices}
            radioTitle = {this.state.parameterTitle}
            value={this.state.parameter}
            onSelectRadio={this.handleParameterSelect}/>
        </div>
        <div style={{position: 'absolute', top: '155px', left: '-10px'}}>
          <VialArrayBtns
            labels={this.state.timePlottedChoices}
            radioTitle = {this.state.timePlottedTitle}
            value={this.state.timePlotted}
            onSelectRadio={this.handleTimePlotted}/>
          <VialArrayBtns
            labels={this.state.ymaxChoices}
            radioTitle = {this.state.ymaxTitle}
            value={this.state.ymax}
            onSelectRadio={this.handleYmax}/>
        </div>
         {exptControlButtons}       
        <VialMenu onSelectGraph={this.handleActivePlot}/>
        <div className="dataActionButtons">
          <button className={"dataActionButton"} onClick={this.downloadData}>DOWNLOAD</button>
          <button className={"dataActionButton"} onClick={this.toggleLog}>{this.state.logToggleText}</button>
        </div>
        <DeleteExptModal
            alertOpen = {this.state.deleteExptAlertOpen}
            alertQuestion = {this.state.deleteExptAlertDirections}
            buttonText = "Reset"
            useLink = {false}
            value = {this.state.exptDir}
            onAlertAnswer = {this.deleteExptAlertAnswer} />
        <ModalClone
          alertOpen= {this.state.cloneOpen}
          alertQuestion = {this.state.cloneDirections}
          onAlertAnswer = {this.onResumeClone}/>
      </div>

    );
  }
}

export default withStyles(styles)(Graph);
