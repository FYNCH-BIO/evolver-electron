// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Modal from 'react-responsive-modal';
import styles from './config-modal.css';
import {FaCircle} from 'react-icons/fa';
var fs = require('fs');
import ConfigForm from './ConfigForm'


class ConfigModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      connected: false,
      activeEvolver: '192.168.1.4',
      isPi: this.props.isPi
    };
    this.props.socket.on('connect', function () {
      this.setState({connected: true})
      }.bind(this))
    this.props.socket.on('disconnect', function () {
      this.setState({connected: false})
      }.bind(this))
  }

  componentDidMount(){
    if (this.props.socket.connected){
      this.setState({connected: true})
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isPi !== prevProps.isPi) {
      this.setState({ isPi: this.props.isPi})
    }
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners('connect');
    this.props.socket.removeAllListeners('disconnect');
  }

  onOpenModal = () => {
    this.setState({ open: true});
  };

  onCloseModal = () => {
    this.setState({ open: false});
  };

  render() {
    const { open } = this.state;

    let disabledStatus, arrow;
    if (this.state.isPi){
      disabledStatus = true;
    } else {
      disabledStatus = false;
      arrow = '\u25BC';
    }

    let activeBtnLabel;
    if (this.state.connected){
      activeBtnLabel =
        <button className= 'openConfigBtn' onClick={() => this.onOpenModal()} disabled={disabledStatus}>
          <FaCircle size={10} style={{margin:'0px 7px 2px 0px', color:'#32CD32'}}/> {this.state.activeEvolver}
          <span className= 'openConfigTxt'>  {arrow}</span>
        </button>
    } else {
      activeBtnLabel =
        <button className= 'openConfigBtn' onClick={() => this.onOpenModal()} disabled={disabledStatus}>
          <FaCircle size={10} style={{margin:'0px 7px 2px 0px', color:'#DC143C'}}/> {this.state.activeEvolver}
          <span className= 'openConfigTxt'>  {arrow}</span>
        </button>
    }


    return (
      <div>
        {activeBtnLabel}
        <Modal
          open={open}
          onClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.customcloseButton,
             modal: styles.configModal,
             overlay: styles.customOverlay,
           }}>

           <ConfigForm/>

        </Modal>
      </div>

    );
  }
}

export default (ConfigModal);
