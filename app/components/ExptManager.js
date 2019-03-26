// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft} from 'react-icons/fa';
import ScriptFinder from './python-shell/ScriptFinder'
import Card from '@material-ui/core/Card';
const { ipcRenderer } = require('electron');
import ModalClone from './python-shell/ModalClone';

const remote = require('electron').remote;
const app = remote.app;

const fs = require('fs');
const path = require('path');

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
  },
  cardPyshell: {
    top: '200px',
    left: '30px',
  }
};

function startScript(exptDir) {
    var temp_input = new Array(16);
    temp_input.fill(30);
    var stir_input = new Array(16);
    stir_input.fill(8);
    var lower_thresh = new Array(16);
    lower_thresh.fill(.2);
    var upper_thresh = new Array(16);
    upper_thresh.fill(.4);
    var volume = 20;
    var parameters = {'temp_input':temp_input, 'stir_input': stir_input, 'lower_thresh': lower_thresh, 'upper_thresh': upper_thresh, 'volume':volume};
    var evolverIp = 'localhost';
    var evolverPort = 5558;
    var name = 'testing_pyshell';
    ipcRenderer.send('start-script', ['start', {'zero':true, 'continue':false, 'overwrite':true, 'parameters':parameters, 'evolver-ip':evolverIp, 'evolver-port':evolverPort, 'name':name, 'script': exptDir}, exptDir]);        
}


class ExptManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptDir: '/legacy/data',
      activeScript: '',
      runningExpts: [],
      pausedExpts: [],
      alertOpen: false,
      alertDirections: 'Enter new experiment name',
      exptToClone: '',
      refind: false
    };
    
    ipcRenderer.on('to-renderer', (event, arg) => {
        console.log(arg);
    });

    ipcRenderer.on('running-expts', (event, arg) => {
        console.log('running');
        console.log(arg);
        this.setState({runningExpts: arg});
    });
    
    ipcRenderer.on('paused-expts', (event, arg) => {
        console.log('paused');
        console.log(arg);        
        this.setState({pausedExpts: arg});
    });
    
    ipcRenderer.send('paused-expts');
    ipcRenderer.send('running-expts');
  }

  handleSelectFolder = (activeFolder) => {
    var exptDir = app.getPath('userData') + this.state.scriptDir + '/' + activeFolder;
    var activeScript = activeFolder + '/' + 'custom_script.py';
    if (this.state.exptDir !== exptDir){
      this.setState({exptDir: exptDir, activeScript: activeScript});
    }
  }
  
  handleStart = (script) => {
    startScript(app.getPath('userData') + this.state.scriptDir + '/' + script);
    setTimeout(function () {
        ipcRenderer.send('paused-expts');
        ipcRenderer.send('running-expts');
    }, 1000);
  }

  handleStop = (script) => {
    ipcRenderer.send('stop-script', app.getPath('userData') + this.state.scriptDir + '/' + script);
    setTimeout(function () {
        ipcRenderer.send('paused-expts');
        ipcRenderer.send('running-expts');
    }, 1000);
  }
  
  handlePause = (script) => {
    ipcRenderer.send('pause-script', app.getPath('userData') + this.state.scriptDir + '/' + script);
    setTimeout(function () {
        ipcRenderer.send('paused-expts');
        ipcRenderer.send('running-expts');
    }, 1000);
  }
  
  handleContinue = (script) => {
     ipcRenderer.send('continue-script', app.getPath('userData') + this.state.scriptDir + '/' + script);
     setTimeout(function() {
        ipcRenderer.send('paused-expts');
        ipcRenderer.send('running-expts');
     });
   }
   
    handleEdit = (script) => {
    };

    handleGraph = (script) => {
         console.log(script);
    };

    handleClone = (script) => {
        this.setState({alertOpen: true, exptToClone: script});
    };

    onResumeClone = (exptName) => {
        this.setState({alertOpen: false});
        this.createNewExperiment(exptName, this.state.exptToClone);
        
    };
    
    createNewExperiment = (exptName, exptToClone) => {
        var newDir = path.join(app.getPath('userData') + this.state.scriptDir, exptName);
        var oldDir = path.join(app.getPath('userData') + this.state.scriptDir, exptToClone);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir);
        }
        fs.copyFileSync(path.join(oldDir, 'custom_script.py'), path.join(newDir, 'custom_script.py'));
        fs.copyFileSync(path.join(oldDir, 'eVOLVER_module.py'), path.join(newDir, 'eVOLVER_module.py'));
        fs.copyFileSync(path.join(oldDir, 'main_eVOLVER.py'), path.join(newDir, 'main_eVOLVER.py'));
        fs.copyFileSync(path.join(oldDir, 'nbstreamreader.py'), path.join(newDir, 'nbstreamreader.py'));
        this.setState({refind: !this.state.refind});
    }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <h2 className="managerTitle"> eVOLVER Scripts </h2>

        <Card classes={{root:classes.cardRoot}} className={classes.cardScript}>
          <ScriptFinder subFolder={this.state.scriptDir}
            isScript= {true} 
            onSelectFolder={this.handleSelectFolder}
            onClone={this.handleClone} 
            onEdit={this.handleEdit} 
            onGraph={this.handleGraph} 
            onStart={this.handleStart} 
            onStop={this.handleStop} 
            onPause={this.handlePause} 
            onContinue={this.handleContinue} 
            runningExpts={this.state.runningExpts} 
            pausedExpts={this.state.pausedExpts}
            refind={this.state.refind}/>
        </Card>
        
        <Link className="expManagerHomeBtn" id="experiments" to={routes.HOME}><FaArrowLeft/></Link>
        <ModalClone
          alertOpen= {this.state.alertOpen}
          alertQuestion = {this.state.alertDirections}
          onAlertAnswer = {this.onResumeClone}/>
      </div>      
    );
  }
}

export default withStyles(styles)(ExptManager);
