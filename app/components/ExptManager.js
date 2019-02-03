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
    top: '380px',
    left: '30px'
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
      exptDir: 'undefined',
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

  handleSelectExpt = (activeFolder) => {
    if (this.state.activeScript !== activeFolder){
      console.log(activeFolder)
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

        <h2 className="pastExptTitle"> Past Experiments </h2>

        <Card classes={{root:classes.cardRoot}} className={classes.cardExpt}>
          <ScriptFinder subFolder={this.state.exptDir} isScript= {false} onSelectFolder={this.handleSelectExpt}/>
        </Card>
        <Card classes={{root:classes.cardRoot}} className={classes.cardEditor}>
          <ScriptEditor className='scriptEditor' activeScript={this.state.activeScript}/>
        </Card>
        <Link className="expManagerHomeBtn" id="experiments" to={routes.HOME}><FaArrowLeft/></Link>
      </div>
    );
  }
}

export default withStyles(styles)(ExptManager);
