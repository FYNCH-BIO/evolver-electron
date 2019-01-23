// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import io from 'socket.io-client'

var fs = require('fs');

type Props = {};

export default class Home extends Component<Props> {
  constructor(props) {
      super(props);
      if (this.props.socket) {
        this.socket = this.props.socket;
      }
      else {
        this.socket = io.connect("http://localhost:8081/dpu-evolver", {reconnect:true});
        this.socket.on('connect', function(){console.log("Connected evolver");}.bind(this));
        this.socket.on('disconnect', function(){console.log("Disconnected evolver")});
        this.socket.on('reconnect', function(){console.log("Reconnected evolver")});
        this.socket.on('calibration', function (data) {
            fs.readdir('./calibrations', (err, files) => {
                var latestODFile;
                var latestTimeStamp = 0;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].includes('od')) {
                        // assumes file name format "od_cal_<TIMESTAMP">.json"
                        var timeStamp = files[i].split("_")[2].split(".")[0];
                        if (timeStamp > latestTimeStamp) {
                            latestTimeStamp = timeStamp;
                            latestODFile = files[i];
                        }
                    }
                }
                fs.readFile('./calibrations/' + latestODFile, (err, data) => {
                    var calibrationData = JSON.parse(data);
                    this.socket.emit('calibrationdata', calibrationData);
                });
            });
        }.bind(this));
      }
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
            <Link to={{pathname:routes.SETUP, socket:this.socket}}><button className = "btn btn-lg homeButtons">SETUP</button></Link>
            <Link to={{pathname:routes.CALMENU, socket:this.socket}}><button className = "btn btn-lg homeButtons">CALIBRATIONS</button></Link>
            {/*<Link to={routes.GRAPHING}><button className = "btn btn-lg homeButtons">VISUALIZATION</button></Link>
            */}
        </div>
      </div>
    );
  }
}
