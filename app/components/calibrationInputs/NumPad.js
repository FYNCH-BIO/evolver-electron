import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { FaBackspace } from 'react-icons/fa';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Paper from '@material-ui/core/Paper';


const numButtons = [
  {label: '7'},
  {label: '8'},
  {label: '9'},
  {label: '4'},
  {label: '5'},
  {label: '6'},
  {label: '1'},
  {label: '2'},
  {label: '3'},
  {label: '-'},
  {label: '0'},
  {label: '.'},
];


const styles = theme => ({
  cardNumPad: {
    width: 410,
    height: 500,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    width: '100%',
    height: '13%',
    backgroundColor: 'transparent',
    outline: '1px solid black',
    padding: '20px 5px 5px 5px',
  },
  cardInput: {
    width: '100%',
    height: '10%',
    backgroundColor: 'transparent',
    outline: '1px solid black',
    padding: '5px 10px 10px 40px',
    textAlign: 'left',
  },
  cardInputText: {
    width: '85%',
    height: '100%',
    backgroundColor: 'transparent',
    outline: '1px solid black',
  },
  cardClearButton: {
    width: '15%',
    height: '100%',
    backgroundColor: 'transparent',
    outline: '1px solid black',
    textAlign: 'center',
    paddingRight: '30px',
    marginTop: '-4px'
  },
  cardNumButtons: {
    width: '100%',
    height: '72%',
    backgroundColor: 'transparent',
    outline: '1px solid black',
    padding: '10px 10px 10px 10px'
  },
  formControl: {
    margin: theme.spacing.unit,
  },

});

class NumPad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputString: this.props.currentValue,
      title: this.props.currentID,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentID !== prevProps.currentID) {
      this.setState({ title: this.props.currentID})
    }
    if (this.props.currentValue !== prevProps.currentValue) {
      this.setState({ inputString: this.props.currentValue})
    }
  }

  handleNumButtons = (id) => {
    let newString = this.state.inputString
    if (newString.length < 7){
      if (id == '.'){
        if (!(newString.indexOf('.') > -1)){
          if (newString == ''){
            newString = newString + 0 + id
          }
          else {
            newString = newString + id
          }
          }
        }
      else if (id == '-'){
        if (!(newString.charAt(0) == '-')){
          newString = id + newString
        }

      }
      else if (newString == '0'){
        newString = id
      }
      else {
        newString = newString + id
      }
    }
    this.props.onNumChange(newString);
    this.setState({ inputString: newString});
  };

  handleClear = (event, value) => {
    this.props.onNumChange('');
    this.setState({ inputString: ''});
  };


  render() {
    const { inputString } = this.state;
    const { classes, theme } = this.props;

    return (
      <Card className={classes.cardNumPad}>
        <Card className={classes.cardTitle} style={{ textAlign: 'center' }}>
          <h2>SAMPLE {this.state.title}</h2>
        </Card>
        <Card className={classes.cardInput} style={{ display: 'inline-flex' }}>
          <Card className={classes.cardInputText}>
            <h2 className='numPadInput'>{this.state.inputString}</h2>
          </Card>
          <button className="numClearButton" type="button" onClick={this.handleClear}>
            <FaBackspace/>
            <KeyboardEventHandler
              handleKeys={['backspace']}
              onKeyEvent={this.handleClear} />
          </button>
        </Card>
        <Card className={classes.cardNumButtons}>
          {numButtons.map((numButton, index) => (
            <button
              className="numPadButton"
              onClick={() => this.handleNumButtons(numButton.label)}
              type="button"
              key= {numButton.label}
              id={numButton.label}>
              {numButton.label}
            </button>
          ))}
        </Card>
        {numButtons.map((numButton, index) => (
          <KeyboardEventHandler
            handleKeys={[numButton.label]}
            key= {numButton.label}
            onKeyEvent={() => this.handleNumButtons(numButton.label)} />
        ))}
      </Card>
    );
  }
}

export default withStyles(styles, { withTheme: true })(NumPad);
