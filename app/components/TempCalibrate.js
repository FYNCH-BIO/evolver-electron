// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft} from 'react-icons/fa';


const styles = {

};


class TempCal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div>
        <Link className="backHomeBtn" id="experiments" to={routes.CALMENU}><FaArrowLeft/></Link>


      </div>

    );
  }
}

export default withStyles(styles)(TempCal);
