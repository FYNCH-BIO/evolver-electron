// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import io from 'socket.io-client'
import log4js from 'log4js';

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

export default class Home extends Component<Props> {
  constructor(props) {
      super(props);
      if (this.props.socket) {
        this.socket = this.props.socket;
      }
      else {
        // this.socket = io.connect("http://localhost:8081/dpu-evolver", {reconnect:true});
        this.socket = io.connect("http://192.168.1.4:8081/dpu-evolver", {reconnect:true});
        this.socket.on('connect', function(){console.log("Connected evolver");}.bind(this));
        this.socket.on('disconnect', function(){console.log("Disconnected evolver")});
        this.socket.on('reconnect', function(){console.log("Reconnected evolver")});
      }

      if (this.props.logger){
        this.logger = this.props.logger;
      } else {
        this.logger = setupLogger();
      }
      this.logger.info("Routed to Home Page.");
  }

  componentDidMount() {
    console.log(process)
    console.log(this.socket)
    console.log(this.logger)
  }

  props: Props;

  render() {
    return (
      <div>
        <div className="centered">
            <div className="p-5"/>
            <div className="p-5"/>
            <h1 className="display-2 centered">eVOLVER</h1>
            <p className="font-italic"> Continuous Culture </p>
            <Link to={{pathname:routes.SETUP, socket:this.socket, logger:this.logger}}><button className = "btn btn-lg homeButtons">SETUP</button></Link>
            <Link to={{pathname:routes.CALMENU, socket:this.socket, logger:this.logger}}><button className = "btn btn-lg homeButtons">CALIBRATIONS</button></Link>
            {/*<Link to={routes.GRAPHING}><button className = "btn btn-lg homeButtons">VISUALIZATION</button></Link>
            */}
        </div>
      </div>
    );
  }
}
