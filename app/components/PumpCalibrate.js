// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import PumpcalInput from './calibrationInputs/CalInputs';
import Card from '@material-ui/core/Card';
import PumpCalGUI from './calibrationInputs/CalGUI';
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
  cardPumpCalGUI: {
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


class PumpCal extends React.Component {
  constructor(props) {
    super(props);
    this.keyboard = React.createRef();
    var vialData = []
    for (var i = 0; i < data.length; i++) {
      vialData.push(Object.assign({},data[i]));
    }
    this.state = {
      currentStep: 0,
      pumpCalModes: [{arrayName: 'IN1', arrayMode: 'NA'}, {arrayName: 'IN2', arrayMode: 'NA'}, {arrayName: 'E', arrayMode: 'NA'}],
      pumpCalModesFiltered: [],
      pumpTimes: {slow: 100, fast: 10},
      enteredValues: {IN1: Array(16).fill(''), IN2: Array(16).fill(''), E: Array(16).fill('')},
      vialData: vialData,
      buttonAdvanceText: '',
      buttonBackText: '',
      pumpButtonText: 'PUMP',
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
    this.props.logger.info('Routed to Pump Calibration Page.');
    var initialData = this.state.vialData;
    initialData = this.formatVialSelectStrings(initialData, 'IN1');
    initialData = this.formatVialSelectStrings(initialData, 'IN2');
    initialData = this.formatVialSelectStrings(initialData, 'E');

    if (store.has('runningPumpCal')){
      this.setState({resumeOpen:true})
    } else {
      this.keyboard.current.onOpenModal();
    }

    var buttonAdvanceText = 'IN1';
    var buttonBackText = 'Pump Config';
    console.log(initialData);
    this.setState({
      vialData: initialData,
      buttonAdvanceText: buttonAdvanceText,
      buttonBackText: buttonBackText,
      })
  };

  generateButtonText = (currentStep) => {
    var pumpCalModes = this.state.pumpCalModes.filter(function (mode) {
      return mode.arrayMode !== "NA";
    });
    var pumpTime = pumpCalModes[currentStep-1].arrayMode === 'fast' ? this.state.pumpTimes.fast : this.state.pumpTimes.slow;
    var statusText = `Press PUMP to run ${pumpCalModes[currentStep-1].arrayName} for ${pumpTime} seconds`;
    var buttonBackText;
    var buttonAdvanceText;
    if (currentStep === 1) {
      buttonBackText = 'Pump Config';
    }
    else {
      buttonBackText = pumpCalModes[currentStep-2].arrayName;
    }
    if (currentStep !== pumpCalModes.length) {
      buttonAdvanceText = pumpCalModes[currentStep].arrayName;
    }
    this.setState({statusText: statusText, buttonAdvanceText: buttonAdvanceText, buttonBackText: buttonBackText, pumpCalModesFiltered: pumpCalModes});
  };

  handleBack = () => {
   var currentStep = this.state.currentStep - 1;
   if (currentStep != 0) {
      this.generateButtonText(currentStep);
   }
   this.setState({currentStep: currentStep});
  };

  handleAdvance = () => {
    var currentStep = this.state.currentStep + 1;
    this.generateButtonText(currentStep);
    this.setState({currentStep: currentStep});
  };

  handlePumpAmountInput = (pumpAmountValues) => {
    var enteredValues = this.state.enteredValues;
    enteredValues[this.state.pumpCalModesFiltered[this.state.currentStep-1].arrayName] = pumpAmountValues;
    var vialData = this.state.vialData;
    console.log(vialData);
    for (var i = 0; i < vialData.length; i++) {
      vialData[i][this.state.pumpCalModesFiltered[this.state.currentStep-1].arrayName] = pumpAmountValues[i] !== '' ? pumpAmountValues[i] / this.state.pumpTimes[this.state.pumpCalModesFiltered[this.state.currentStep-1].arrayMode] : '--';
    }

    vialData = this.formatVialSelectStrings(vialData, this.state.pumpCalModesFiltered[this.state.currentStep-1].arrayName);

    this.setState({vialData: vialData, enteredValues: enteredValues});
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
      var measuredData = [];
      var vialDataStructured = this.state.enteredValues['IN1'].concat(this.state.enteredValues['E']).concat(this.state.enteredValues['IN2']);
      var mode;
      var coefficients = [];
      for (var i = 0; i < 48; i++) {
        if (i < 16) {
          mode = this.state.pumpCalModes[0].arrayMode;
        }
        else if (i < 32) {
          mode = this.state.pumpCalModes[2].arrayMode;
        }
        else {
          mode = this.state.pumpCalModes[1].arrayMode;
        }
        measuredData[i] = mode === 'fast' ? this.state.pumpTimes.fast : this.state.pumpTimes.slow;
        if (vialDataStructured[i] !== '') {
          coefficients.push(vialDataStructured[i] / measuredData[i]);
        }
        else {
          coefficients.push('');
        }
        vialDataStructured[i] = [vialDataStructured[i]];
      }


      var fit = {name: this.state.experimentName + '-fit', type: 'constant', timeFit: currentTime, active: false, params: ['pump'], coefficients: coefficients};
      var saveData = {name: this.state.experimentName, calibrationType: "pump", timeCollected: currentTime, measuredData: measuredData, fits: [fit], raw: [{param: 'pump', vialData: vialDataStructured}]}
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
   };

   onSelectVials = (selectedVials) =>    {
     this.setState({selectedVials: selectedVials});
   };

   formatVialSelectStrings = (newData, parameter) => {
     for(var i = 0; i < newData.length; i++) {
       var value;
       if (parameter == 'IN1'){
         value = newData[i].IN1 === '--' ? '--' : newData[i].IN1.toFixed(2);
         newData[i].IN1 = 'IN1: ' + value + ' ml/s';
       }
       if (parameter == 'IN2'){
         value = newData[i].IN2 === '--' ? '--' : newData[i].IN2.toFixed(2);
         newData[i].IN2 = 'IN2: ' + value + ' ml/s';
       }
       if (parameter == 'E'){
        value = newData[i].E === '--' ? '--' : newData[i].E.toFixed(2);
         newData[i].E = 'E: ' + value + ' ml/s';
       }
     }
     return newData
   };

   handleSelectRadio = (name,value) => {
    console.log(value);
     var pumpCalModes = this.state.pumpCalModes
     for (var i = 0; i < pumpCalModes.length; i++) {
      if (pumpCalModes[i].arrayName === name) {
        pumpCalModes[i].arrayMode = value;
      }
     }
     this.setState({pumpCalModes: pumpCalModes});
   };

   handleSubmit = () => {
    console.log("Submitting pump calibration to server");
   };

   runPumps = () => {
    console.log("Running Pumps");
    var vials = this.state.selectedVials.map(item => item.props.vial);
    var evolverMessage = Array(48).fill("--");
    var pumpArray = this.state.pumpCalModesFiltered[this.state.currentStep-1].arrayName;
    var pumpTime = this.state.pumpCalModesFiltered[this.state.currentStep-1].arrayMode === 'fast' ? this.state.pumpTimes.fast : this.state.pumpTimes.slow;
    for (var i = 0; i < vials.length; i++) {
      if (pumpArray == 'IN1') {
        evolverMessage[vials[i]] = pumpTime;
      }
      if (pumpArray == 'E') {
        evolverMessage[vials[i] + 16] = pumpTime;
      }
      if (pumpArray == 'IN2') {
        evolverMessage[vials[i] + 32] = pumpTime;
      }
    }
    this.props.socket.emit("command", {param: 'pump', value: evolverMessage, immediate: true});
   }

  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;

    var pumpConfig;
    var statusText = <p className="statusText" style={{paddingBottom:'200px'}}>{this.state.statusText}</p>
    var progressButtons;
    var leftButton = null;
    var pumpButton = null;

    if (this.state.currentStep == 0) {
      pumpConfig = <div style={{position: 'absolute', top: '100px', left: '100px'}}>
        <h3>Select the pump configuration for your eVOLVER setup</h3>
        <br />
        <div className='col'>
          <div> <h4>Fast Slow N/A</h4> </div>
          <div className='row'>
            <h4>IN1</h4>
            <PumpCalRadioButtons name='IN1' onSelectRadio={this.handleSelectRadio} value={this.state.pumpCalModes[0].arrayMode}/>
          </div>
          <div className='row'>
            <h4>IN2</h4>
            <PumpCalRadioButtons name='IN2' onSelectRadio={this.handleSelectRadio} value={this.state.pumpCalModes[1].arrayMode}/>
          </div>
          <div className='row'>
            <h4 style={{marginRight:'10px'}}>E</h4>
            <div style={{marginLeft:'10px'}}>
              <PumpCalRadioButtons name='E' onSelectRadio={this.handleSelectRadio} value={this.state.pumpCalModes[2].arrayMode}/>
            </div>
          </div>
        </div>
      </div>
    } else {
      pumpConfig =
      <PumpcalInput
        onChangeValue={this.handlePumpAmountInput}
        onInputsEntered = {this.state.inputsEntered}
        enteredValues = {this.state.enteredValues[this.state.pumpCalModesFiltered[currentStep-1].arrayName]}/>
    }

    if (this.state.currentStep != 0) {
        pumpButton =
        <button
          className="tempMeasureBtn"
          onClick = {this.runPumps}>
          {this.state.pumpButtonText}
        </button>;
        var rightButton;
        if (this.state.currentStep == this.state.pumpCalModesFiltered.length) {
          rightButton =
          <button
            className="tempAdvanceBtn"
            onClick={this.handleFinishExpt}>
            <FaPen/>
          </button>
        }
        else {
          rightButton =
            <button
              className="tempAdvanceBtn"
              disabled={this.state.disableForward}
              onClick={this.handleAdvance}>
              {this.state.buttonAdvanceText}<FaArrowRight size={13}/>
            </button>
        }
        leftButton =
        <button
          className="tempBackBtn"
          disabled={this.state.disableBackward}
          onClick={this.handleBack}>
          <FaArrowLeft size={13}/>{this.state.buttonBackText}
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

        <Card className={classes.cardPumpCalGUI}>
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
