// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import Navbar from './Navbar'

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <div className="centered">
            <div className="p-5"/>
            <div className="p-5"/>
            <h1 className="display-2 centered">eVOLVER</h1>
            <p className="font-italic"> Continuous Culture </p>
            <Link to={routes.SETUP}><button className = "btn btn-lg homeButtons">SETUP</button></Link>
            <Link to={routes.CALIBRATE}><button className = "btn btn-lg homeButtons">CALIBRATION</button></Link>
        </div>
      </div>
    );
  }
}
