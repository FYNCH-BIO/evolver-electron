// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import ODcalInput from './calibrationInputs/ODcalInputs';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import ODcalGUI from './calibrationInputs/ODcalGUI';
import LinearProgress from '@material-ui/core/LinearProgress';
import {FaPlay, FaArrowLeft, FaArrowRight, FaStop } from 'react-icons/fa';
import normalize from 'array-normalize'
import CircularProgress from '@material-ui/core/CircularProgress';


const densityButtons = Array.from(Array(16).keys())

const cardStyles = theme => ({
  cardODcalGUI: {
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
});

class ODcal extends React.Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      currentStep: 1,
      disableForward: false,
      disableBackward: true,
      progressCompleted: 0,
      vialOpacities: [],
      odInputs: [],
      generalSampleOpacity: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      inputsEntered: false,
      odInputsFloat: [],
      readProgress: 0,
    };
  }

  startRead = () => {
    this.timer = setInterval(this.progress, 1000);
    this.setState({readProgress: this.state.readProgress + .01})
  }

  stopRead = () => {
    this.setState({readProgress: 0})
    clearInterval(this.timer);
  }

  progress = () => {
     let readProgress = this.state.readProgress;
     if (readProgress < 100 ) {
       readProgress = readProgress + 10
       this.setState({readProgress: readProgress})
     }
     else {
       this.setState({readProgress: 0})
       clearInterval(this.timer);
     }
   };

  handleBack = () => {
    var disableForward
    var disableBackward
    var currentStep = this.state.currentStep - 1
    var progressCompleted = 100*(currentStep/16)

    if (this.state.currentStep == 16){
      disableForward = false
    }
    if (this.state.currentStep == 2){
      disableBackward = true
    }
    this.child.current.handleBack();
    this.setState({
      disableForward: disableForward,
      disableBackward: disableBackward,
      currentStep: currentStep,
      progressCompleted: progressCompleted,
      })
  };

  handleAdvance = () => {
    var disableForward
    var disableBackward
    var currentStep = this.state.currentStep + 1
    var progressCompleted = 100*(currentStep/16)

    if (this.state.currentStep == 1){
      disableBackward = false
    }
    if (this.state.currentStep == 15){
      disableForward = true
    }
    this.child.current.handleAdvance();
    this.setState({
      disableForward: disableForward,
      disableBackward: disableBackward,
      currentStep: currentStep,
      progressCompleted: progressCompleted,
      })
  };

  handleODChange = (odValues) => {
      this.setState({odInputs: odValues});
    }

  handleStepOne = () => {
    let floatValues = []
    var i;
    for (i = 0; i < this.state.odInputs.length; i++) {
      floatValues[i] = parseFloat(this.state.odInputs[i])
    }

    let inputOD = JSON.parse(JSON.stringify(floatValues));
    let normalizedOD = normalize(inputOD)
    this.setState({
      odInputsFloat: floatValues,
      vialOpacities: normalizedOD,
      inputsEntered: true,
      generalSampleOpacity: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      progressCompleted: this.state.progressCompleted + 6.25});
  }

  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;

    let measureButton;
    if (this.state.readProgress == 0) {
      measureButton =
        <button
          className="measureBtn"
          onClick = {this.startRead}>
           <FaPlay/>
        </button>
    } else {
      measureButton =
      <button
        className="measureBtn">
        <CircularProgress
          classes={{
            colorPrimary: classes.circleProgressColor,
            circle: classes.circle,
            }}
          variant="static"
          value={this.state.readProgress}
          color="primary"
          size= {50}
          onClick= {this.stopRead}
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
    else if (this.state.inputsEntered && (this.state.currentStep==1)){
      statusText = <p className="statusText"> Calibration values locked! Follow sample mapping above. </p>
    }
    else if (this.state.inputsEntered && (this.state.currentStep!=1) && (this.state.currentStep!=16)){
      statusText = <p className="statusText"> {this.state.currentStep}/16 Measurements Made </p>
    }

    return (
      <div>
        <Link className="backHomeBtn" id="experiments" to={routes.CALMENU}><FaArrowLeft/></Link>
        <ODcalInput
          onChangeOD={this.handleODChange}
          onInputsEntered = {this.state.inputsEntered}/>
        {progressButtons}

        <Card className={classes.cardODcalGUI}>
          <ODcalGUI
            ref={this.child}
            vialOpacities = {this.state.vialOpacities}
            generalOpacity = {this.state.generalSampleOpacity}
            odInputs = {this.state.odInputsFloat}/>

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

export default withStyles(cardStyles, { withTheme: true })(ODcal);
