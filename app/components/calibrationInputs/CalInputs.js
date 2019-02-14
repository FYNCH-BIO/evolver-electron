import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import NumPad from './NumPad';
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';


const densityButtons = Array.from(Array(16).keys())

const cardStyles = theme => ({
  cardIndividualInput: {
    width: 200,
    height: 55,
    backgroundColor: 'black',
  }
});

class CalInput extends React.Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
       open: false,
       enteredValues: this.props.enteredValues,
       numPadID: 0,
       inputsLocked: this.props.onInputsEntered,
     };
   }

   componentDidUpdate(prevProps) {
     if (this.props.onInputsEntered !== prevProps.onInputsEntered) {
       this.setState({ inputsLocked: this.props.onInputsEntered})
     }
     if (this.props.enteredValues !== prevProps.enteredValues) {
       this.setState({ enteredValues: this.props.enteredValues})
     }
     if (document.activeElement) {
          document.activeElement.blur();
      }
   }

 onOpenModal = (id) => {
   this.setState({ open: true, numPadID: id });
 };

 onCloseModal = () => {
   this.setState({ open: false });
 };

 handleNumChange = (enteredValues)  => {
   let newValues = this.state.enteredValues
   newValues[this.state.numPadID] = enteredValues
   this.props.onChangeValue(newValues);
   this.setState({enteredValues: newValues})
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
        <div className="calInputColumns">
          {densityButtons.map((densityButton, index) => (
            <Card className={classes.cardIndividualInput}>
              <div className="row centered">
                <h3 className = 'calInputName'>S{index}</h3>
                <button
                  className ="calInputBtns"
                  onClick={() => this.onOpenModal(index)}
                  key= {index}
                  id={index}
                  disabled = {this.state.inputsLocked}>
                  {this.state.enteredValues[index]}
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
             closeButton: styles.calInputCloseBtn,
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
            currentValue={this.state.enteredValues[this.state.numPadID]}
            currentID= {this.state.numPadID}
            onNumChange={this.handleNumChange}
          />
          <KeyboardEventHandler
            handleKeys={['right']}
            onKeyEvent={() => this.clickForward()} />
          <KeyboardEventHandler
            handleKeys={['left']}
            onKeyEvent={() => this.clickBack()} />
          <KeyboardEventHandler
            handleKeys={['enter']}
            onKeyEvent={() => this.clickForward()} />

        </Modal>
      </div>

    );
  }
}

export default withStyles(cardStyles, { withTheme: true })(CalInput);
