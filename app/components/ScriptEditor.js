import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AceEditor from 'react-ace';
import Card from '@material-ui/core/Card';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import {FaArrowLeft} from 'react-icons/fa';
import TstatEditor from './TstatEditor'

import 'brace/mode/python';
import 'brace/theme/chaos';

var fs = require('fs');
var path = require('path');
const remote = require('electron').remote;
const app = remote.app;

const styles = {
  cardRoot: {
    width: 1000,
    height: 1000,
    position: 'absolute',
    backgroundColor: 'black',
    verticalAlign: 'bottom',
    horizontalAlign: 'left',
    padding: '5px 0px 15px 15px'
  },
  cardEditor:{
    top: '60px',
    left: '450px',
    overflowY: 'auto'
  },
  cardPyshell: {
    top: '200px',
    left: '30px',
  }
};

class ScriptEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      exptDir: this.props.exptDir,
      scriptContent: ''
    };
    console.log(this.props.exptDir);
    this.readfile('custom_script.py');
  }

  componentDidMount(){
      }

  componentDidUpdate(prevProps) {
    if (this.props.exptDir !== prevProps.exptDir) {
      console.log(this.props.exptDir)
      if (this.props.exptDir !== 'undefined'){
        this.readfile('custom_script.py');
        this.setState({
          exptDir: this.props.exptDir,
        })
      }
    }
  }

  onChange = (newValue) => {
    console.log(newValue);
  }

  readfile = (scriptName) => {
    var filename = path.join(this.state.exptDir, scriptName);
    var scriptContent;
    console.log(filename)
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) throw err;
      console.log('OK: ' + filename);
      this.setState({scriptContent: data})
    }.bind(this));
  }

  render() {
    const { classes } = this.props;
    var tstatParameterPath = path.join(this.state.exptDir, 'tstat_parameters.json');
    var editorComponent;
    
    editorComponent = fs.existsSync(tstatParameterPath) ? editorComponent = <div><TstatEditor tstatParameters={tstatParameterPath}/></div> : <Card classes={{root:classes.cardRoot}} className={classes.cardEditor}>
            <AceEditor
              value= {this.state.scriptContent}
              width='630px'
              height='550px'
              mode="python"
              theme="chaos"
              onChange={this.onChange}
              name="pythonScriptEditor"
              editorProps={{$blockScrolling: true}}
              />              
          </Card>;
        
    return (
      <div>
          <h2 className="editorTitle"> Experiment Editor </h2>
          {editorComponent}
          <Link className="expEditorHomeBtn" id="experiments" to={routes.EXPTMANAGER}><FaArrowLeft/></Link>
      </div>
    );
  }
}

export default withStyles(styles)(ScriptEditor);
