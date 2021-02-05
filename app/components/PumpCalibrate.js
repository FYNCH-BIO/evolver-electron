// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import TempcalInput from './calibrationInputs/CalInputs';
import Card from '@material-ui/core/Card';
import TempCalGUI from './calibrationInputs/CalGUI';
import LinearProgress from '@material-ui/core/LinearProgress';
import {FaPlay, FaArrowLeft, FaArrowRight, FaStop, FaCheck, FaPen } from 'react-icons/fa';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextKeyboard from './calibrationInputs/TextKeyboard';
import ModalAlert from './calibrationInputs/ModalAlert';
import VialSelectorPumpCal from './VialSelectorPumpCal';
import data from './sample-data-pump-cal';
import PumpCalRadioButtons from './PumpCalRadioButtons'
const Store = require('electron-store');
const store = new Store(); //runningPumpCal


const styles = {
  cardTempCalGUI: {
    width: 570,
    height: 800,
    backgroundColor: 'transparent',
    margin: '0px 0px 0px 500px',
    position: 'absolute',
  },
  progressBar: {
    flexGrow: 1,
    margin: '27px 0px 0px 0px',
    height: 8,
  },
  colorPrimary: {
    backgroundColor: 'white',
  },
  bar: {
    backgroundColor: '#f58245',
  },
  circleProgressColor: {
    color: '#f58245',
  },
  circle: {
    strokeWidth: '3px',
  },
  root: {
    display: 'flex',
    borderRadius: '10px',
    display: 'flex',
    width: '300px',
    padding: '0px 0px 30px 0px',
    justifyContent: 'center',
  },
  label: {
    color: 'white',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    '&$focused': {
      color: 'white'
    }
  },
  radiolabel: {
    color: 'white',
    textAlign: 'center'
  },
  labelRoot: {
    margin: '0px 6px 0px 6px'
  },
  radio: {
    color: 'white',
    '&$checked': {
      color: 'orange',
    },
    padding: '0px 5px 0px 0px'
  },
  checked: {},
  focused: {}
};

function generateVialLabel (response, oldTempStream, roomTempAvg) {
  var tempStream = Array(16).fill('...');
  var deltaTempStream = Array(16).fill('...');
  var valueInputs = Array(16).fill('...')
  for (var i = 0; i < response.data.temp.length; i++) {
    //  To Not show value during RT reading
    // if (roomTempAvg.length !== 0){
      tempStream[i] = response.data.temp[i]
      deltaTempStream[i] = tempStream[i] - oldTempStream[i];
      if (isNaN(deltaTempStream[i])){
        deltaTempStream[i] = "0"
      }
      valueInputs[i] = tempStream[i] + " (" + (deltaTempStream[i]<0?"":"+") + deltaTempStream[i] + ")"
    // }
  }

  return [tempStream, valueInputs]
}

function calculateVialProgress (currentTemp, previousLockedTemp, targetTemp){
  var percentCompleted = []
  for (var i = 0; i < currentTemp.length; i++) {
    percentCompleted[i] = Math.round(5 + (95 *Math.abs(((currentTemp[i] - previousLockedTemp[i])/(targetTemp[i] - previousLockedTemp[i])))));
  }
  return percentCompleted
}


class PumpCal extends React.Component {
  constructor(props) {
    super(props);
    this.keyboard = React.createRef();
    this.state = {
      currentStep: 0,
      pumpCalModes: {
        IN1: null,
        IN2: null,
        E: null
        },
      enteredValues: Array(16).fill(''),
      vialData: data,
      buttonAdvanceText: '',
      buttonBackText: '',
      pumpButtonText: 'PUMP!',
      statusText: '',
      experimentName:'',
      alertOpen: false,
      alertQuestion: 'Logging Values...',
      alertAnswers: ['Retry', 'Exit'],
      exiting: false,
      resumeOpen: false,
      resumeQuestion: 'Start new calibration or resume?',
      resumeAnswers: ['New', 'Resume'],
      keyboardPrompt: "Enter File Name or press ESC to autogenerate.",
      selectedVials: []
    };

    this.props.socket.on('calibrationrawcallback', function(response) {
      if (response == 'success'){
        this.setState({alertQuestion: 'Successfully Logged. Do you want to exit?'})
      }
    }.bind(this));

  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners('calibrationrawcallback');
    this.setState({readProgress: 0});
  }

  componentDidMount() {
    this.props.logger.info('Routed to Temperature Calibration Page.')
    var initialData = this.state.vialData;
    initialData = this.formatVialSelectStrings(initialData, 'IN1');
    initialData = this.formatVialSelectStrings(initialData, 'IN2');
    initialData = this.formatVialSelectStrings(initialData, 'E');

    if (store.has('runningPumpCal')){
      this.setState({resumeOpen:true})
    } else {
      this.keyboard.current.onOpenModal();
    }

    var buttonAdvanceText = 'IN2';
    var buttonBackText = 'Pump Config';
    this.setState({
      vialData: initialData,
      buttonAdvanceText: buttonAdvanceText,
      buttonBackText: buttonBackText,
      })
  };

  handleBack = () => {
   var currentStep = this.state.currentStep - 1;
   var statusText = '';
   if (currentStep == 1) {
     statusText = 'Click PUMP to run IN1 for 10 seconds. Record volume.'
     buttonAdvanceText = 'IN2'
     buttonBackText = 'Pump Config'
   } else if (currentStep == 2) {
     statusText = 'Click PUMP to run IN2 for 10 seconds. Record volume.'
     buttonAdvanceText = 'E';
     buttonBackText = 'IN1';
   } else if (currentStep == 3) {
     statusText = 'Click PUMP to run E for 10 seconds. Record volume.'
     buttonAdvanceText = 'Submit';
     buttonBackText = 'IN2'
   };

   this.handleRecordedData(currentStep);
   this.setState({
     currentStep: currentStep,
     statusText: statusText
     });
  };

  handleAdvance = () => {
    var currentStep = this.state.currentStep + 1;
    var statusText = '';
    if (currentStep == 1) {
      statusText = 'Click PUMP to run IN1 for 10 seconds. Record volume.'
      buttonAdvanceText = 'IN2'
      buttonBackText = 'Pump Config'
    } else if (currentStep == 2) {
      statusText = 'Click PUMP to run IN2 for 10 seconds. Record volume.'
      buttonAdvanceText = 'E';
      buttonBackText = 'IN1';
    } else if (currentStep == 3) {
      statusText = 'Click PUMP to run E for 10 seconds. Record volume.'
      buttonAdvanceText = 'Submit';
      buttonBackText = 'IN2'
    };

    this.handleRecordedData(currentStep);
    this.setState({
     currentStep: currentStep,
     statusText: statusText
     });
  };

  handleRecordedData = (currentStep) => {
    var displayedData = Array(16).fill('');
    var vialData = this.state.vialData
    for (var i = 0; i < vialData.length; i++) {
        if (currentStep === this.state.vialData[i].step) {
            displayedData = this.state.vialData[i].enteredValues;
            break;
        }
    }
    this.setState({enteredValues: displayedData})
  }

  handlePumpInput = (tempValues) => {
    this.setState({enteredValues: tempValues});
   }

   handleKeyboardInput = (input) => {
     var exptName;
     if (input == ''){
       exptName = 'Pump-' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
     } else {
       exptName = input
     }
     this.setState({experimentName: exptName});
   }

   handleFinishExpt = (finishFlag) => {
      this.setState({alertOpen: true})
      console.log("Experiment Finished!");
      var d = new Date();
      var currentTime = d.getTime();
      var enteredValuesStructured = [];
      var vialDataStructured = [];

      // TODO: Change data structure so that we don't have to do this transformation. Would require other code restructure
      // Data should be saved vial -> step -> data format, not step -> vial -> data as it is here.
      for(var i = 0; i < this.state.vialData.length; i++) {
        for(var j = 0; j < this.state.vialData[i].enteredValues.length; j++) {
          if(!enteredValuesStructured[j]) {
            enteredValuesStructured.push([]);
            vialDataStructured.push(new Array(3).fill([]));
          }
          enteredValuesStructured[j].push(parseFloat(this.state.vialData[i].enteredValues[j]));
          vialDataStructured[j][i] = this.state.vialData[i].temp[j];
        }
      }
      var saveData = {name: this.state.experimentName, calibrationType: "temperature", timeCollected: currentTime, measuredData: enteredValuesStructured, fits: [], raw: [{param: 'temp', vialData: vialDataStructured}]}
      console.log(saveData);
      this.props.socket.emit('setrawcalibration', saveData);
   }

   handleKeyboardModal = () => {
     this.keyboard.current.onOpenModal();
   }

   onAlertAnswer = (answer) => {
     if (answer == 'Retry'){
       this.handleFinishExpt();
     }
     if (answer == 'Exit'){
       store.delete('runningPumpCal');
       this.setState({exiting: true});
     }
   }

   onResumeAnswer = (answer) => {
     if (answer == 'New'){
       this.keyboard.current.onOpenModal();
       store.delete('runningPumpCal');
     }
     if (answer == 'Resume'){
       var previousState = store.get('runningPumpCal');
       this.setState(previousState);
     }
     this.setState({resumeOpen:false})
   }

   onSelectVials = (selectedVials) =>    {
     this.setState({selectedItems: selectedVials});
   };

   formatVialSelectStrings = (vialData, parameter) => {
     var newData = JSON.parse(JSON.stringify(vialData));
     for(var i = 0; i < newData.length; i++) {
       if (parameter == 'IN1'){
         newData[i].IN1 = 'IN1: ' + newData[i].IN1;
       }
       if (parameter == 'IN2'){
         newData[i].IN2 = 'IN2: ' + newData[i].IN2;
       }
       if (parameter == 'E'){
         newData[i].E = 'E: ' + newData[i].E;
       }
     }
     return newData
   }

   handleSelectRadio = (name,value) => {
     var pumpCalModes = this.state.pumpCalModes;
     pumpCalModes[name] = value;
     this.setState({
       pumpCalModes: pumpCalModes,
       });
   };

  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;

    var pumpConfig;
    var statusText = <p className="statusText" style={{paddingBottom:'200px'}}>{this.state.statusText}</p>
    var progressButtons;
    var leftButton = null;
    var pumpButton = null;
    var rightButton =
      <button
        className="tempAdvanceBtn"
        disabled={this.state.disableForward}
        onClick={this.handleAdvance}>
        <FaArrowRight size={13}/>
      </button>

    if (this.state.currentStep == 0) {
      pumpConfig = <div style={{position: 'absolute', top: '100px', left: '100px'}}>
        <h3>Select the pump configuration for your eVOLVER setup</h3>
        <br />
        <div className='col'>
          <div> <h4>Fast Slow N/A</h4> </div>
          <div className='row'>
            <h4>IN1</h4>
            <PumpCalRadioButtons name='IN1' onSelectRadio={this.handleSelectRadio}/>
          </div>
          <div className='row'>
            <h4>IN2</h4>
            <PumpCalRadioButtons name='IN2' onSelectRadio={this.handleSelectRadio}/>
          </div>
          <div className='row'>
            <h4 style={{marginRight:'10px'}}>E</h4>
            <div style={{marginLeft:'10px'}}>
              <PumpCalRadioButtons name='E' onSelectRadio={this.handleSelectRadio}/>
            </div>
          </div>
        </div>
      </div>
    } else {
      pumpConfig =
      <TempcalInput
        onChangeValue={this.handlePumpInput}
        onInputsEntered = {this.state.inputsEntered}
        enteredValues = {this.state.enteredValues}/>
    }

    if (this.state.currentStep != 0) {
        pumpButton =
        <button
          className="tempMeasureBtn"
          onClick = {this.startPump}>
          {this.state.pumpButtonText}
        </button>;
        leftButton =
        <button
          className="tempBackBtn"
          disabled={this.state.disableBackward}
          onClick={this.handleBack}>
          <FaArrowLeft size={13}/>
        </button>
        progressButtons =
          <div className="row" style={{position: 'absolute'}}>
            {leftButton}
            {pumpButton}
            {rightButton}
          </div>
    } else {
      progressButtons =
      <div className="row">
        <button
          className="stepOneBtn"
          onClick={this.handleAdvance}>
          Start Pump Calibration <FaPlay size={17}/>
        </button>
      </div>;
    }

    if (this.state.exiting) {
      return <Redirect push to={{pathname:routes.CALMENU, socket:this.props.socket, logger:this.props.logger}} />;
    }


    return (
      <div>
        <Link className="backHomeBtn" id="experiments" to={{pathname:routes.CALMENU, socket:this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>
        {pumpConfig}
        {progressButtons}

        <Card className={classes.cardTempCalGUI}>
        <VialSelectorPumpCal
          items={this.state.vialData}
          vialSelectionFinish={this.onSelectVials}/>
          {statusText}

        </Card>

        <button
          className="odCalTitles"
          onClick={this.handleKeyboardModal}>
          <h4 style={{fontWeight: 'bold', fontStyle: 'italic'}}> {this.state.experimentName} </h4>
        </button>
        <TextKeyboard ref={this.keyboard} onKeyboardInput={this.handleKeyboardInput} onFinishedExpt={this.handleFinishExpt} keyboardPrompt={this.state.keyboardPrompt}/>
        <ModalAlert
          alertOpen= {this.state.alertOpen}
          alertQuestion = {this.state.alertQuestion}
          alertAnswers = {this.state.alertAnswers}
          onAlertAnswer = {this.onAlertAnswer}/>
        <ModalAlert
          alertOpen= {this.state.resumeOpen}
          alertQuestion = {this.state.resumeQuestion}
          alertAnswers = {this.state.resumeAnswers}
          onAlertAnswer = {this.onResumeAnswer}/>

      </div>

    );
  }
}

export default withStyles(styles)(PumpCal);
