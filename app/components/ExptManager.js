// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import RunScript from './python-shell/RunScript'
import {FaArrowLeft} from 'react-icons/fa';
import ScriptFinder from './python-shell/ScriptFinder'
import Card from '@material-ui/core/Card';
import ScriptEditor from './python-shell/ScriptEditor'
import GitConnections from './git-connections/GitConnections'


const styles = {
  cardRoot: {
    width: 420,
    height: 350,
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
  cardEditor:{
    width: 670,
    height: 800,
    top: '50px',
    left: '440px',
    padding: '10px'
  }

};


class ExptManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptDir: '/legacy/data/',
      activeScript: '',
    };
  }

  handleSelectFolder = (activeFolder) => {
    var exptDir = this.state.scriptDir + activeFolder
    var activeScript = activeFolder
    if (this.state.exptDir !== exptDir){
      this.setState({exptDir: exptDir, activeScript: activeScript});
    }
  }

  render() {
    const { classes } = this.props;



    return (
      <div>
        <h2 className="managerTitle"> eVOLVER Scripts </h2>

        <Card classes={{root:classes.cardRoot}} className={classes.cardScript}>
          <ScriptFinder subFolder={this.state.scriptDir} isScript= {true} onSelectFolder={this.handleSelectFolder}/>
        </Card>

        <Card classes={{root:classes.cardRoot}} className={classes.cardEditor}>
          <ScriptEditor className='scriptEditor' activeScript={this.state.activeScript}/>
        </Card>
        <Link className="expManagerHomeBtn" id="experiments" to={routes.HOME}><FaArrowLeft/></Link>
        <GitConnections/>
      </div>
    );
  }
}

export default withStyles(styles)(ExptManager);
