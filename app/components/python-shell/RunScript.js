// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import parsePath from 'parse-filepath';
import log4js from 'log4js';

const {BrowserWindow} = require('electron').remote;
const dialog = require('electron').remote.dialog;
const remote = require('electron').remote;
const { ipcRenderer } = require('electron');

const styles = {

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

function setupLogger(logPath) {
  log4js.configure({
    appenders: {
      out: { type: 'stdout' },
      app: { type: 'file', filename: logPath + '/application.log' }
    },
    categories: {
      default: { appenders: ['app' ], level: 'info' }
    }
  });

  const logger = log4js.getLogger('app');
  return logger;
}

class RunScript extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filePath: props.directory,
      scriptStarted: [],
      pausedExpts: [],
      logPath: ''
    };    
    
    ipcRenderer.on('to-renderer', (event, arg) => {
        console.log(arg);
    });

    ipcRenderer.on('running-expts', (event, arg) => {
        console.log('running');
        console.log(arg);
        this.setState({scriptStarted: arg});
    });
    
    ipcRenderer.on('paused-expts', (event, arg) => {
        console.log('paused');
        console.log(arg);        
        this.setState({pausedExpts: arg});
    });
    
    ipcRenderer.send('paused-expts');
    ipcRenderer.send('running-expts');
  }

  handleStart = () => {      
    startScript(this.props.directory);
    setTimeout(function () {
        ipcRenderer.send('paused-expts');
        ipcRenderer.send('running-expts');
    }, 1000);
  }

  handleStop = () => {
    ipcRenderer.send('stop-script', this.props.directory);
    setTimeout(function () {
        ipcRenderer.send('paused-expts');
        ipcRenderer.send('running-expts');
    }, 1000);
  }
  
  handlePause = () => {
    ipcRenderer.send('pause-script', this.props.directory);
    setTimeout(function () {
        ipcRenderer.send('paused-expts');
        ipcRenderer.send('running-expts');
    }, 1000);   
      
  }
  
  handleRestart = () => {
    ipcRenderer.send('restart-script', this.props.directory);
    setTimeout(function () {
        ipcRenderer.send('paused-expts');
        ipcRenderer.send('running-expts');
    }, 1000);
  }

  render() {

    let runExptBtns;
    if (this.state.scriptStarted.indexOf(this.props.directory) != -1) {
        runExptBtns = <button type="button" className="scriptSubmitBtn" onClick={this.handleStop}> Stop Code </button>
    }
    else {
        runExptBtns = <button type="button" className="scriptSubmitBtn" onClick={this.handleStart}> Run Code </button>
    }       

    return (
        <div>
            {runExptBtns}
            <button type="button" className="scriptSubmitBtn" onClick={this.handlePause}> Pause Code </button>
            <button type="button" className="scriptSubmitBtn" onClick={this.handleRestart}> Restart Code </button>
        </div>
    );
  }
}

export default withStyles(styles)(RunScript);
