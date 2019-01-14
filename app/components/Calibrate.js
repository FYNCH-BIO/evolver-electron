// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import NumPad from './calibrationInputs/NumPad';
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';



const densityButtons = Array.from(Array(16).keys())

const cardStyles = theme => ({
  cardInputButtons: {
    width: 1000,
    height: 500,
    backgroundColor: 'transparent',
  },
  cardIndividualInput: {
    width: 200,
    height: 55,
    backgroundColor: 'transparent',
  }
});

class ODcalInput extends React.Component {
  state = {
   open: false,
   odValue: Array(16).fill(''),
   numPadID: 0,
 };

 onOpenModal = (id) => {
   this.setState({ open: true, numPadID: id });
 };

 onCloseModal = () => {
   this.setState({ open: false });
 };

 handleNumChange = (inputValue)  => {
   let newValues = this.state.odValue
   newValues[this.state.numPadID] = inputValue
   this.setState({odValue: newValues})
 }

 clickBack = (event,value) => {
   let nextID = this.state.numPadID
   if (this.state.numPadID == 0){
     nextID = nextID + 15
   }
   else {
     nextID = nextID - 1
   }
   this.setState({ numPadID: nextID});
 }

  clickForward = (event,value) => {
    let nextID = this.state.numPadID
    if (this.state.numPadID == 15){
      nextID = nextID - 15
    }
    else {
      nextID = nextID + 1
    }
    this.setState({ numPadID: nextID});
  }


  render() {
    const { open } = this.state;
    const { classes, theme } = this.props;


    return (
      <div>
        <h2 className="odCalTitles"> Enter Calibration Range </h2>
          <div className="calInputColumns">
              {densityButtons.map((densityButton, index) => (
                <Card className={classes.cardIndividualInput}>
                  <div className="row centered">
                    <h3 className = 'calInputName'>S{index}</h3>
                    <button
                      className ="calInputBtns"
                      onClick={() => this.onOpenModal(index)}
                      key= {index}
                      id={index}>
                      {this.state.odValue[index]}
                    </button>
                  </div>
                </Card>
              ))}
            </div>

        <Modal
          open={open}
          onClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.customcloseButton,
             modal: styles.customModal,
             overlay: styles.customOverlay,
           }}>

          <button
            type="button"
            className="btn btn-outline-secondary btn-circle numAdvanceLeft"
            onClick={this.clickBack}>
            <FaArrowLeft size={25} color="white"/>
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary btn-circle numAdvanceRight"
            onClick={this.clickForward}>
            <FaArrowRight size={25} color="white"/>
          </button>

          <NumPad
            currentValue={this.state.odValue[this.state.numPadID]}
            currentID= {this.state.numPadID}
            onNumChange={this.handleNumChange}
          />
          <KeyboardEventHandler
            handleKeys={['right']}
            onKeyEvent={() => this.clickForward()} />
          <KeyboardEventHandler
            handleKeys={['left']}
            onKeyEvent={() => this.clickBack()} />

        </Modal>
      </div>

    );
  }
}

export default withStyles(cardStyles, { withTheme: true })(ODcalInput);
