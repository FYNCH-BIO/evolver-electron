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

const initialInput = '';

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
      inputValue: Array(16).fill(''),
      generalSampleOpacity: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      inputsEntered: false,
      tempInputsFloat: [],
      readProgress: 0,
      vialProgress: [100,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
      initialZipped: [
            [12,0,1,initialInput,'S12'],
            [13,0,1,initialInput,'S13'],
            [14,0,1,initialInput,'S14'],
            [15,0,1,initialInput,'S15'],
            [8,0,1,initialInput,'S8'],
            [9,0,1,initialInput,'S9'],
            [10,0,1,initialInput,'S10'],
            [11,0,1,initialInput,'S11'],
            [4,0,1,initialInput,'S4'],
            [5,0,1,initialInput,'S5'],
            [6,0,1,initialInput,'S6'],
            [7,0,1,initialInput,'S7'],
            [0,0,1,initialInput,'S0'],
            [1,0,1,initialInput,'S1'],
            [2,0,1,initialInput,'S2'],
            [3,0,1,initialInput,'S3']],
      vialLabels: ['S0','S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15'],
      vialData: [],
      currentPowerLevel: Array(16).fill(4095),
      timesRead: 3,
    };
    this.props.socket.on('dataresponse', function(response) {

        var evolverMessage = Array(16).fill("NaN");
        for (var i = 0; i < this.state.currentPowerLevel.length; i++) {
          evolverMessage[vials[i]] = this.state.currentPowerLevel[i];
        }


        var newVialData = this.state.vialData;
        // if stop was pressed or late response, don't want to continue
        if (this.state.readProgress === 0) {
            return;
        }
        this.progress();
        for (var i = 0; i < response.OD.length; i++) {
            if (newVialData[newVialData.length - 1].OD.length <= i) {
                newVialData[newVialData.length - 1].OD.push([]);
                newVialData[newVialData.length - 1].temp.push([]);
            }
            newVialData[newVialData.length - 1].OD[i].push(response.OD[i]);
            newVialData[newVialData.length - 1].temp[i].push(response.temp[i]);
        }
        this.setState({vialData: newVialData}, function() {
            if (this.state.vialData[newVialData.length - 1].OD[0].length === this.state.timesRead) {
                console.log(this.state.vialData);
                var readsFinished = this.state.vialData.length;
                this.setState({progressCompleted: (100 * (this.state.vialData.length / 16)), readsFinished: readsFinished , readProgress: 0});
                /*
                 * Once all temperature measurements are made, save to evolver.
                 * TODO: Count by power levels, maybe have a button to trigger
                 * saving instead. If moved to button, delete this
                */

                if (this.state.vialData.length === 16) {
                    var d = new Date();
                    var currentTime = d.getTime();
                    var saveData = {time: currentTime, vialData: this.state.vialData, inputData:this.state.inputValueFloat};
                    this.props.socket.emit('calibrationraw', saveData);
                }
            }
        this.props.socket.emit('data', {power_level: this.state.powerLevel});
        });
    }.bind(this));



  }

  startRead = () => {
    this.setState({readProgress: this.state.readProgress + .01});
    var newVialData = this.state.vialData;

    // remove existing data for particular layout
    for (var i = 0; i < newVialData.length; i++) {
        if (this.state.currentStep === this.state.vialData[i].step && this.state.powerLevel === this.state.vialData[i].powerLevel) {
            newVialData.splice(i, 1);
            break;
        }
    }

    newVialData.push({OD:[], temp:[], step: this.state.currentStep, powerLevel:2125});
    this.setState({vialData:newVialData});
    this.props.socket.emit('data', {});
  }

  stopRead = () => {
    this.setState({readProgress: 0})
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

   if (this.state.currentStep === 16){
     disableForward = false;
   }
   if (this.state.currentStep === 2){
     disableBackward = true;
   }
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
   if (this.state.currentStep === 15){
     disableForward = true;
   }
   this.setState({
     disableForward: disableForward,
     disableBackward: disableBackward,
     currentStep: currentStep
     });
  };

  handleTempInput = (tempValues) => {
     this.setState({inputValue: tempValues});
   }


  handleStepOne = () => {
   let floatValues = [];
   var i;
   for (i = 0; i < this.state.inputValue.length; i++) {
     floatValues[i] = parseFloat(this.state.inputValue[i]);
   }

   let inputOD = JSON.parse(JSON.stringify(floatValues));
   let normalizedOD = normalize(inputOD);
   this.setState({
     inputValueFloat: floatValues,
     vialOpacities: normalizedOD,
     inputsEntered: true,
     generalSampleOpacity: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
   });
  }

  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;

    let measureButton;
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
      </button>
    }


    let statusText;
    if (!this.state.inputsEntered) {
      statusText = <p className="statusText"> Please load vessels with 15 mL of room temperature water. </p>
    }

    return (
      <div>
        <h3 className="odCalTitles"> Temperature Calibration &deg;C </h3>
        <Link className="backHomeBtn" id="experiments" to={{pathname:routes.CALMENU, socket:this.props.socket}}><FaArrowLeft/></Link>
        <TempcalInput
          onChangeValue={this.handleTempInput}
          onInputsEntered = {this.state.inputsEntered}
          inputValue = {this.state.inputValue}/>

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
            ref={this.child}
            vialOpacities = {this.state.vialOpacities}
            generalOpacity = {this.state.generalSampleOpacity}
            valueInputs = {this.state.tempInputsFloat}
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
