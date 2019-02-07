// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import io from 'socket.io-client'

type Props = {};

export default class Home extends Component<Props> {
  constructor(props) {
      super(props);
      if (this.props.socket) {
        this.socket = this.props.socket;
      }
      else {
        this.socket = io.connect("http://localhost:5558/dpu-evolver", {reconnect:true});
        this.socket.on('connect', function(){console.log("Connected evolver");}.bind(this));
        this.socket.on('disconnect', function(){console.log("Disconnected evolver")});
        this.socket.on('reconnect', function(){console.log("Reconnected evolver")});
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
            <Link to={routes.EXPTMANAGER}><button className = "btn btn-lg homeButtons">EXPT MANAGER</button></Link>

        </div>
      </div>
    );
  }
}
