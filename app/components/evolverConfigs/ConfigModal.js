// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Modal from 'react-responsive-modal';
import styles from './config-modal.css';
import {FaCircle, FaPlus} from 'react-icons/fa';
var fs = require('fs');
import RpiConfig from './RpiConfig'
import DesktopConfig from './DesktopConfig'
import EvolverSelect from './EvolverSelect'

const Store = require('electron-store');
const store = new Store();

class ConfigModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      connected: false,
      activeEvolver: 'loading...',
      isPi: this.props.isPi
    };
    this.props.socket.on('broadcastname', function(response) {
        if(this.state.isPi){
          store.set('deviceName', response.deviceName)
          this.setState({activeEvolver: response.deviceName}, () => {
            console.log('Updated name to: ',this.state.activeEvolver)})
        } else {
          //LOOK UP FROM TABLE
        }
      }.bind(this))
  }

  componentDidMount(){
    this.props.socket.emit('getdevicename', {})
    this.setState({activeEvolver:store.get('deviceName')})
    if (this.props.socket.connected){
      this.setState({connected: true})
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isPi !== prevProps.isPi) {
      this.setState({ isPi: this.props.isPi})
    }
    if (this.props.activeEvolver !== prevProps.activeEvolver) {
      this.setState({ activeEvolver: this.props.activeEvolver})
    }
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners('broadcastname');
  }

  onOpenModal = () => {
    this.setState({ open: true});
  };

  onCloseModal = () => {
    this.setState({ open: false});
  };

  handleNameChange = (deviceName) => {
    this.setState({ activeEvolver: deviceName});
  };

  render() {
    const { open } = this.state;
    let arrow = '\u25BC';

    let activeBtnLabel;

    if (this.state.isPi){
      activeBtnLabel =
        <button className= 'openConfigBtn' onClick={() => this.onOpenModal()} >
          <span style={{fontWeight:'bold', fontSize: '24px'}}>MY NAME IS: </span>
          <span style={{fontWeight:'normal'}}> {this.state.activeEvolver}</span>
          <span className= 'openConfigTxt'>  {arrow}</span>
        </button>
    } else {
      activeBtnLabel =
        <EvolverSelect />
    }

    // if (this.state.isPi){
    //   activeBtnLabel =
    //     <button className= 'openConfigBtn' onClick={() => this.onOpenModal()} >
    //       <span style={{fontWeight:'bold', fontSize: '24px'}}>MY NAME IS: </span>
    //       <span style={{fontWeight:'normal'}}> {this.state.activeEvolver}</span>
    //       <span className= 'openConfigTxt'>  {arrow}</span>
    //     </button>
    // } else if (this.state.connected){
    //   activeBtnLabel =
    //     <button className= 'openConfigBtn' onClick={() => this.onOpenModal()} >
    //       <FaCircle size={10} style={{margin:'0px 7px 2px 0px', color:'#32CD32'}}/> {this.state.activeEvolver}
    //       <span className= 'openConfigTxt'>  {arrow}</span>
    //     </button>
    // } else {
    //   activeBtnLabel =
    //     <button className= 'openConfigBtn' onClick={() => this.onOpenModal()}>
    //       <FaCircle size={10} style={{margin:'0px 7px 2px 0px', color:'#DC143C'}}/> {this.state.activeEvolver}
    //       <span className= 'openConfigTxt'>  {arrow}</span>
    //     </button>
    // }

    let configForm;
    if (this.state.isPi){
      configForm = <RpiConfig socket= {this.props.socket} deviceNameChange={this.handleNameChange}/>
    } else {
      configForm = <DesktopConfig socket= {this.props.socket}/>
    }

    return (
      <div>
        {activeBtnLabel}
        <Modal
          open={open}
          onClose={this.onCloseModal}
          classNames={{
             closeButton: styles.customcloseButton,
             modal: styles.configModal,
             overlay: styles.customOverlay,
           }}>
           {configForm}
        </Modal>
        <button className= 'registerEvolverBtn' onClick={() => this.onOpenModal()} >
          <FaPlus size={24} style={{color:'#ffd9b2', margin:'0px 0px 2px 0px'}}/>
        </button>
      </div>

    );
  }
}

export default (ConfigModal);
