// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft} from 'react-icons/fa';


const styles = {

};


class CalibrationsMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div>
        <Link className="backHomeBtn" style={{position: 'absolute', margin: '-196px 0px 0px 50px'}} id="experiments" to={{pathname:routes.HOME, socket: this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>

        <div className="centered">
            <h1 className="display-4 centered" style={{margin: '218px 0px 15px 0px', fontStyle: 'italic'}}>Calibration Menu</h1>
            <p style={{fontStyle: 'italic', fontSize: '22px'}}> Before eVOLVER use, please calibrate experimental parameters. </p>
            <Link to={{pathname:routes.DENSITYCALIBRATIONS, socket:this.props.socket, logger:this.props.logger}}><button className = "btn btn-lg homeButtons">O.D</button></Link>
            <Link to={{pathname:routes.TEMPCALIBRATIONS, socket:this.props.socket, logger:this.props.logger}}><button className = "btn btn-lg homeButtons">TEMP</button></Link>
        </div>

      </div>

    );
  }
}

export default withStyles(styles)(CalibrationsMenu);
