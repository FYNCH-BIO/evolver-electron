// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import ODcalInput from './calibrationInputs/CalInputs';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import ODcalGUI from './calibrationInputs/CalGUI';
import LinearProgress from '@material-ui/core/LinearProgress';
import {FaPlay, FaArrowLeft, FaArrowRight, FaStop, FaCheck } from 'react-icons/fa';
import normalize from 'array-normalize'
import CircularProgress from '@material-ui/core/CircularProgress';

const densityButtons = Array.from(Array(16).keys())

const cardStyles = theme => ({
  cardODcalGUI: {
    width: 570,
    height: 800,
    backgroundColor: 'transparent',
    margin: '0px 0px 0px 500px',
    position: 'absolute'
  },
  progressBar: {
    flexGrow: 1,
    margin: '27px 0px 0px 0px',
    height: 8
  },
  colorPrimary: {
    backgroundColor: 'white'
  },
  bar: {
    backgroundColor: '#f58245'
  },
  circleProgressColor: {
    color: '#f58245'
  },
  circle: {
    strokeWidth: '3px'
  }
});

class ODcal extends React.Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      currentStep: 1,
      readsFinished: 0,
      disableForward: false,
      disableBackward: true,
      progressCompleted: 0,
      vialOpacities: [],
      enteredValues: Array(16).fill(''),
      generalOpacity: Array(16).fill(0),
      inputsEntered: false,
      enteredValuesFloat: [],
      readProgress: 0,
      vialProgress: Array(16).fill(0),
      vialLabels: ['S0','S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15'],
      vialData: [],
      powerLevel: 2125,
      timesRead: 3
    };
    this.props.socket.on('dataresponse', function(response) {
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
                this.handleUnlockBtns()
                var readsFinished = this.state.vialData.length;
                this.setState({progressCompleted: (100 * (this.state.vialData.length / 16)), readsFinished: readsFinished, readProgress: 0});
                /*
                 * Once all 16 measurements are made, save to evolver.
                 * TODO: Count by power levels, maybe have a button to trigger
                 * saving instead. If moved to button, delete this
                */

                if (this.state.vialData.length === 16) {
                    var d = new Date();
                    var currentTime = d.getTime();
                    var saveData = {time: currentTime, vialData: this.state.vialData, inputData:this.state.enteredValuesFloat};
                    this.props.socket.emit('calibrationraw', saveData);
                }
            }
        this.props.socket.emit('data', {power_level: this.state.powerLevel});
        });
    }.bind(this));
  }

  componentDidMount() {
    this.setState({
      vialOpacities: Array(16).fill(0),
      })

  };


  startRead = () => {
    this.handleLockBtns()
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
    this.handleUnlockBtns()
    this.setState({readProgress: 0});
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
    this.child.current.handleBack();
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
    this.child.current.handleAdvance();
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
    if (this.state.currentStep === 15){
      disableBackward = false;
      disableForward = true;
    }
    this.setState({
      disableForward: disableForward,
      disableBackward: disableBackward,
      });
  };

  handleODChange = (odValues) => {
      this.setState({enteredValues: odValues});
    }

  handleStepOne = () => {
    let floatValues = [];
    var i;
    for (i = 0; i < this.state.enteredValues.length; i++) {
      floatValues[i] = parseFloat(this.state.enteredValues[i]);
    }

    let inputOD = JSON.parse(JSON.stringify(floatValues));
    let normalizedOD = normalize(inputOD);
    this.setState({
      enteredValuesFloat: floatValues,
      vialOpacities: normalizedOD,
      inputsEntered: true,
      generalOpacity: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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

    let progressButtons;
    if (this.state.inputsEntered) {
      progressButtons =
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
        </div>;
    } else {
      progressButtons =
      <div className="row">
        <button
          className="stepOneBtn"
          onClick={this.handleStepOne}>
          Record Sample Densities <FaPlay size={17}/>
        </button>
      </div>;
          }

    let statusText;
    if (!this.state.inputsEntered) {
      statusText = <p className="statusText"> Please enter OD calibration Values. </p>
    }
    else if (this.state.readProgress !== 0){
      statusText = <p className="statusText"> Collecting raw values from eVOLVER... </p>
    }
    else if (this.state.inputsEntered && (this.state.vialData.length !== 0)){
      statusText = <p className="statusText"> {this.state.readsFinished}/16 Measurements Made </p>
    }
    else if (this.state.inputsEntered){
      statusText = <p className="statusText"> Calibration values locked! Follow sample mapping above. </p>
    }

    return (
      <div>
        <h3 className="odCalTitles"> Optical Denisty Calibration </h3>
        <Link className="backHomeBtn" id="experiments" to={{pathname:routes.CALMENU, socket:this.props.socket}}><FaArrowLeft/></Link>
        <ODcalInput
          onChangeValue={this.handleODChange}
          onInputsEntered = {this.state.inputsEntered}
          enteredValues = {this.state.enteredValues}/>
        {progressButtons}

        <Card className={classes.cardODcalGUI}>
          <ODcalGUI
            ref={this.child}
            vialOpacities = {this.state.vialOpacities}
            generalOpacity = {this.state.generalOpacity}
            valueInputs = {this.state.enteredValuesFloat}
            initialZipped = {this.state.initialZipped}
            readProgress = {this.state.vialProgress}
            vialLabels = {this.state.vialLabels}/>

          <LinearProgress
            classes= {{
              root: classes.progressBar,
              colorPrimary: classes.colorPrimary,
              bar: classes.bar
            }}
            variant="determinate"
            value={this.state.progressCompleted} />

          {statusText}


        </Card>
      </div>

    );
  }
}

export default withStyles(cardStyles, { withTheme: true })(ODcal);
