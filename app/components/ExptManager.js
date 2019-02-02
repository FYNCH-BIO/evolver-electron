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
import Card from '@material-ui/core/Card';


const styles = {
  cardRoot: {
    width: 420,
    height: 290,
    position: 'absolute',
    backgroundColor: 'black',
    verticalAlign: 'bottom',
    overflowX: 'hidden',
    overflowY: 'scroll',
    padding: '5px 0px 15px 15px'
  },
  cardScript:{
    top: '60px',
    left: '30px',
  },
  cardExpt:{
    top: '370px',
    left: '30px'
  }

};


class ExptManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptDir: '/legacy/data/',
      exptDir: ''
    };
  }

  handleSelectFolder = (activeFolder) => {
    var exptDir = this.state.scriptDir + activeFolder
    console.log(exptDir)
    if (this.state.exptDir !== exptDir){
      this.setState({exptDir: exptDir});
    }
  }

  handleSelectExpt = (activeFolder) => {
    console.log(activeFolder)
    console.log(this.state.exptDir)
  }

  render() {
    const { classes } = this.props;



    return (
      <div>
        <h2 className="managerTitle"> eVOLVER Scripts </h2>
        <DragAndDrop/>

        <Card classes={{root:classes.cardRoot}} className={classes.cardScript}>
          <ScriptFinder subFolder={this.state.scriptDir} onSelectFolder={this.handleSelectFolder}/>
        </Card>

        <Card classes={{root:classes.cardRoot}} className={classes.cardExpt}>
          <ScriptFinder subFolder={this.state.exptDir} onSelectFolder={this.handleSelectExpt}/>
        </Card>

        <Link className="expManagerHomeBtn" id="experiments" to={routes.HOME}><FaArrowLeft/></Link>
      </div>
    );
  }
}

export default withStyles(styles)(ExptManager);
