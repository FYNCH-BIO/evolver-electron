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
  }
};

function generateVialLabel (response, oldTempStream, roomTempAvg) {
  var tempStream = Array(16).fill('...');
  var deltaTempStream = Array(16).fill('...');
  var valueInputs = Array(16).fill('...')
  for (var i = 0; i < response.temp.length; i++) {
    //  To Not show value during RT reading
    // if (roomTempAvg.length !== 0){
      tempStream[i] = response.temp[i]
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


class TempCal extends React.Component {
  constructor(props) {
    super(props);
    this.keyboard = React.createRef();
    this.state = {
      currentStep: 1,
      disableForward: false,
      disableBackward: true,
      progressCompleted: 0,
      vialOpacities: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      enteredValues: Array(16).fill(''),
      generalOpacity: Array(16).fill(1),
      tempInputsFloat: [],
      readProgress: 0,
      vialProgress: Array(16).fill(0),
      initialZipped: [],
      inputsEntered: true,
      vialLabels: ['S0','S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15'],
      vialData: [],
      currentPowerLevel: [4095,4095,4095,4095,4095,4095,4095,4095,4095,4095,4095,4095,4095,4095,4095,4095],
      tempRawDelta: 500,
      timesRead: 3,
      valueInputs: [],
      tempStream: [],
      deltaTempRange: [0, 1000], //slope around 0.02 C per a.u.
      deltaTempSteps: 3,
      equilibrateState: true,
      roomTempAvg: [],
      buttonAdvanceText: '',
      buttonBackText: '',
      buttonMeasureText: 'RT',
      slopeEsimate: .02,
      previousLockedTemp: [],
      experimentName:'',
      readsFinished: 0,
      alertOpen: false,
      alertQuestion: 'Logging Values...',
      alertAnswers: ['Retry', 'Exit'],
      exiting: false,
      keyboardPrompt: "Please Enter Name of Calibration File"

    };
    this.props.socket.on('dataresponse', function(response) {

      var newVialData = this.state.vialData;
      // if stop was pressed or late response, don't want to continue
      if (this.state.readProgress === 0) {
          return;
      }
      this.progress();

      let returnedTemps = generateVialLabel (response, this.state.tempStream, this.state.roomTempAvg)
      let tempStream = returnedTemps[0];
      let valueInputs = returnedTemps[1];

      for (var i = 0; i < response.temp.length; i++) {
          if (newVialData[newVialData.length - 1].temp.length <= i) {
              newVialData[newVialData.length - 1].temp.push([]);
          }
          newVialData[newVialData.length - 1].temp[i].push(response.temp[i]);
      }
      this.setState({
        tempStream: tempStream,
        valueInputs: valueInputs,
        vialData: newVialData,
        equilibrateState: true},
        //Runs when collected enough measurements
        function() {
          var tempArray = this.state.vialData[newVialData.length - 1].temp;
          if (tempArray[0].length === this.state.timesRead) {
              var roomTempAvg = this.state.roomTempAvg;
              if (this.state.currentStep == 1) {
                for (var i = 0; i < tempArray.length; i++) {
                  let average = (array) => array.reduce((a, b) => a + b) / array.length;
                  roomTempAvg[i] = Math.round(average(tempArray[i]));
                }
              }
              this.handleUnlockBtns();
              console.log(this.state.vialData);
              var readsFinished = this.state.vialData.length;
              this.setState({
                progressCompleted: (100 * (this.state.vialData.length / this.state.deltaTempSteps)),
                readsFinished: readsFinished,
                readProgress: 0,
                roomTempAvg: roomTempAvg,
                vialProgress: Array(16).fill(0)});

          }
          this.props.socket.emit('data', {});
      });
    }.bind(this));

    this.props.socket.on('databroadcast', function(response) {
      let returnedTemps = generateVialLabel (response, this.state.tempStream, this.state.roomTempAvg)
      let tempStream = returnedTemps[0];
      let valueInputs = returnedTemps[1];

      let percentVialProgress = [];
      if (this.state.currentStep > 1) {
        percentVialProgress = calculateVialProgress (tempStream, this.state.previousLockedTemp, this.state.currentPowerLevel);
      }

      this.setState({
        tempStream: tempStream,
        valueInputs: valueInputs,
        vialProgress: percentVialProgress
         })
    }.bind(this));

    this.props.socket.on('setcalibrationrawtemp_callback', function(response) {
      if (response == 'success'){
        this.setState({alertQuestion: 'Successfully Logged. Do you want to exit?'})
      }
    }.bind(this));

  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners('dataresponse');
    this.props.socket.removeAllListeners('databroadcast');
    this.props.socket.removeAllListeners('setcalibrationrawtemp_callback');
    this.setState({readProgress: 0});
  }

  componentDidMount() {
    this.props.logger.info('Routed to Temperature Calibration Page.')
    this.keyboard.current.onOpenModal();
    var deltaTempSetting = (this.state.deltaTempRange[1] - this.state.deltaTempRange[0])/(this.state.deltaTempSteps-1);
    var buttonAdvanceText = "+" + Math.round(deltaTempSetting * this.state.slopeEsimate) + "\u00b0C";
    var buttonBackText = "-" + Math.round(deltaTempSetting * this.state.slopeEsimate) + "\u00b0C";
    this.setState({
      vialOpacities: Array(16).fill(0),
      generalOpacity: Array(16).fill(1),
      valueInputs: Array(16).fill('...'),
      buttonAdvanceText: buttonAdvanceText,
      buttonBackText: buttonBackText,
      })
  };

  startRead = () => {
    var evolverMessage = Array(16).fill("NaN");
    for (var i = 0; i < this.state.currentPowerLevel.length; i++) {
      evolverMessage[i] = this.state.currentPowerLevel[i];
    }
    this.props.socket.emit("command", {param: "temp", message: evolverMessage});

    if (this.state.equilibrateState){
      this.handleLockBtns();

      let percentVialProgress = [];
      if (this.state.currentStep > 1) {
        percentVialProgress = calculateVialProgress (this.state.tempStream, this.state.tempStream, this.state.currentPowerLevel);
      }

      this.setState({
        equilibrateState: false,
        inputsEntered: false,
        previousLockedTemp: this.state.tempStream,
        vialProgress: percentVialProgress
        });
    }
    else {
      this.setState({readProgress: this.state.readProgress + .01, inputsEntered: true});
      var newVialData = this.state.vialData;

      // remove existing data for particular layout
      for (var i = 0; i < newVialData.length; i++) {
          if (this.state.currentStep === this.state.vialData[i].step) {
              newVialData.splice(i, 1);
              break;
          }
      }
      newVialData.push({
        temp:[],
        step: this.state.currentStep,
        powerLevel:this.state.currentPowerLevel,
        enteredValues:this.state.enteredValues,
        });
      this.setState({vialData:newVialData});
      this.props.socket.emit('data', {});
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
   };

  handleBack = () => {
   var disableForward;
   var disableBackward;
   var currentStep = this.state.currentStep - 1;
   var deltaTempSetting = (currentStep - 1) * (this.state.deltaTempRange[1] - this.state.deltaTempRange[0])/(this.state.deltaTempSteps-1);
   var newTempSet = this.state.roomTempAvg.map((a, i) => a - deltaTempSetting);
   var buttonMeasureText = '';
   if (currentStep - 1 == 0){
     var buttonMeasureText = "RT"
   }
   else{
    var buttonMeasureText = "RT + " + Math.round(deltaTempSetting* this.state.slopeEsimate) + "\u00b0C";
    }

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
     currentPowerLevel: newTempSet,
     buttonMeasureText: buttonMeasureText
     });
  };

  handleAdvance = () => {
    var disableForward;
    var disableBackward;
    var currentStep = this.state.currentStep + 1;
    var deltaTempSetting = (currentStep - 1) * (this.state.deltaTempRange[1] - this.state.deltaTempRange[0])/(this.state.deltaTempSteps-1);
    var newTempSet = this.state.roomTempAvg.map((a, i) => a - deltaTempSetting);
    var buttonMeasureText = '';
    if (currentStep - 1 == 0){
      var buttonMeasureText = "RT"
    }
    else{
     var buttonMeasureText = "RT + " + Math.round(deltaTempSetting* this.state.slopeEsimate) + "\u00b0C";
     }

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
     currentPowerLevel: newTempSet,
     buttonMeasureText: buttonMeasureText
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

  handleTempInput = (tempValues) => {
    this.setState({enteredValues: tempValues});
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
      var d = new Date();
      var currentTime = d.getTime();
      var saveData = {time: currentTime, vialData: this.state.vialData, filename:(this.state.experimentName + '.json')};
      this.props.socket.emit('setcalibrationrawtemp', saveData);
   }

   handleKeyboardModal = () => {
     this.keyboard.current.onOpenModal();
   }

   onAlertAnswer = (answer) => {
     if (answer == 'Retry'){
       this.handleFinishExpt();
     }
     if (answer == 'Exit'){
       this.setState({exiting: true});
     }
   }

  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;

    let measureButton;
    let statusText;

    if ((this.state.vialData.length == 0) && (this.state.equilibrateState)) {
      statusText = <p className="statusText">Load vessels w/ 15 mL of room temp water. </p>
    }
    else if ((this.state.vialData.length == 0) && (!this.state.equilibrateState)) {
      statusText = <p className="statusText"> Heaters turned off. Let equilibrate, then enter values. </p>
    }
    else if ((this.state.vialData.length !== 0) && (this.state.equilibrateState)) {
      statusText = <p className="statusText"> {this.state.readsFinished}/{this.state.deltaTempSteps} Measurements Made </p>
    }
    else if ((this.state.vialData.length !== 0) && (!this.state.equilibrateState)) {
      statusText = <p className="statusText"> Temperature set! Let equilibrate, then enter values. </p>
    }



    if (this.state.readProgress === 0) {
        measureButton =
        <button
          className="tempMeasureBtn"
          onClick = {this.startRead}>
          {this.state.buttonMeasureText} <FaPlay size={13}/>
        </button>;
      for (var i = 0; i < this.state.vialData.length; i++) {
        if ((this.state.currentStep === this.state.vialData[i].step) && (typeof(this.state.vialData[i].temp[0]) !== "undefined")) {
          if (this.state.vialData[i].temp[0].length === this.state.timesRead){

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
    if ((this.state.vialData.length == 0) && (this.state.equilibrateState)) {
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


    return (
      <div>
        <Link className="backHomeBtn" id="experiments" to={{pathname:routes.CALMENU, socket:this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>
        <TempcalInput
          onChangeValue={this.handleTempInput}
          onInputsEntered = {this.state.inputsEntered}
          enteredValues = {this.state.enteredValues}/>
        {progressButtons}

        <Card className={classes.cardTempCalGUI}>
          <TempCalGUI
            vialOpacities = {this.state.vialOpacities}
            generalOpacity = {this.state.generalOpacity}
            valueInputs = {this.state.valueInputs}
            initialZipped = {this.state.initialZipped}
            readProgress = {this.state.vialProgress}
            vialLabels = {this.state.vialLabels}/>

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

      </div>

    );
  }
}

export default withStyles(styles)(TempCal);
