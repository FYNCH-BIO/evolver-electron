// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import RunScript from './python-shell/RunScript'
import {FaArrowLeft} from 'react-icons/fa';
import DragAndDrop from './python-shell/DragAndDrop';
import ScriptFinder from './python-shell/ScriptFinder'

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
        <h2 className="managerTitle"> eVOLVER Scripts </h2>
        <DragAndDrop/>
        <ScriptFinder/>
        <Link className="expManagerHomeBtn" id="experiments" to={routes.HOME}><FaArrowLeft/></Link>
      </div>
    );
  }
}

export default withStyles(styles)(ExptManager);
