// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import {PythonShell} from 'python-shell';
import parsePath from 'parse-filepath';
import log4js from 'log4js';

const styles = {

};

let pyshell;

function setupPyShell(filePath, logPath) {
  let options = {
    pythonOptions: ['-u'], // get print results in real-time
    args: ['value1', 'value2', 'value3', 'value4']
  };

  pyshell = new PythonShell(filePath,options);

  return pyshell
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
  return logger
}

class RunScript extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filePath: '',
      scriptStarted: false,
      logPath: '',
    };
  }

  handleButton = () => {

    const logger = setupLogger(this.state.logPath);
    pyshell = setupPyShell(this.state.filePath, this.state.logPath);

    logger.info("Starting Experiment Script");
    pyshell.on('message', function (message){ logger.info(message) });

    pyshell.end(function (err,code,signal) {
      if (err) throw err;
      logger.info("Script Exited");
      this.setState({scriptStarted: false})
    }.bind(this));

    this.setState({scriptStarted: true})
  }

  handleStop = () => {
    pyshell.terminate()
    this.setState({scriptStarted: false})
  }

  handleFilePath = () => {
    let parsedDirectory = parsePath(document.getElementsByTagName('input')[0].files[0].path)
    const remote = require('electron').remote;
    const app = remote.app;
    console.log(app.getPath('userData'));

    this.setState({
      filePath: document.getElementsByTagName('input')[0].files[0].path,
      logPath: parsedDirectory.dir})
  }

  render() {

    let runExptBtns;
    if (!this.state.scriptStarted) {
      runExptBtns = <button type="button" className="scriptSubmitBtn" onClick={this.handleButton}> Run Code </button>
    }
    else {
      runExptBtns = <button type="button" className="scriptSubmitBtn" onClick={this.handleStop}> Stop Code </button>

    }

    return (
      <div>
        {runExptBtns}
        <input className= "managerFileInput" type="file" onChange={this.handleFilePath}/>

      </div>

    );
  }
}

export default withStyles(styles)(RunScript);
