// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import RunScript from './python-shell/RunScript'
import {FaArrowLeft} from 'react-icons/fa';


const styles = {

};


class ExptManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div>
        <div className="RunScript centered">
          <RunScript/>
        </div>
        <Link className="backHomeBtn" id="experiments" to={routes.HOME}><FaArrowLeft/></Link>
      </div>

    );
  }
}

export default withStyles(styles)(ExptManager);
