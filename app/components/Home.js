// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import io from 'socket.io-client';
import log4js from 'log4js';
import ConfigModal from './evolverConfigs/ConfigModal';
import RelaunchModal from './RelaunchModal';

var fs = require('fs');
const Store = require('electron-store');
const { ipcRenderer } = require('electron');
const store = new Store();

const remote = require('electron').remote;
const app = remote.app;

type Props = {};

function setupLogger() {
  var currentDate = new Date();
  var date = currentDate.getDate();
  var month = currentDate.getMonth(); //Be careful! January is 0 not 1
  var year = currentDate.getFullYear();
  var dateString = date + "-" +(month + 1) + "-" + year;
  var logPath =  app.getPath('userData') + '/logs/'+ dateString + '.log'
  console.log(logPath)

  log4js.configure({
    appenders: {
      out: { type: 'stdout' },
      app: { type: 'file', filename: logPath}
    },
    categories: {default: { appenders: ['app' ], level: 'info' }}
  });
  const logger = log4js.getLogger('app');
  return logger
}

function isPi() {
  var pi_module_no = [
    'BCM2708',
    'BCM2709',
    'BCM2710',
    'BCM2835',
    'BCM2837B0'
  ];

  var cpuInfo;
  try {
    cpuInfo = fs.readFileSync('/proc/cpuinfo', { encoding: 'utf8' });
    console.log(cpuInfo)
  } catch (e) {
    return false;
  }

  var model = cpuInfo
    .split('\n')
    .map(line => line.replace(/\t/g, ''))
    .filter(line => line.length > 0)
    .map(line => line.split(':'))
    .map(pair => pair.map(entry => entry.trim()))
    .filter(pair => pair[0] === 'Hardware')

  if(!model || model.length == 0) {
    return false;
  }

  var number =  model[0][1];
  return pi_module_no.indexOf(number) > -1;
}

function checkExpts() {
  if (store.get('first_visit') == true && store.get('running_expts').length > 0) {
    return true;
  } else {
    return false;
  };
};

export default class Home extends Component<Props> {
  constructor(props) {
      super(props);
      this.state = {
        isPi: false,
        alertOpen: false
      }
      if (this.props.socket && store.has('activeEvolver')) {
        this.state.socket = this.props.socket;
      }
      else {
        if (!isPi() && store.has('activeEvolver')){
          var ip = store.get('activeEvolver').value;
          ipcRenderer.send('active-ip', ip)
	        var socketString = "http://" + ip + ":8081/dpu-evolver";
          this.state.socket = io.connect(socketString, {reconnect:true});
          this.state.evolverIp = ip;
        } else {
            this.state.socket = io.connect(socketString, {reconnect:true});
            this.state.evolverIp = ip;
        }
        this.state.socket.on('reconnect', function(){console.log("Reconnected evolver")});
      }

      this.state.socket.on('connect', function(){console.log("Connected evolver");}.bind(this));
      this.state.socket.on('disconnect', function(){console.log("Disconnected evolver")});

      if (this.props.logger){
        this.logger = this.props.logger;
      } else {
        this.logger = setupLogger();
      }
      this.logger.info("Routed to Home Page.");
  }

  props: Props;

  componentDidMount() {
    if (store.get('first_visit') == null) {
      store.set('first_visit', true);
    } else {
      store.set('first_visit', false);
    };

    console.log(this.state.socket)
    this.setState({
      isPi:isPi(),
      alertOpen: checkExpts()
    })
  }

  handleSelectEvolver = (selectedEvolver) => {
    var socketString = "http://" + selectedEvolver.value + ":8081/dpu-evolver";
    var socket = io.connect(socketString, {reconnect:true});
    this.state.socket.on('connect', function(){console.log("Connected evolver")});
    this.state.socket.on('disconnect', function(){console.log("Disconnected evolver")});
    this.state.socket.on('reconnect', function(){console.log("Reconnected evolver")});
    this.setState({'socket': socket, 'evolverIp': selectedEvolver.value})
    store.set('activeEvolver', selectedEvolver)
  }

  handleYes = () => {
    ipcRenderer.send('kill-expts', {relaunch: true});
    this.setState({alertOpen: false,});
    store.set('first_visit', false);
  }

  handleNo = () => {
    ipcRenderer.send('kill-expts', {relaunch: false})
    this.setState({alertOpen: false});
    store.set('first_visit', false);
  };

  render() {
    var links = (isPi() ? <div><Link to={{pathname:routes.SETUP, socket:this.state.socket, logger:this.logger}}><button className = "btn btn-lg homeButtons">SETUP</button></Link></div> :
      <div>
        <Link to={{pathname:routes.SETUP, socket:this.state.socket, logger:this.logger}}><button className = "btn btn-lg homeButtons">SETUP</button></Link>
        <Link to={{pathname:routes.CALMENU, socket:this.state.socket, logger:this.logger}}><button className = "btn btn-lg homeButtons">CALIBRATIONS</button></Link>
        <Link to={{pathname:routes.EXPTMANAGER, socket:this.state.socket, logger:this.logger, evolverIp: this.state.evolverIp}}><button className = "btn btn-lg homeButtons">EXPT MANAGER</button></Link>
      </div>);

    var foundExpts = [];
    for (var i = 0; i < store.get('running_expts').length; i++) {
      var temp = store.get('running_expts')[i].path;
      foundExpts.push(temp.split('/').pop());
    }
    var question = `The following experiments were not properly ended prior to opening the application. Would you like to continue them?`;

    return (
      <div>
      <RelaunchModal
        alertOpen= {this.state.alertOpen}
        alertQuestion = {question}
        alertExperiments = {foundExpts.join("\n")}
        onClickYes = {this.handleYes}
        onClickNo = {this.handleNo}/>;
        <div className="centered">
            <div className="p-5"/>
            <div className="p-5"/>
            <h1 className="display-2 centered">eVOLVER</h1>
            <p className="font-italic"> Continuous Culture </p>
            {links}
        </div>
        <div className='homeConfigBtn'>
          <ConfigModal socket= {this.state.socket} isPi= {this.state.isPi}  onSelectEvolver={this.handleSelectEvolver}/>
        </div>
      </div>
    );
  }
}
