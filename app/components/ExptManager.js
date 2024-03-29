// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft, FaPen} from 'react-icons/fa';
import ScriptFinder from './python-shell/ScriptFinder'
import Card from '@material-ui/core/Card';
const { ipcRenderer } = require('electron');
import ModalClone from './python-shell/ModalClone';
import ModalReset from './python-shell/ModalReset';
import ReactTooltip from 'react-tooltip';

const remote = require('electron').remote;
const app = remote.app;
const http = require('https');
const Store = require('electron-store');
const store = new Store();
const { dialog } = require('electron').remote

var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');
var os = require('os');

const filesToCopy = ['custom_script.py', 'eVOLVER.py', 'nbstreamreader.py', 'pump_cal.txt', 'eVOLVER_parameters.json'];

const styles = {
  cardRoot: {
    width: 1000,
    height: 1000,
    position: 'absolute',
    backgroundColor: 'black',
    verticalAlign: 'bottom',
    horizontalAlign: 'left',
    padding: '5px 0px 15px 15px'
  },
  cardScript:{
    top: '60px',
    left: '75px',
    overflowY: 'auto'
  }
};

function startScript(exptDir) {
    ipcRenderer.send('start-script', exptDir);
};

class ExptManager extends React.Component {
  constructor(props) {
    super(props);
    var exptLocation = app.getPath('userData');
    if (store.get('exptLocation')) {
        exptLocation = store.get('exptLocation');
    }
    this.state = {
      scriptDir: 'experiments',
      exptLocation: exptLocation,
      activeScript: '',
      runningExpts: [],
      alertOpen: false,
      resetOpen: false,
      resetQuestion: 'Are you sure you want to reset this experiment? All data will be deleted.',
      alertDirections: 'Enter new experiment name',
      exptToClone: '',
      refind: false,
      evolverIp: this.props.evolverIp            
    };

    ipcRenderer.on('to-renderer', (event, arg) => {
    });

    ipcRenderer.on('running-expts', (event, arg) => {
        this.setState({runningExpts: arg, disablePlay: false});
    });

    ipcRenderer.send('running-expts');

    ipcRenderer.on('get-ip', (event, arg) => {
        console.log('We just got ip from main for some reason ' + arg);
      this.setState({evolverIp: arg});
      });
    if (!fs.existsSync(path.join(app.getPath('userData'), this.state.scriptDir))) {
      fs.mkdirSync(path.join(app.getPath('userData'), this.state.scriptDir));
      fs.mkdirSync(path.join(app.getPath('userData'), 'template'));
      var customScriptFile = fs.createWriteStream(path.join(this.state.exptLocation, 'template', 'custom_script.py'));
      var evolverFile = fs.createWriteStream(path.join(this.state.exptLocation, 'template', 'eVOLVER.py'));
      var nbstreamreaderFile = fs.createWriteStream(path.join(this.state.exptLocation, 'template', 'nbstreamreader.py'));
      var customScriptRequest = http.get("https://raw.githubusercontent.com/FYNCH-BIO/dpu/master/experiment/template/custom_script.py", function(response) {response.pipe(customScriptFile); console.log('done saving stuff');});
      var evolverRequest = http.get("https://raw.githubusercontent.com/FYNCH-BIO/dpu/master/experiment/template/eVOLVER.py", function(response) {response.pipe(evolverFile)});
      var nbstreamreaderRequest = http.get("https://raw.githubusercontent.com/FYNCH-BIO/dpu/master/experiment/template/nbstreamreader.py", function(response) {response.pipe(nbstreamreaderFile)});
    }
  }

  handleSelectFolder = (activeFolder) => {
    var exptDir = path.join(this.state.exptLocation, this.state.scriptDir, activeFolder);
    var activeScript = activeFolder + '/' + 'custom_script.py';
    if (this.state.exptDir !== exptDir){
      this.setState({exptDir: exptDir, activeScript: activeScript});
    }
  }

  handleStart = (script) => {
    startScript(path.join(this.state.exptLocation, this.state.scriptDir, script));
    this.setState({disablePlay: true});
    console.log("starting received");
  }

  handleStop = (script) => {
    ipcRenderer.send('stop-script', path.join(this.state.exptLocation, this.state.scriptDir, script));
  }

  handleContinue = (script) => {
     ipcRenderer.send('continue-script', path.join(this.state.exptLocation, this.state.scriptDir, script));
  };

    handleEdit = (script) => {
    };

    handleGraph = (script) => {
    };

    handleClone = (script) => {
        this.setState({alertOpen: true});
    };

    handleReset = (script, running) => {
      if (running) {
        this.setState({resetOpen: true, resetQuestion: 'Cannot reset a running experiment. Please stop the experiment before resetting.', ableToReset: false});
      }
      else {
        this.setState({resetOpen: true, resetQuestion: 'Are you sure you want to reset this experiment? All data will be deleted.', exptToReset: script, ableToReset: true});
      }
    };

    onResumeReset = (reset) => {
      this.setState({resetOpen: false});
      if (reset) {
        rimraf(path.join(this.state.exptLocation, this.state.scriptDir, this.state.exptToReset, 'data'), function() {console.log('removed expt data')});
      }
    };

    onResumeClone = (exptName) => {
        this.setState({alertOpen: false});
        if (exptName !== false) {
          this.createNewExperiment(exptName, this.state.exptToClone);
        }
    };

    createNewExperiment = (exptName) => {
        var newDir = path.join(this.state.exptLocation, this.state.scriptDir, exptName);
        var oldDir = path.join(app.getPath('userData'), "template");
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir);
        }
        filesToCopy.forEach(function (filename) {
          if (fs.existsSync(path.join(oldDir, filename))) {
            fs.copyFileSync(path.join(oldDir, filename), path.join(newDir, filename));
          }
        });
        this.setState({refind: !this.state.refind});
    }
    
    resetDefaultExptDir = () => {
        this.setState({exptLocation: app.getPath('userData')});
        store.set('exptLocation', app.getPath('userData'));
    }
    
    changeExptDirectory = () => {
        var exptDirectory = this.state.exptLocation;
        var isWin = os.platform() === 'win32';
        if (!isWin) {
            exptDirectory = dialog.showOpenDialog({properties: ['openDirectory']});
        }
        else {
            exptDirectory = dialog.showOpenDialog({properties: ['openDirectory']});
        }
        var exptLocation = exptDirectory[0];
        var basename = path.basename(exptLocation);
        if (basename === this.state.scriptDir) {
            exptLocation = path.dirname(exptLocation);
        }
        this.setState({exptLocation: exptLocation});
        store.set('exptLocation', exptLocation);
    }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <h2 className="managerTitle"> eVOLVER Scripts </h2>
        <div className="directoryDiv"><span style={{fontWeight: "bold"}}>Expt Directory: </span><span className="expt-dir-text" style={{color:"#f58245"}}>{path.join(this.state.exptLocation, this.state.scriptDir)}</span><button class="expt-dir-btn" data-tip="Change Expt Directory." onClick={this.changeExptDirectory}><FaPen size={15}/></button></div>
        <Card classes={{root:classes.cardRoot}} className={classes.cardScript}>
          <ScriptFinder subFolder={this.state.scriptDir}
            isScript= {true}
            onSelectFolder={this.handleSelectFolder}
            onEdit={this.handleEdit}
            onGraph={this.handleGraph}
            onStart={this.handleStart}
            onStop={this.handleStop}
            onContinue={this.handleContinue}
            runningExpts={this.state.runningExpts}
            refind={this.state.refind}
            evolverIp = {this.state.evolverIp}
            disablePlay = {this.state.disablePlay}
            exptLocation = {this.state.exptLocation}/>
        </Card>
        <Link className="expManagerHomeBtn" id="experiments" to={routes.HOME}><FaArrowLeft/></Link>
        <ReactTooltip />
        <button className="newExptButton" data-tip="Create a new experiment." onClick={this.handleClone}>New Experiment</button>
        <button className="resetDefaultExptDirButton" data-tip="Reset to the default experiment directory location."onClick={this.resetDefaultExptDir}>Default Expt Dir</button>
        <ModalClone
          alertOpen= {this.state.alertOpen}
          alertQuestion = {this.state.alertDirections}
          onAlertAnswer = {this.onResumeClone}/>
        <ModalReset
          resetOpen = {this.state.resetOpen}
          resetQuestion = {this.state.resetQuestion}
          onResetAnswer = {this.onResumeReset}
          ableToReset = {this.state.ableToReset}/>
      </div>
    );
  }
}

export default withStyles(styles)(ExptManager);
