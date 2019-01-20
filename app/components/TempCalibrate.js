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
import {FaPlay, FaArrowLeft, FaArrowRight, FaStop } from 'react-icons/fa';
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

function saveEvolverData(evolverResponse) {
  var newVialData = Array.apply(null, Array(16)).map(function () {});
  var parsedResponse = [];
  for(var i = 0; i < 16; i++) {
    parsedResponse[i] = evolverResponse.temp[i]
  }
  return parsedResponse
}

class TempCal extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props.socket);
    this.child = React.createRef();
    this.state = {
      currentStep: 1,
      disableForward: false,
      disableBackward: true,
      progressCompleted: 0,
      vialOpacities: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      inputValue: Array(16).fill('30'),
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
    // this.child.current.handleBack();
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
    // this.child.current.handleAdvance();
    this.setState({
      disableForward: disableForward,
      disableBackward: disableBackward,
      currentStep: currentStep,
      progressCompleted: progressCompleted,
      })
  };

  handleTempInput = (tempValues) => {
      this.setState({inputValue: tempValues});
    }


  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;


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
