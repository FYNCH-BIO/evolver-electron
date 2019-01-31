import React, { Component } from "react";
import { render } from "react-dom";
import Keyboard from "react-simple-keyboard";
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';
import {FaPen } from 'react-icons/fa';

class TextKeyboard extends React.Component {
  state = {
    open: false,
    layoutName: "default",
    input: ""
  };

  onOpenModal = () => {
    this.setState({ open: true, input: ""});
  };

  onCloseModal = () => {
    this.props.onKeyboardInput(this.state.input)
    this.setState({ open: false});
  };


  onChange = input => {
    this.setState({
      input: input
    });
    this.props.onKeyboardInput(input)
  };

  onKeyPress = button => {
    if (button === "{shift}" || button === "{lock}") this.handleShift();
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

  finishExperiment = () => {
    this.props.onFinishedExpt(true)
  }

  render() {
    const { open } = this.state;

    return (
      <div>
        <button
          className="odAdvanceBtn"
          onClick={this.onOpenModal}>
          <FaPen/>
        </button>

        <Modal
          open={open}
          onClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.customcloseButton,
             modal: styles.customModal,
             overlay: styles.customOverlay,
           }}>
            <input
              id = "keyboardInput"
              ref="keyboardInput"
              className = "keyboardInput"
              value={this.state.input}
              placeholder={"Enter name for calibration file"}
              onChange={e => this.onChangeInput(e)}
            />
            <Keyboard
              ref={r => (this.keyboard = r)}
              theme={"hg-theme-default"}
              layoutName={this.state.layoutName}
              onChange={input => this.onChange(input)}
              onKeyPress={button => this.onKeyPress(button)}
              />

              <button
                type="button"
                className="btn btn-outline-secondary finishButton"
                onClick={this.finishExperiment}>
                Finish and Log Calibration
              </button>
          </Modal>
        </div>
    );
  }
}

export default TextKeyboard;
