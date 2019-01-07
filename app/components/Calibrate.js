// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import NumPad from './calibrationInputs/NumPad';
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';

export default class ODcalInput extends React.Component {
  state = {
   open: false,
 };

 onOpenModal = () => {
   this.setState({ open: true });
 };

 onCloseModal = () => {
   this.setState({ open: false });
 };


  render() {
    const { open } = this.state;

    return (
      <div>
        <p className="testText"> fasdfasdfdsa</p>
        <button onClick={this.onOpenModal}>Open modal</button>
        <Modal
          open={open}
          onClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.customcloseButton,
             modal: styles.customModal,
             overlay: styles.customOverlay,
           }}>

          <NumPad />
        </Modal>
      </div>

    );
  }
}
