// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import {FaPen} from 'react-icons/fa'
import TextKeyboard from '../calibrationInputs/TextKeyboard';
const Store = require('electron-store');
const store = new Store();

const cardStyles = theme => ({
  card: {
    width: 800,
    height: 500,
    backgroundColor: 'black',
    border: '1px solid white',
    margin: '0px 0px 0px 0px',
    borderRadius: '20px',
  },
  title: {
    fontSize: 16,
    color: '#f58245',
    fontWeight: 'bold'
  },
  headerSecondary: {
    color: 'white',
    fontSize: 45,
    margin: '-10px 0px 15px 0px',
    overflow: 'hidden',
    width: '550px'
  },
  pos: {
    marginBottom: 12,
  },
})

function findIP(){
  var os = require('os');

  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
          var address = interfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
              addresses.push(address.address);
              addresses.push(address.mac);
          }
      }
  }
  return addresses
}


class RpiConfig extends React.Component {
  constructor(props) {
    super(props);
    this.keyboard = React.createRef();
    this.state = {
      addresses: '',
      deviceName: '',
      keyboardPrompt: "Please enter a new name for this eVOLVER."
    };
    this.props.socket.on('broadcastname', function(response) {
      store.set('deviceName', response.deviceName)
      this.setState({deviceName: response.deviceName})
      this.props.deviceNameChange(response.deviceName);
    }.bind(this))

  }

  componentDidMount(){
    this.setState({deviceName:store.get('deviceName')})
    this.props.socket.emit('getdevicename', {})
    this.setState({addresses: findIP()})
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners('broadcastname');
  }

  handleEditName = () => {
    this.keyboard.current.onOpenModal();
  }

  handleKeyboardInput = (input) => {
    var deviceData= {};
    deviceData.ip = this.state.addresses[0];
    deviceData.mac = this.state.addresses[1];
    if (input == ''){
      deviceData.deviceName = this.state.deviceName;
    } else {
      deviceData.deviceName = input
    }
    this.props.socket.emit("setdevicename", deviceData);
  }


  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <Card className= {classes.card}>
          <CardContent>
            <Typography className={classes.title}> EVOLVER NAME </Typography>
            <Typography variant="h5" className={classes.headerSecondary}>{this.state.deviceName}</Typography>
            <Typography className={classes.title}> IP ADDRESS </Typography>
            <Typography variant="h5" className={classes.headerSecondary}>{this.state.addresses[0]}</Typography>
            <Typography className={classes.title}> MAC ADDRESS </Typography>
            <Typography variant="h5" className={classes.headerSecondary}>{this.state.addresses[1]}</Typography>
          </CardContent>
          <button className='editDeviceName' onClick={this.handleEditName}>
            <FaPen size={24}/>
          </button>
          <TextKeyboard ref={this.keyboard} onKeyboardInput={this.handleKeyboardInput} keyboardPrompt={this.state.keyboardPrompt} />
        </Card>
      </div>

    );
  }
}

export default withStyles(cardStyles)(RpiConfig);
