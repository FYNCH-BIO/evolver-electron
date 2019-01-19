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
        <Link className="backHomeBtn" id="experiments" to={routes.HOME}><FaArrowLeft/></Link>

        <div className="centered">
            <h1 className="display-2 centered">Calibrations Menu</h1>
            <Link to={routes.DENSITYCALIBRATIONS}><button className = "btn btn-lg homeButtons">O.D</button></Link>
            <Link to={routes.TEMPCALIBRATIONS}><button className = "btn btn-lg homeButtons">TEMP</button></Link>
        </div>

      </div>

    );
  }
}

export default withStyles(styles)(CalibrationsMenu);
