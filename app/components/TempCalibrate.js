// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import TempCalInput0 from './calibrationInputs/CalInputs';
import TempCalInput1 from './calibrationInputs/CalInputs';
import TempCalInput2 from './calibrationInputs/CalInputs';
import TempCalInput3 from './calibrationInputs/CalInputs';
import Card from '@material-ui/core/Card';
import TempCalGUI from './calibrationInputs/TempCalGUI';
import LinearProgress from '@material-ui/core/LinearProgress';
import {FaPlay, FaArrowLeft, FaArrowRight, FaStop, FaCheck, FaPen } from 'react-icons/fa';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextKeyboard from './calibrationInputs/TextKeyboard';
import ModalAlert from './calibrationInputs/ModalAlert';
const Store = require('electron-store');
const store = new Store(); //runningTempCal


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
    margin: '-10px 0px 0px 0px',
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
  }
};

function generateQuadLabel (response, oldTempStream) {
  var tempStream = new Array(4).fill('...');
  var deltaTempStream = new Array(4).fill('...');
  var valueInputs = new Array(4).fill('...');
  for (var i = 0; i < response.data.temp.length; i++) {
    //  To Not show value during RT reading
    // if (roomTempAvg.length !== 0){
      tempStream[i] = [response.data.temp[i]]
      deltaTempStream[i] = tempStream[i] - oldTempStream[i];
      if (isNaN(deltaTempStream[i][0])){
        deltaTempStream[i] = "0";
      }
      valueInputs[i] = tempStream[i][0];
    // }
  }

  return [tempStream, valueInputs]
}

function calculateQuadProgress (currentTemp, previousLockedTemp, targetTemp){
  var percentCompleted = []
  for (var i = 0; i < currentTemp.length; i++) {
    percentCompleted[i] = Math.round(5 + (95 *Math.abs(((currentTemp[i] - previousLockedTemp[i])/(targetTemp[i] - previousLockedTemp[i])))));
  }
  return percentCompleted
}


class TempCal extends React.Component {
  constructor(props) {
    super(props);
    this.keyboard = React.createRef();
    this.state = {
      currentStep: 1,
      disableForward: false,
      disableBackward: true,
      progressCompleted: 0,
      quadOpacities: new Array(4).fill(1),
      enteredValues: new Array(72).fill(''),
      generalOpacity: new Array(4).fill(1),
      tempInputsFloat: [],
      readProgress: 0,
      quadProgress: new Array(4).fill(0),
      initialZipped: [],
      inputsEntered: true,
      selectedSmartQuad: 0,
      quadLabels: ['SQ0', 'SQ1', 'SQ2', 'SQ3'],
      smartQuadLabels: ['SQ0 Sensor Average','SQ1 Sensor Average','SQ2 Sensor Average','SQ3 Sensor Average'],
      quadsData: [],
      powerLevels: [[1000,1000,1000,1000], [2000,2000,2000,2000], [3000,3000,3000,3000]],
      timesRead: 3,
      valueInputs: [],
      tempStream: [],
      deltaTempSteps: 3,
      equilibrateState: true,
      buttonAdvanceText: '',
      buttonBackText: '',
      buttonMeasureText: '',
      slopeEstimate: .02,
      previousLockedTemp: [],
      experimentName:'',
      readsFinished: 0,
      alertOpen: false,
      alertQuestion: 'Logging Values...',
      alertAnswers: ['Retry', 'Exit'],
      exiting: false,
      resumeOpen: false,
      resumeQuestion: 'Start new calibration or resume?',
      resumeAnswers: ['New', 'Resume'],
      keyboardPrompt: "Enter File Name or press ESC to autogenerate."

    }
    this.props.socket.on('broadcast', function(response) {
      console.log(response);
      if (response.dummy) {
        console.log("dummy broadcast received");
        return
      }
      var newQuadsData = this.state.quadsData;
      let returnedTemps = generateQuadLabel (response, this.state.tempStream)
      let tempStream = returnedTemps[0];
      let valueInputs = returnedTemps[1];

      let percentQuadProgress = [];
      let powerLevelIndex = this.state.currentStep - 1;
      percentQuadProgress = calculateQuadProgress (tempStream, this.state.previousLockedTemp, this.state.powerLevels[powerLevelIndex]);

      this.setState({
        tempStream: tempStream,
        valueInputs: valueInputs,
        quadProgress: percentQuadProgress
        })

      //  if stop was pressed or user still moving vials around, don't want to continue
      if (this.state.readProgress === 0) {
        return;
      };
      this.progress();

      for (var i = 0; i < response.data.temp.length; i++) {
          if (newQuadsData[newQuadsData.length - 1].temp.length <= i) {
              newQuadsData[newQuadsData.length - 1].temp.push([]);
          }
          newQuadsData[newQuadsData.length - 1].temp[i].push(parseInt(response.data.temp[i]));
      }
      this.setState({
        tempStream: tempStream,
        valueInputs: valueInputs,
        quadsData: newQuadsData,
        equilibrateState: true},
        //Runs when collected enough measurements
        function() {
          var tempArray = this.state.quadsData[newQuadsData.length - 1].temp;
          if (tempArray[0].length === this.state.timesRead) {
              this.handleUnlockBtns();
              var readsFinished = this.state.quadsData.length;
              this.setState({
                progressCompleted: (100 * (this.state.quadsData.length / this.state.deltaTempSteps)),
                readsFinished: readsFinished,
                readProgress: 0,
                quadProgress: Array(4).fill(0)},
                function() {
                  store.set('runningTempCal', this.state)
                });
          }
	    });
      console.log(this.state.readProgress)
    }.bind(this));

    this.props.socket.on('calibrationrawcallback', function(response) {
      if (response == 'success'){
        this.setState({alertQuestion: 'Successfully Logged. Do you want to exit?'})
      }
    }.bind(this));

  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners('broadcast');
    this.props.socket.removeAllListeners('calibrationrawcallback');
    this.setState({readProgress: 0});
  }

  componentDidMount() {
    this.props.logger.info('Routed to Temperature Calibration Page.')
    if (store.has('runningTempCal')){
      this.setState({resumeOpen:true})
    } else {
      this.keyboard.current.onOpenModal();
    }

    let buttonAdvanceText = this.state.powerLevels[this.state.currentStep][0].toString().concat(' ADC');
    let buttonMeasureText = this.state.powerLevels[this.state.currentStep - 1][0].toString().concat(' ADC');
    this.setState({
      quadOpacities: Array(4).fill(0),
      generalOpacity: Array(4).fill(1),
      valueInputs: Array(4).fill('...'),
      buttonMeasureText: buttonMeasureText,
      buttonAdvanceText: buttonAdvanceText
      })
  };

  startRead = () => {
    let evolverValue = new Array(4).fill("NaN");
    let powerLevelIndex = this.state.currentStep - 1;
    for (var i = 0; i < evolverValue.length; i++) {
      evolverValue[i] = this.state.powerLevels[powerLevelIndex][i];
    }
    this.props.socket.emit("command", {param: "temp", value: evolverValue, immediate: true});
    if (this.state.equilibrateState){
      this.handleLockBtns();

      let percentQuadProgress = [];
      percentQuadProgress = calculateQuadProgress (this.state.tempStream, this.state.tempStream, this.state.powerLevels[powerLevelIndex]);

      this.setState({
        equilibrateState: false,
        inputsEntered: false,
        previousLockedTemp: this.state.tempStream,
        quadProgress: percentQuadProgress
        });
    }
    else {
      this.setState({readProgress: this.state.readProgress + .01, inputsEntered: true});
      var newQuadsData = this.state.quadsData;

      // remove existing data for particular layout
      for (var i = 0; i < newQuadsData.length; i++) {
        if (this.state.currentStep === this.state.quadsData[i].step) {
            newQuadsData.splice(i, 1);
            break;
        }
      }
      newQuadsData.push({
        temp:[],
        step: this.state.currentStep,
        powerLevel:this.state.powerLevels[powerLevelIndex],
        enteredValues:this.state.enteredValues,
        });
      this.setState({quadsData:newQuadsData});
    //this.props.socket.emit('data', {config:{od:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], temp:['NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN','NaN']}});
    }
  }

  stopRead = () => {
    this.setState({readProgress: 0, equilibrateState: true})
    this.handleUnlockBtns();
  }

  progress = () => {
     let readProgress = this.state.readProgress;
     readProgress = readProgress + (100/this.state.timesRead);
     this.setState({readProgress: readProgress});
     console.log(this.state.readProgress);
   };

  handleBack = () => {
   let disableForward;
   let disableBackward;
   let currentStep = this.state.currentStep - 1;
   let buttonMeasureText = this.state.powerLevels[currentStep - 1][0].toString().concat(' ADC');
   let buttonBackText = '';
   let buttonAdvanceText = ''
   if (currentStep < 3) {
     buttonAdvanceText = this.state.powerLevels[currentStep][0].toString().concat(' ADC');
   }
   if (currentStep > 1) {
     buttonBackText = this.state.powerLevels[currentStep - 2][0].toString().concat(' ADC');
   }
   //let buttonBackText = this.state.powerLevels[currentStep - 2][0].toString();
   //let buttonAdvanceText = this.state.powerLevels[currentStep - 1][0].toString();


   if (this.state.currentStep === this.state.deltaTempSteps){
     disableForward = false;
   }
   if (this.state.currentStep === 2){
     disableBackward = true;
   }
   this.handleRecordedData(currentStep);
   this.setState({
     disableForward: disableForward,
     disableBackward: disableBackward,
     currentStep: currentStep,
     buttonMeasureText: buttonMeasureText,
     buttonAdvanceText: buttonAdvanceText,
     buttonBackText: buttonBackText
     });
  };

  handleAdvance = () => {
    let disableForward;
    let disableBackward;
    let currentStep = this.state.currentStep + 1;
    let buttonMeasureText = this.state.powerLevels[currentStep - 1][0].toString().concat(' ADC');
    let buttonBackText = '';
    let buttonAdvanceText = ''
    if (currentStep < 3) {
      buttonAdvanceText = this.state.powerLevels[currentStep][0].toString().concat(' ADC');
    }
    if (currentStep > 1) {
      buttonBackText = this.state.powerLevels[currentStep - 2][0].toString().concat(' ADC');
    }
    //let buttonBackText = this.state.powerLevels[currentStep - 2][0].toString();
    //let buttonAdvanceText = this.state.powerLevels[currentStep - 1][0].toString();

    if (this.state.currentStep === 1){
     disableBackward = false;
    }
    if (this.state.currentStep === (this.state.deltaTempSteps - 1)){
     disableForward = true;
    }
    this.handleRecordedData(currentStep);
    this.setState({
     disableForward: disableForward,
     disableBackward: disableBackward,
     currentStep: currentStep,
     buttonMeasureText: buttonMeasureText,
     buttonAdvanceText: buttonAdvanceText,
     buttonBackText: buttonBackText
     });
  };

  handleLockBtns = () => {
    var disableForward = true;
    var disableBackward = true;

    this.setState({
      disableForward: disableForward,
      disableBackward: disableBackward,
      });
  };

  handleUnlockBtns = () => {
    var disableForward = false;
    var disableBackward = false;

    if (this.state.currentStep === 1){
      disableBackward = true;
      disableForward = false;
    }
    if (this.state.currentStep === (this.state.deltaTempSteps)){
      disableBackward = false;
      disableForward = true;
    }
    this.setState({
      disableForward: disableForward,
      disableBackward: disableBackward,
      });
  };

  handleRecordedData = (currentStep) => {
    var displayedData = Array(72).fill('');
    var quadsData = this.state.quadsData
    for (var i = 0; i < quadsData.length; i++) {
        if (currentStep === this.state.quadsData[i].step) {
            displayedData = this.state.quadsData[i].enteredValues;
            break;
        }
    }
    this.setState({enteredValues: displayedData})
  }

  handleTempInput = (tempValues) => {
    let oldEnteredValues = this.state.enteredValues;

    if (this.state.selectedSmartQuad == 0) {
      oldEnteredValues.splice(0,18,tempValues[0],tempValues[1],tempValues[2],tempValues[3],tempValues[4],tempValues[5],tempValues[6],tempValues[7],tempValues[8],tempValues[9],tempValues[10],tempValues[11],tempValues[12],tempValues[13],tempValues[14],tempValues[15],tempValues[16],tempValues[17]);
    };
    if (this.state.selectedSmartQuad == 1) {
      oldEnteredValues.splice(18,18,tempValues[0],tempValues[1],tempValues[2],tempValues[3],tempValues[4],tempValues[5],tempValues[6],tempValues[7],tempValues[8],tempValues[9],tempValues[10],tempValues[11],tempValues[12],tempValues[13],tempValues[14],tempValues[15],tempValues[16],tempValues[17]);
    };
    if (this.state.selectedSmartQuad == 2) {
      oldEnteredValues.splice(36,18,tempValues[0],tempValues[1],tempValues[2],tempValues[3],tempValues[4],tempValues[5],tempValues[6],tempValues[7],tempValues[8],tempValues[9],tempValues[10],tempValues[11],tempValues[12],tempValues[13],tempValues[14],tempValues[15],tempValues[16],tempValues[17]);
    };
    if (this.state.selectedSmartQuad == 3) {
      oldEnteredValues.splice(54,18,tempValues[0],tempValues[1],tempValues[2],tempValues[3],tempValues[4],tempValues[5],tempValues[6],tempValues[7],tempValues[8],tempValues[9],tempValues[10],tempValues[11],tempValues[12],tempValues[13],tempValues[14],tempValues[15],tempValues[16],tempValues[17]);
    };
    this.setState({enteredValues:oldEnteredValues})
   }

   handleSmartQuadSelection = (selectedSmartQuad) => {
     this.setState({
       selectedSmartQuad: selectedSmartQuad
     });
   }

   handleKeyboardInput = (input) => {
     var exptName;
     if (input == ''){
       exptName = 'Temp-' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
     } else {
       exptName = input
     }
     this.setState({experimentName: exptName});
   }

   handleFinishExpt = (finishFlag) => {
      this.setState({alertOpen: true})
      console.log("Experiment Finished!");
      this.props.socket.emit("command", {param: "temp", value: this.state.powerLevels[1], immediate: true});

      var d = new Date();
      var currentTime = d.getTime();
      var enteredValuesStructured = [];
      var quadDataStructured = [];

      // TODO: Change data structure so that we don't have to do this transformation. Would require other code restructure
      // Data should be saved vial -> step -> data format, not step -> vial -> data as it is here.
      for(var i = 0; i < this.state.quadsData.length; i++) {
        for(var j = 0; j < this.state.quadsData[i].enteredValues.length; j++) {
          if(!enteredValuesStructured[j]) {
            enteredValuesStructured.push([]);
          }
          enteredValuesStructured[j].push(parseFloat(this.state.quadsData[i].enteredValues[j]));
        }
        for (var j = 0; j < this.state.quadsData[0].temp.length; j++) {
          if (!quadDataStructured[j]) {
            quadDataStructured.push(new Array(3).fill([]));
          }
          quadDataStructured[j][i] = this.state.quadsData[i].temp[j];
        }
      }
      var saveData = {name: this.state.experimentName, calibrationType: "temperature", timeCollected: currentTime, measuredData: enteredValuesStructured, fits: [], raw: [{param: 'temp', quadsData: quadDataStructured}]}
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
       store.delete('runningTempCal');
       this.setState({exiting: true});
     }
   }

   onResumeAnswer = (answer) => {
     if (answer == 'New'){
       this.keyboard.current.onOpenModal();
       store.delete('runningTempCal');
     }
     if (answer == 'Resume'){
       var previousState = store.get('runningTempCal');
       this.setState(previousState);
     }
     this.setState({resumeOpen:false})
   }

  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;

    let measureButton;
    let statusText;

    if ((this.state.quadsData.length == 0) && (this.state.equilibrateState)) {
      statusText = <p className="statusText"> Load vials w/ 5 mL of room temp water. </p>
    }
    else if ((this.state.quadsData.length == 0) && (!this.state.equilibrateState)) {
      statusText = <p className="statusText"> Peltiers OFF - Let equilibrate, select SQ, and enter values. </p>
    }
    else if ((this.state.quadsData.length !== 0) && (this.state.equilibrateState)) {
      statusText = <p className="statusText"> {this.state.readsFinished}/{this.state.deltaTempSteps} Measurements Made </p>
    }
    else if ((this.state.quadsData.length !== 0) && (!this.state.equilibrateState)) {
      statusText = <p className="statusText"> Temperature set! Let equilibrate, then enter values. </p>
    }



    if (this.state.readProgress === 0) {
        measureButton =
        <button
          className="tempMeasureBtn"
          onClick = {this.startRead}>
          {this.state.buttonMeasureText} <FaPlay size={13}/>
        </button>;
      for (var i = 0; i < this.state.quadsData.length; i++) {
        if ((this.state.currentStep === this.state.quadsData[i].step) && (typeof(this.state.quadsData[i].temp[0]) !== "undefined")) {
          if (this.state.quadsData[i].temp[0].length === this.state.timesRead){

              measureButton =
              <button
                className="tempMeasureBtn"
                onClick = {this.startRead}>
                 {this.state.buttonMeasureText} <FaCheck size={13}/>
              </button>;
              break;
            }
        }
      }
    } else {
      measureButton =
      <button
        className="tempMeasureBtn"
        onClick= {this.stopRead}>
        <CircularProgress
          classes={{
            colorPrimary: classes.circleProgressColor,
            circle: classes.circle
            }}
          variant="static"
          value={this.state.readProgress}
          color="primary"
          size= {50}
        />
        <FaStop size={15} className = "readStopBtn"/>
      </button>;

      statusText = <p className="statusText">Collecting raw values from eVOLVER...</p>;
    }

    let btnRight;
    if  ((this.state.progressCompleted >= 100) && (this.state.currentStep === this.state.deltaTempSteps)){
      btnRight =
        <button
          className="tempAdvanceBtn"
          onClick={this.handleFinishExpt}>
          <FaPen/>
        </button>
    } else {
      btnRight =
        <button
          className="tempAdvanceBtn"
          disabled={this.state.disableForward}
          onClick={this.handleAdvance}>
          {this.state.buttonAdvanceText} <FaArrowRight size={13}/>
        </button>
    }


    let progressButtons;
    if ((this.state.quadsData.length == 0) && (this.state.equilibrateState)) {
      progressButtons =
      <div className="row">
        <button
          className="stepOneBtn"
          onClick={this.startRead}>
          Start Temperature Calibration <FaPlay size={17}/>
        </button>
      </div>;
    } else {
      progressButtons =
      <div className="row" style={{position: 'absolute'}}>
        <button
          className="tempBackBtn"
          disabled={this.state.disableBackward}
          onClick={this.handleBack}>
          {this.state.buttonBackText} <FaArrowLeft size={13}/>
        </button>
        {measureButton}
        {btnRight}
      </div>
    }

    if (this.state.exiting) {
      return <Redirect push to={{pathname:routes.CALMENU, socket:this.props.socket, logger:this.props.logger}} />;
    }

    let tempCalInput;
    if (this.state.selectedSmartQuad == 0) {
      tempCalInput = <TempCalInput0
        key='TempcalInput0'
        id='TempcalInput0'
        onChangeValue={this.handleTempInput}
        onInputsEntered = {this.state.inputsEntered}
        currentSmartQuad = {this.state.selectedSmartQuad}
        enteredValues = {this.state.enteredValues.slice(0,18)}/>
    } else if (this.state.selectedSmartQuad == 1) {
      tempCalInput = <TempCalInput1
        key='TempcalInput1'
        id='TempcalInput1'
        onChangeValue={this.handleTempInput}
        onInputsEntered = {this.state.inputsEntered}
        currentSmartQuad = {this.state.selectedSmartQuad}
        enteredValues = {this.state.enteredValues.slice(18,36)}/>
    } else if (this.state.selectedSmartQuad == 2) {
      tempCalInput = <TempCalInput2
        key='TempcalInput2'
        id='TempcalInput2'
        onChangeValue={this.handleTempInput}
        onInputsEntered = {this.state.inputsEntered}
        currentSmartQuad = {this.state.selectedSmartQuad}
        enteredValues = {this.state.enteredValues.slice(36,54)}/>
    } else if (this.state.selectedSmartQuad == 3) {
      tempCalInput = <TempCalInput3
        key='TempcalInput3'
        id='TempcalInput3'
        onChangeValue={this.handleTempInput}
        onInputsEntered = {this.state.inputsEntered}
        currentSmartQuad = {this.state.selectedSmartQuad}
        enteredValues = {this.state.enteredValues.slice(54,72)}/>
    };

    return (
      <div>
        <Link className="backHomeBtn" id="experiments" to={{pathname:routes.CALMENU, socket:this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>
        {tempCalInput}
        {progressButtons}

        <Card className={classes.cardTempCalGUI}>
          <TempCalGUI
            quadOpacities = {this.state.quadOpacities}
            generalOpacity = {this.state.generalOpacity}
            valueInputs = {this.state.valueInputs}
            initialZipped = {this.state.initialZipped}
            readProgress = {this.state.quadProgress}
            onSmartQuadSelection = {this.handleSmartQuadSelection}
            quadLabels = {this.state.smartQuadLabels}/>

          <LinearProgress
            classes= {{
              root: classes.progressBar,
              colorPrimary: classes.colorPrimary,
              bar: classes.bar,
            }}
            variant="determinate"
            value={this.state.progressCompleted} />

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

export default withStyles(styles)(TempCal);
