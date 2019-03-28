// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import io from 'socket.io-client'
const Store = require('electron-store');
const store = new Store();


const cardStyles = theme => ({
  card: {
    width: 800,
    height: 500,
    backgroundColor: 'black',
    border: '1px solid white',
    margin: '0px 0px 0px 0px',
    borderRadius: '20px'
  },
  foundEvolverCard:{
    width: 755,
    height: 310,
    backgroundColor: 'black',
    border: '1px solid white',
    margin: '90px 0px 0px 20px',
    borderRadius: '5px'
  },
  label: {
    position: 'absolute',
    margin: '0px 0px 0px 20px',
    fontSize: 24,
    color: '#f58245',
    fontWeight: 'bold'
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    margin: '30px 0px 0px 20px',
  },
  registrationStatus: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'normal',
    padding: '10px 10px 10px 5px',
    position: 'absolute'
  },
  headerPrimary: {
    fontSize: 16,
    color: '#f58245',
    fontWeight: 'bold'
  },
  headerSecondary: {
    color: 'white',
    fontSize: 40,
    margin: '-10px 0px 15px 0px',
    overflow: 'hidden',
    width: '550px'
  },
})

class DesktopConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '192.168.1.',
      newEvolver: {},
      showRegistrationStatus: false,
      registered: false,
      unregistered: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit() {
    var ip = this.state.value
    console.log(ip)

    var newEvolver= {};
    newEvolver['value'] = ip;
    var socketString = "http://" + ip + ":8081/dpu-evolver";
    console.log(socketString)
    var registerSocket = io.connect(socketString, {reconnect:true});
    this.setState({registerSocket: registerSocket, newEvolver: newEvolver, showRegistrationStatus: true, registrationStatusIP: ip, registered: false, unregistered: false},
      function() {
        this.state.registerSocket.on('connect', function(){
          console.log("Connected registration socket")
          this.state.registerSocket.emit('getdevicename', {})}.bind(this));
        this.state.registerSocket.on('broadcastname', function(response) {
            console.log(response)

            var newEvolver = this.state.newEvolver;
            newEvolver['name'] = response['deviceName']
            newEvolver['label'] = response['deviceName'] + ' (' + newEvolver['value'] +')';
            newEvolver['mac'] = response['mac']
            newEvolver['statusColor'] = '#DC143C'
            console.log(newEvolver)
            this.setState({newEvolver: newEvolver})
          }.bind(this))
      })

  }

  enterPressed(event) {
    var code = event.keyCode || event.which;
    if(code === 13) { //13 is the enter keycode
      this.handleSubmit();
    }
  }

  handleLogEvolver = () => {
    var registeredEvolvers = [];
    var registeredIndex = undefined;
    if (store.has('registeredEvolvers')){
      registeredEvolvers = store.get('registeredEvolvers');
    }
    for (var i = 0; i < registeredEvolvers.length; i++) {
      if (registeredEvolvers[i]['value'] == this.state.newEvolver.value){
        registeredIndex = i;
      }
    }
    if (registeredIndex == undefined){
      registeredEvolvers.push(this.state.newEvolver)
    } else {
      registeredEvolvers[registeredIndex] = this.state.newEvolver;
      console.log('overwrting register')
    }
    console.log(registeredEvolvers)
    store.set('registeredEvolvers', registeredEvolvers)
    this.setState({registered: true})
  }

  handleUnregister = (registeredIndex) => {
    var registeredEvolvers = store.get('registeredEvolvers');
    if (registeredEvolvers[registeredIndex].value == store.get('activeEvolver').value){
      store.delete('activeEvolver');
      store.delete('activeODCal');
      store.delete('activeTempCal');
    }
    registeredEvolvers.splice(registeredIndex, registeredIndex + 1);
    registeredEvolvers = store.set('registeredEvolvers', registeredEvolvers);
    this.setState({unregistered: true})

  }


  render() {
    const { classes, theme } = this.props;

    var registeredEvolvers = [];
    var registeredIndex = undefined;
    if (store.has('registeredEvolvers')){
      registeredEvolvers = store.get('registeredEvolvers');
    }
    for (var i = 0; i < registeredEvolvers.length; i++) {
      if (registeredEvolvers[i]['value'] == this.state.newEvolver.value){
        registeredIndex = i;
      }
    }

    let registrationButton, registrationText;

    if (registeredIndex == undefined){
      registrationButton =  <button className='logEvolverRegistration' onClick={this.handleLogEvolver}>Register!</button>
      registrationText = <Typography className={classes.registrationStatus}> eVOLVER Found! Please register to use with this app. </Typography>

    } else {
      registrationButton =  <button className='logEvolverRegistration' onClick={() => this.handleUnregister(registeredIndex)}>Unregister</button>
      registrationText = <Typography className={classes.registrationStatus}> Already registered! Please proceed to unregister eVOLVER. </Typography>
    }

    let registrationStatus;
    if (this.state.showRegistrationStatus){
      if (this.state.registered){
        registrationStatus =
          <Typography className={classes.registrationStatus}> Successfully Registered! </Typography>
      } else if (this.state.unregistered){
        registrationStatus =
          <Typography className={classes.registrationStatus}>  Unregistered! </Typography>
      }
      else if (this.state.registerSocket && this.state.registerSocket.connected){
        registrationStatus =
          <div>
            {registrationText}
            <div style={{position: 'absolute',margin:'60px 0px 0px 15px'}}>
              <Typography className={classes.headerPrimary}> IP ADDRESS </Typography>
              <Typography variant="h5" className={classes.headerSecondary}>{this.state.newEvolver.value}</Typography>
              <Typography className={classes.headerPrimary}> EVOLVER NAME </Typography>
              <Typography variant="h5" className={classes.headerSecondary}>{this.state.newEvolver.name}</Typography>
              <Typography className={classes.headerPrimary}> MAC ADDRESS </Typography>
              <Typography variant="h5" className={classes.headerSecondary}>{this.state.newEvolver.mac}</Typography>
              {registrationButton}
            </div>
          </div>
      } else if (!this.state.registerSocket.connected && registeredIndex == undefined) {
        registrationStatus =
            <Typography className={classes.registrationStatus}> eVOLVER not found on this IP ({this.state.registrationStatusIP}). Please verify IP address and check device connection. </Typography>
      } else if (!this.state.registerSocket.connected && registeredIndex !== undefined){
        registrationStatus =
          <div>
            {registrationText}
            <div style={{position: 'absolute',margin:'60px 0px 0px 15px'}}>
              <Typography className={classes.headerPrimary}> IP ADDRESS </Typography>
              <Typography variant="h5" className={classes.headerSecondary}>{registeredEvolvers[registeredIndex].value}</Typography>
              <Typography className={classes.headerPrimary}> EVOLVER NAME </Typography>
              <Typography variant="h5" className={classes.headerSecondary}>{registeredEvolvers[registeredIndex].name}</Typography>
              <Typography className={classes.headerPrimary}> MAC ADDRESS </Typography>
              <Typography variant="h5" className={classes.headerSecondary}>{registeredEvolvers[registeredIndex].mac}</Typography>
              {registrationButton}
            </div>
          </div>
      }
    }

    return (
      <div>
        <Card className= {classes.card}>
          <div className='registerEvolverContainer' style={{margin: '100px 0px 0px 0px'}}>
              <Typography className={classes.label}>EVOLVER IP: </Typography>
              <input className='registerEvolverInput' type="text" value={this.state.value} onChange={this.handleChange} onKeyPress={this.enterPressed.bind(this)}/>
          </div>
          <div className='registerEvolverContainer' style={{margin: '98px 0px 0px 645px'}}>
            <button className='registerEvolverSubmit' onClick={this.handleSubmit}>Find</button>
          </div>
          <Typography className={classes.title}> CONNECT APP TO EVOLVER </Typography>
          <Card className= {classes.foundEvolverCard}>
            {registrationStatus}
          </Card>
        </Card>
      </div>
    );
  }
}

export default withStyles(cardStyles)(DesktopConfig);
