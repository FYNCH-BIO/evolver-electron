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
    height: 228,
    backgroundColor: 'transparent',
    outline: '2px white solid '
  },
  header: {
    display: 'flex',
    height: 5,
    padding: '10px 0px 0px 10px',
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
      command: this.props.command,
      linesLogged: 0,
      activeODCal:this.props.activeODCal,
      activeTempCal:this.props.activeTempCal
    };
    this.props.socket.on('connect', function() {this.addLoggedText('eVOLVER Connected', 'notification')}.bind(this))
    this.props.socket.on('disconnect', function() {this.addLoggedText('eVOLVER Disconnected', 'notification')}.bind(this))

    this.props.socket.on('commandbroadcast', function(response) {this.addLoggedText(response, 'response')}.bind(this))
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners('connect');
    this.props.socket.removeAllListeners('disconnect');
    this.props.socket.removeAllListeners('commandbroadcast');
  }

  componentDidMount(){
    if (this.props.socket.connected){
      this.addLoggedText('eVOLVER Connected', 'notification')
    } else {
      this.addLoggedText('eVOLVER Connection Error', 'notification')
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.command !== prevProps.command) {
      this.addLoggedText(this.props.command, 'command');
      this.setState({ command: this.props.command})
    }
    if (this.props.activeODCal !== prevProps.activeODCal) {
      this.addLoggedText('OD Cal set to ' + this.props.activeODCal, 'notification');
      this.setState({ activeODCal: this.props.activeODCal})
    }
    if (this.props.activeTempCal !== prevProps.activeTempCal) {
      this.addLoggedText('Temp Cal set to ' + this.props.activeTempCal, 'notification');
      this.setState({ activeTempCal: this.props.activeTempCal})
    }
  }

  addLoggedText = (data, inputType) => {
    var outputString;
    if (inputType == 'command'){
      outputString = 'Command: ' + data['param'] + ' command sent.'
    } else if (inputType == 'response'){
      var triggeredVials = '';
      var value = '';
      var in1 = false;
      var in2 = false;
      var efflux = false;
      var time_ON = 0;

      if (data['param'] == 'pump'){
        console.log(data)
        var vials = data.value;
        for (var i = 0; i < vials.length; i++) {
          if ((vials[i] != '--') && (i <= 15)){
            time_ON = vials[i];
            triggeredVials = triggeredVials + i + ',';
          };
          if ((vials[i] != '--') && (i <= 15)){in1 = true};
          if ((vials[i] != '--') && (i > 15) && (i <= 31)){efflux = true};
          if ((vials[i] != '--') && (i > 31) && (i <= 47)){in2 = true};
        }
        triggeredVials = triggeredVials.slice(0, -1);

        if (in1){value = value + 'in1, '};
        if (in2){value = value + 'in2, '};
        if (efflux){value = value + 'efflux, '};
        if (value == ''){
          outputString= 'Response: Nothing Changed, no pumps selected'
        } else {
          value = value.slice(0, -2);
          value = value + ' pumps'
          outputString = 'Response: ' + value + ' ON for ' + data.value.time + 's, vials (' + triggeredVials + ')'
        }
      } else {
        var vials = data['value'];
	      var value = [];
        for (var i = 0; i < vials.length; i++) {
          if (vials[i] !== 'NaN'){
            triggeredVials = triggeredVials + i + ',';
            if (data['param'] == "temp"){
              value.push(data['value'][i]);// + '\u00b0C');
            } else {
              value.push(data['value'][i]);
            }
          }
        }
        triggeredVials = triggeredVials.slice(0, -1);
        outputString = 'Response: Set ' + data['param'] + ' to ' + value + ' for vials (' + triggeredVials + ')'
      }

      if(triggeredVials == ''){
        outputString= 'Response: Nothing Changed, no vials selected'
      }

    } else if (inputType == 'notification'){
      outputString = data;
    }
    var linesLogged = this.state.linesLogged +1;
    var loggedText = linesLogged + '. ' + outputString + '\n' + this.state.loggedText;
    var maxlength=50000;
    if (loggedText.length > maxlength) {
      loggedText = loggedText.substring(0, maxlength)
    }
    this.setState({
      loggedText: loggedText,
      linesLogged: linesLogged
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
            width='420px'
            height='172px'
            mode="elixir"
            theme="terminal"
            fontSize={16}
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
