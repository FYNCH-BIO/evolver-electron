// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import ODcalInput from './calibrationInputs/CalInputs';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import ODcalGUI from './calibrationInputs/CalGUI';
import LinearProgress from '@material-ui/core/LinearProgress';
import {FaPlay, FaArrowLeft, FaArrowRight, FaStop, FaCheck, FaPen } from 'react-icons/fa';
import normalize from 'array-normalize'
import CircularProgress from '@material-ui/core/CircularProgress';
import TextKeyboard from './calibrationInputs/TextKeyboard';
import ModalAlert from './calibrationInputs/ModalAlert';
const Store = require('electron-store');
const store = new Store(); //runningODCal

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
    this.keyboard = React.createRef();
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
      skipFirst: true,
      vialProgress: Array(16).fill(0),
      vialLabels: ['S0','S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15'],
      vialData: {'od135':[],'od90':[],'temp':[]},
      timesRead: 3,
      experimentName:'',
      alertOpen: false,
      alertQuestion: 'Logging Values...',
      alertAnswers: ['Retry', 'Exit'],
      exiting: false,
      resumeOpen: false,
      resumeQuestion: 'Start new calibration or resume?',
      resumeAnswers: ['New', 'Resume'],
      keyboardPrompt: "Enter File Name or press ESC to autogenerate.",
      vialsRead: 0
    };
    this.props.socket.on('broadcast', function(response) {
        console.log(response);
        console.log(this.state.vialData);
        var newVialData = this.state.vialData;
        // if stop was pressed or user still moving vials around, don't want to continue
        if (this.state.readProgress === 0) {
            return;
        }

        // Add the data into the data structures
        if (!this.state.skipFirst) {
          if (response.data.od_90 && response.data.temp) {
            this.progress();
            /*
               Note on indexing: Because vials are being shuffled around during a calibration,
               the data is not collected in order, ie the vial with OD 0 would be the 3rd
               data point collected for vial 2. To shift them properly,
               use the formula: (-currentStep -1) + vialIndex. If this is negative,
               do 15 - <value>.
            */
            for (var i = 0; i < response.data.od_90.length; i++) {
              var shift = this.calculateShift(i);
              if (response.data.od_135) {
                newVialData.od135[i][shift].push(parseInt(response.data.od_135[i]));
              }
              newVialData.od90[i][shift].push(parseInt(response.data.od_90[i]));
              newVialData.temp[i][shift].push(parseInt(response.data.temp[i]));
            }
          }
        }
        else {
          this.progress();
        }

        var progressCompleted = (100 * ((this.state.readsFinished) / 16));
        var readProgress = this.state.readProgress;
        var readsFinished = 0;
        var newSkipFirst = false;

        // Check how many reads have been finished by looking through the data structure
        for (var i = 0; i < 16; i++) {
          if (newVialData.od90[0][i].length === this.state.timesRead) {
            readsFinished += 1;
          }
        }

        // This means we've finished - we have all the measurements we need for this step.
        if (readProgress >= 100) {
          readProgress = 0;
          progressCompleted = (100 * ((readsFinished) / 16));
          this.handleUnlockBtns();
          newSkipFirst = true;
        }
        this.setState({vialData: newVialData,
          readProgress: readProgress,
          progressCompleted: progressCompleted,
          readsFinished: readsFinished,
          skipFirst: newSkipFirst
        }, function() {
          if (this.state.progressCompleted === 100) {
            store.set('runningODCal', this.state);
          }
        });
    }.bind(this));

    this.props.socket.on('calibrationrawcallback', function(response) {
      if (response == 'success'){
        this.setState({alertQuestion: 'Successfully Logged. Do you want to exit?'})
      }
    }.bind(this));
  }

  componentDidMount() {
    this.props.logger.info('Routed to Density Calibration Page.')
    if (store.has('runningODCal')){
      this.setState({resumeOpen:true})
    } else {
      this.keyboard.current.onOpenModal();
    }
    this.setState({
      vialOpacities: Array(16).fill(0),
      })
  };

  componentWillUnmount() {
    this.props.socket.removeAllListeners('broadcast');
    this.props.socket.removeAllListeners('calibrationrawcallback');
    this.setState({readProgress: 0});
  };


  startRead = () => {
    this.handleLockBtns();
    var newVialData = this.state.vialData;

    // Initialization of data lists
    // First dimension is Vial
    // Second dimension is step number
    // Each step will be a list with 3 technical replicates
    if (newVialData.od135.length === 0) {
      for (var i = 0; i < 16; i++) {
        newVialData.od135.push([]);
        newVialData.od90.push([]);
        newVialData.temp.push([]);
        for (var j = 0; j < 16; j++) {
          // fill these guys with nothing to start just to
          newVialData.od135[i].push([]);
          newVialData.od90[i].push([]);
          newVialData.temp[i].push([]);
        }
      }
    }

    // remove existing data for particular layout
    for (var i = 0; i < newVialData.od135.length; i++) {
      newVialData.od135[i][this.calculateShift(i)] = [];
      newVialData.od90[i][this.calculateShift(i)] = [];
      newVialData.temp[i][this.calculateShift(i)] = [];
    }
    this.setState({vialData:newVialData, readProgress: this.state.readProgress + .01});
  };

  stopRead = () => {
    this.props.socket.emit('stopread', {});
    this.handleUnlockBtns()
    // remove existing data for particular layout
    var newVialData = this.state.vialData;
    if (this.vialData) {
      for (var i = 0; i < this.vialData.od90.length; i++) {
            if (newVialData.od135) {
              newVialData.od135[i][this.state.currentStep - 1] = [];
            }
            newVialData.od90[i][this.state.currentStep - 1] = [];
            newVialData.temp[i][this.state.currentStep - 1] = [];
          }
    }
    this.setState({readProgress: 0, vialData: newVialData, skipFirst: true});
  }

  progress = () => {
     let readProgress = this.state.readProgress;
     readProgress = readProgress + (100/(this.state.timesRead + 1));
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

    // Just in case. Somehow this can go out of it's bounds and cause weirdness
    if (currentStep > 16) {
       currentStep = 16;
    }
    if (currentStep < 1) {
        currentStep = 1;
    }

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
    if (this.state.currentStep === 16){
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

  handleKeyboardInput = (input) => {
    var exptName;
    if (input == ''){
      exptName = 'ODCal-' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    } else {
      exptName = input
    }
    this.setState({experimentName: exptName});
  }

  handleFinishExpt = () => {
    this.setState({alertOpen: true})
    console.log("Experiment Finished!");
    var d = new Date();
    var currentTime = d.getTime();

    var rawList = [];
    var saveData = {name: this.state.experimentName, calibrationType: "od", timeCollected: currentTime, measuredData: Array(16).fill(this.state.enteredValuesFloat), fits:[]};
    if (this.state.vialData.od90[0][0].length > 0) {
      rawList.push({param: 'od_90', vialData: this.state.vialData.od90});
    }
    if (this.state.vialData.od135[0][0].length > 0) {
      rawList.push({param: 'od_135', vialData: this.state.vialData.od135});
    }
    rawList.push({param: 'temp', vialData: this.state.vialData.temp});
    saveData.raw = rawList;
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
      store.delete('runningODCal');
      this.setState({exiting: true});
    }
  }

  onResumeAnswer = (answer) => {
    if (answer == 'New'){
      this.keyboard.current.onOpenModal();
      store.delete('runningODCal');
    }
    if (answer == 'Resume'){
      var previousState = store.get('runningODCal');
      this.setState(previousState);
    }
    this.setState({resumeOpen:false})
  }

  calculateShift = (i) => {
    var shift = -(this.state.currentStep - 1) + i;
    if (shift < 0) {
      shift = 16 + shift;
    }
    return shift;
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
        try {
          if (this.state.vialData.od135[0][this.calculateShift(0)].length === this.state.timesRead){

              measureButton =
              <button
                className="measureBtn"
                onClick = {this.startRead}>
                 <FaCheck/>
              </button>;
            }
        }
        catch(err) {}
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

    let btnRight;
    if  ((this.state.progressCompleted >= 100) && (this.state.currentStep === 16)){
      btnRight =
        <button
          className="odAdvanceBtn"
          onClick={this.handleFinishExpt}>
          <FaPen/>
        </button>
    } else {
      btnRight =
        <button
          className="odAdvanceBtn"
          disabled={this.state.disableForward}
          onClick={this.handleAdvance}>
          <FaArrowRight/>
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
          {btnRight}
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

    if (this.state.exiting) {
      return <Redirect push to={{pathname:routes.CALMENU, socket:this.props.socket, logger:this.props.logger}} />;
    }

    return (
      <div>
        <Link className="backHomeBtn" id="experiments" to={{pathname:routes.CALMENU, socket:this.props.socket , logger:this.props.logger}}><FaArrowLeft/></Link>
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

        <button
          className="odCalTitles"
          onClick={this.handleKeyboardModal}>
          <h4 style={{fontWeight: 'bold', fontStyle: 'italic'}}> {this.state.experimentName} </h4>
        </button>
        <TextKeyboard ref={this.keyboard} onKeyboardInput={this.handleKeyboardInput} keyboardPrompt={this.state.keyboardPrompt}/>
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

export default withStyles(cardStyles, { withTheme: true })(ODcal);
