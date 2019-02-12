// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import AceEditor from 'react-ace';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import 'brace/mode/elixir';
import 'brace/theme/terminal';

const styles = theme =>  ({
  card: {
    position: 'absolute',
    top: '396px',
    left: '40px',
    width: 446,
    height: 223,
    backgroundColor: 'transparent',
    outline: '2px white solid '
  },
  header: {
    display: 'flex',
    height: 5,
    padding: '5px 0px 0px 10px',
    backgroundColor: 'black',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
});



class SetupLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedText: '',
      command: this.props.command
    };
    this.props.socket.on('commandbroadcast', function(response) {
      this.setState({
        loggedText: 'Response: ' + response['param'] + ' command executed.' + '\n' + this.state.loggedText
      })
      }.bind(this))
  }

  componentDidMount(){
    if (this.props.socket.connected){
      this.setState({loggedText: 'eVOLVER Connected \n'})
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.command !== prevProps.command) {
      this.addLoggedText(this.props.command);
      this.setState({ command: this.props.command})
    }
  }


  addLoggedText = (command) => {
    var vials = command['message']
    var triggeredVials = '';
    for (var i = 0; i < vials.length; i++) {
      if (vials[i] !== 'NaN'){
        triggeredVials = triggeredVials + i + ',';
      }
    }
    triggeredVials = triggeredVials.slice(0, -1)
    this.setState({
      loggedText:
        'Command: Set ' + command['param'] + ' for vials (' + triggeredVials +')\n' + this.state.loggedText
    })
  }

  elementFocused = () => {
    console.log(this.props.socket)
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <Card className={classes.card}>
          <Paper square elevation={0} className={classes.header}>
            <Typography variant="h5" className={classes.headerText}> EXECUTED COMMANDS: </Typography>
          </Paper>
          <AceEditor
            ref="ace"
            className='commandbroadcast_log'
            value= {this.state.loggedText}
            width='440px'
            height='182px'
            mode="elixir"
            theme="terminal"
            fontSize={14}
            name="commandbroadcast_log"
            showGutter = {false}
            highlightActiveLine = {false}
            readOnly= {true}
            wrapEnabled = {true}
            onFocus = {this.elementFocused}
            editorProps={{$blockScrolling: true}}
            />
          </ Card>
      </div>

    );
  }
}

export default withStyles(styles, { withTheme: true })(SetupLog);
