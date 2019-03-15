import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AceEditor from 'react-ace';

import 'brace/mode/python';
import 'brace/theme/chaos';

var fs = require('fs')
const remote = require('electron').remote;
const app = remote.app;

const styles = {

};

class ScriptEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      activeScript: this.props.activeScript,
      scriptContent: ''
    };
  }

  componentDidMount(){
  }

  componentDidUpdate(prevProps) {
    if (this.props.activeScript !== prevProps.activeScript) {
      console.log(this.props.activeScript)
      if (this.props.activeScript !== 'undefined'){
        this.readfile(this.props.activeScript)
        this.setState({
          activeScript: this.props.activeScript,
        })
      }
    }
  }

  onChange = (newValue) => {
    console.log(newValue);
  }

  readfile = (scriptName) => {
    var filename = app.getPath('userData') + '/legacy/data/' + scriptName;
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

    return (
      <div>
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
      </div>
    );
  }
}

export default withStyles(styles)(ScriptEditor);
