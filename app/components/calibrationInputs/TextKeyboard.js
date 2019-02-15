import React, { Component } from "react";
import { render } from "react-dom";
import Keyboard from "react-simple-keyboard";
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';
import {FaPen} from 'react-icons/fa';
import KeyboardEventHandler from 'react-keyboard-event-handler';


class TextKeyboard extends React.Component {
  state = {
    open: false,
    layoutName: "default",
    input: "",
    finalInput: "",
    keyboardPrompt: this.props.keyboardPrompt
  };

  onOpenModal = () => {
    this.setState({ open: true, input:''});
  };

  onCloseModal = () => {
    this.props.onKeyboardInput(this.state.input)
    this.setState({ open: false});
  };


  onChange = input => {
    this.setState({
      input: input
    });
  };

  onKeyPress = button => {
    if (button === "{shift}" || button === "{lock}") this.handleShift();
    if (button === "{enter}") this.onCloseModal();
  };

  handleShift = () => {
    let layoutName = this.state.layoutName;

    this.setState({
      layoutName: layoutName === "default" ? "shift" : "default"
    });
  };

  onChangeInput = event => {
    let input = event.target.value;
    this.setState(
      {
        input: input
      },
      () => {
        this.keyboard.setInput(input);
      }
    );
  };

  render() {
    const { open } = this.state;

    return (
      <div>
        <Modal
          open={open}
          onClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.keyboardcloseButton,
             modal: styles.customModal,
             overlay: styles.customOverlay,
           }}>
            <h3 style={{textAlign: 'center', margin: '0px 0px 15px 0px'}}>
            {this.state.keyboardPrompt}
            </h3>
            <input
              autoFocus
              ref={input => input && input.focus()}
              className = "keyboardInput"
              value={this.state.input}
              onChange={e => this.onChangeInput(e)}
            />
            <Keyboard
              ref={r => (this.keyboard = r)}
              theme={"hg-theme-default"}
              layoutName={this.state.layoutName}
              onChange={input => this.onChange(input)}
              onKeyPress={button => this.onKeyPress(button)}
              />
          </Modal>
        </div>
    );
  }
}

export default TextKeyboard;
