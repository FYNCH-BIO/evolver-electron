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
        <Link className="backHomeBtn" id="experiments" to={{pathname:routes.HOME, socket: this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>

        <div className="centered">
            <h1 className="display-2 centered">Calibrations Menu</h1>
            <Link to={{pathname:routes.DENSITYCALIBRATIONS, socket:this.props.socket, logger:this.props.logger}}><button className = "btn btn-lg homeButtons">O.D</button></Link>
            <Link to={{pathname:routes.TEMPCALIBRATIONS, socket:this.props.socket, logger:this.props.logger}}><button className = "btn btn-lg homeButtons">TEMP</button></Link>
        </div>

      </div>

    );
  }
}

export default withStyles(styles)(CalibrationsMenu);
