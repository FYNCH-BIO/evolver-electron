// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import TempcalInput from './calibrationInputs/CalInputs';
import Card from '@material-ui/core/Card';
import TempCalGUI from './calibrationInputs/CalGUI';
import LinearProgress from '@material-ui/core/LinearProgress';
import {FaPlay, FaArrowLeft, FaArrowRight, FaStop, FaCheck } from 'react-icons/fa';
import CircularProgress from '@material-ui/core/CircularProgress';

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

function generateVialLabel (response, oldTempStream) {
  var tempStream = Array(16).fill('...');
  var deltaTempStream = Array(16).fill('...');
  var valueInputs = Array(16).fill('...')
  for (var i = 0; i < response.temp.length; i++) {
    tempStream[i] = response.temp[i]
    deltaTempStream[i] = tempStream[i] - oldTempStream[i];
    if (isNaN(deltaTempStream[i])){
      deltaTempStream[i] = "0"
    }
    valueInputs[i] = tempStream[i] + " (" + (deltaTempStream[i]<0?"":"+") + deltaTempStream[i] + ")"
  }

  return [tempStream, valueInputs]
}


class TempCal extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    console.log(this.props.socket);
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
      vialProgress: Array(16).fill(40),
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
    };
    this.props.socket.on('dataresponse', function(response) {

      var newVialData = this.state.vialData;
      // if stop was pressed or late response, don't want to continue
      if (this.state.readProgress === 0) {
          return;
      }
      this.progress();

      let returnedTemps = generateVialLabel (response, this.state.tempStream)
      let tempStream = returnedTemps[0];
      let valueInputs = returnedTemps[1];

      for (var i = 0; i < response.OD.length; i++) {
          if (newVialData[newVialData.length - 1].OD.length <= i) {
              newVialData[newVialData.length - 1].OD.push([]);
              newVialData[newVialData.length - 1].temp.push([]);
          }
          newVialData[newVialData.length - 1].OD[i].push(response.OD[i]);
          newVialData[newVialData.length - 1].temp[i].push(response.temp[i]);
      }
      this.setState({
        tempStream: tempStream,
        valueInputs: valueInputs,
        vialData: newVialData,
        equilibrateState: true},
        function() {
        if (this.state.vialData[newVialData.length - 1].OD[0].length === this.state.timesRead) {
            this.handleUnlockBtns();
            console.log(this.state.vialData);
            var readsFinished = this.state.vialData.length;
            this.setState({progressCompleted: (100 * (this.state.vialData.length / this.state.deltaTempSteps)), readsFinished: readsFinished , readProgress: 0});

        }
        this.props.socket.emit('data', {});
      });
    }.bind(this));

    this.props.socket.on('databroadcast', function(response) {
      let returnedTemps = generateVialLabel (response, this.state.tempStream)
      let tempStream = returnedTemps[0];
      let valueInputs = returnedTemps[1];

      this.setState({
        tempStream: tempStream,
        valueInputs: valueInputs
         })
    }.bind(this));


  }

  componentDidMount() {
    this.setState({
      vialOpacities: Array(16).fill(0),
      generalOpacity: Array(16).fill(1),
      valueInputs: Array(16).fill('...'),
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
      this.setState({equilibrateState: false, inputsEntered: false});
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
      newVialData.push({OD:[], temp:[], step: this.state.currentStep, powerLevel:this.state.currentPowerLevel, enteredValues:this.state.enteredValues});
      this.setState({vialData:newVialData});
      this.props.socket.emit('data', {});
    }
  }

  stopRead = () => {
    this.setState({readProgress: 0, equilibrateState: true})
    this.handleUnlockBtns();
  }

  componentWillUnmount() {
    this.setState({readProgress: 0});
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
     currentStep: currentStep
     });
  };

  handleAdvance = () => {
   var disableForward;
   var disableBackward;
   var currentStep = this.state.currentStep + 1;

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
     currentStep: currentStep
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
    var tempValuesFloats = [];
    for (let i = 0; i < tempValues.length; i++){
        tempValuesFloats[i] = parseFloat(tempValues[i])
      }
    this.setState({enteredValues: tempValuesFloats});
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
      statusText = <p className="statusText"> Let equilibrate at RT, then enter measured values. </p>
    }
    else if ((this.state.vialData.length !== 0) && (this.state.equilibrateState)) {
      statusText = <p className="statusText"> {this.state.readsFinished}/{this.state.deltaTempSteps} Measurements Made </p>
    }
    else if ((this.state.vialData.length !== 0) && (!this.state.equilibrateState)) {
      statusText = <p className="statusText"> Temperature set! Let equilibrate, then enter values. </p>
    }


    //deltaTempRange: [0, 1000], //slope around 0.02 C per a.u.
    //deltaTempSteps: 3,

    if (this.state.readProgress === 0) {
        measureButton =
        <button
          className="measureBtn"
          onClick = {this.startRead}>
           <FaPlay/>
        </button>;
      for (var i = 0; i < this.state.vialData.length; i++) {
        if ((this.state.currentStep === this.state.vialData[i].step) && (typeof(this.state.vialData[i].OD) != "undefined")) {
          if (this.state.vialData[i].OD[0].length === this.state.timesRead){

              measureButton =
              <button
                className="measureBtn"
                onClick = {this.startRead}>
                 <FaCheck/>
              </button>;
              break;
            }
        }
      }
    } else {
      measureButton =
      <button
        className="measureBtn"
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



    return (
      <div>
        <h3 className="odCalTitles"> Temperature Calibration &deg;C </h3>
        <Link className="backHomeBtn" id="experiments" to={{pathname:routes.CALMENU, socket:this.props.socket}}><FaArrowLeft/></Link>
        <TempcalInput
          onChangeValue={this.handleTempInput}
          onInputsEntered = {this.state.inputsEntered}
          enteredValues = {this.state.enteredValues}/>

        <div className="row" style={{position: 'absolute'}}>
          <button
            className="odBackBtn"
            disabled={this.state.disableBackward}
            onClick={this.handleBack}>
            <FaArrowLeft/>
          </button>
          {measureButton}
          <button
            className="odAdvanceBtn"
            disabled={this.state.disableForward}
            onClick={this.handleAdvance}>
            <FaArrowRight/>
          </button>
        </div>

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


      </div>

    );
  }
}

export default withStyles(styles)(TempCal);
