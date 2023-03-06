// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';
import {Link} from 'react-router-dom';
import routes from '../constants/routes.json';
import {withStyles} from '@material-ui/core/styles';
import ODCalInput0 from './calibrationInputs/CalInputs';
import ODCalInput1 from './calibrationInputs/CalInputs';
import ODCalInput2 from './calibrationInputs/CalInputs';
import ODCalInput3 from './calibrationInputs/CalInputs';
import Card from '@material-ui/core/Card';
import ODCalGUI from './calibrationInputs/ODCalGUI';
import LinearProgress from '@material-ui/core/LinearProgress';
import {FaPlay,FaArrowLeft,FaArrowRight,FaStop,FaCheck,FaPen} from 'react-icons/fa';
import normalize from 'array-normalize'
import CircularProgress from '@material-ui/core/CircularProgress';
import TextKeyboard from './calibrationInputs/TextKeyboard';
import ModalAlert from './calibrationInputs/ModalAlert';
import VialArrayGraph from './graphing/VialArrayGraph';

const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store(); //runningODCal
const remote = require('electron').remote;
const app = remote.app;
const http = require('https');
var path = require('path');
var fs = require('fs');

const cardStyles = theme => ({
  cardODCalGUI: {
    width: 570,
    height: 800,
    backgroundColor: 'transparent',
    margin: '-17px 0px 0px 500px',
    position: 'absolute'
  },
  progressBar: {
    flexGrow: 1,
    margin: '-15px 0px 0px 0px',
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
    strokeWidth: '5px'
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
      vialOpacities: [[],[],[],[]],//new Array(4).fill([]),
      enteredValues: new Array(4).fill().map(() => Array(18).fill('')), //Array(4).fill('')
      generalOpacity: new Array(4).fill().map(() => Array(18).fill(0)), //Array(4).fill(0)
      inputsEntered: false,
      enteredValuesFloat: [[],[],[],[]], //Array(4).fill([]),
      readProgress: 0,
      skipFirst: true,
      vialProgress: Array(4).fill(0),
      selectedSmartQuad: 0,
      vialLabels: Array(4).fill(['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17']),
      quadsData: {'od90': [[],[],[],[]]},
      timesRead: 3,
      experimentName: '',
      alertOpen: false,
      alertQuestion: 'Running calibration...',
      alertAnswers: ['Retry', 'Exit'],
      exiting: false,
      resumeOpen: false,
      resumeQuestion: 'Start new calibration or resume?',
      resumeAnswers: ['New', 'Resume'],
      keyboardPrompt: "Enter File Name or press ESC to autogenerate.",
      vialsRead: 0,
      displayGraphs: false,
      displayCalibration: true,
      calibration: null
    };
    if (!fs.existsSync(path.join(app.getPath('userData'), 'calibration'))) {
        fs.mkdirSync(path.join(app.getPath('userData'), 'calibration'));
        var calibrationsFile = fs.createWriteStream(path.join(app.getPath('userData'), 'calibration', 'calibrate.py'));
        var calibrationScriptRequest = http.get("https://raw.githubusercontent.com/ezirayw/dpu/ht-evolver/calibration/calibrate.py", function(response) {response.pipe(calibrationsFile)});
    }
    ipcRenderer.on('calibration-finished', (event, calibrationName) => {this.props.socket.emit('getcalibration', {name: calibrationName})});
    this.props.socket.on('calibration', function(response) {
        this.setState({displayGraphs: true, displayCalibration: true, alertOpen: false, calibration: response});
    }.bind(this));
    this.props.socket.on('broadcast', function(response) {
      if (response.dummy) {
        return;
      }

      // Structure incoming od_90_left and od_90_right data to properly map onto vial order on smart quad
      let indexValues = [[0,1,2,3,4,5,6,7,8],[9,10,11,12,13,14,15,16,17],[18,19,20,21,22,23,24,25,26],[27,28,29,30,31,32,33,34,35]]
      let odLeft = [[],[],[],[]];
      let odRight = [[],[],[],[]];
      for (var i = 0; i < odLeft.length; i++) {
        odLeft[i] = response.data.od_90_left.filter((x,index) => indexValues[i].includes(index));
        odRight[i] = response.data.od_90_right.filter((x,index) => indexValues[i].includes(index));
      }

      let odData = [[],[],[],[]]
      for (var i = 0; i < odData.length; i++) {
        odData[i].push(odLeft[i][0], odLeft[i][1], odLeft[i][2], odRight[i][0], odRight[i][1], odRight[i][2]);
        odData[i].push(odLeft[i][3], odLeft[i][4], odLeft[i][5], odRight[i][3], odRight[i][4], odRight[i][5]);
        odData[i].push(odLeft[i][6], odLeft[i][7], odLeft[i][8], odRight[i][6], odRight[i][7], odRight[i][8]);
      }

      let newquadsData = this.state.quadsData;
      // if stop was pressed or user still moving vials around, don't want to continue
      if (this.state.readProgress === 0) {
        return;
      }

      // Add the data into the data structures
      if (!this.state.skipFirst) {
        if (response.data.od_90_left && response.data.od_90_right) {
          this.progress();
          /*
             Note on indexing: Because vials are being shuffled around during a calibration,
             the data is not collected in order, ie the vial with OD 0 would be the 3rd
             data point collected for vial 2. To shift them properly,
             use the formula: (-currentStep -1) + vialIndex. If this is negative,
             do 15 - <value>.
          */
          for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 18; j++) {
              var shift = this.calculateShift(j);
              newquadsData.od90[i][j][shift].push(parseInt(odData[i][j]));
              /*
              if (response.data.od_135) {
                newquadsData.od135[i][shift].push(parseInt(response.data.od_135[i]));
              }
              */
              //newquadsData.temp[i][j][shift].push(parseInt(response.data.temp[i]));
            }
          }
        }
      } else {
        this.progress();
      }

      var progressCompleted = (100 * ((this.state.readsFinished) / 18));
      var readProgress = this.state.readProgress;
      var readsFinished = 0;
      var newSkipFirst = false;

      // Check how many reads have been finished by looking through the data structure
      for (var i = 0; i < 18; i++) {
        if (newquadsData.od90[0][0][i].length === this.state.timesRead) {
          readsFinished += 1;
        }
      }

      // This means we've finished - we have all the measurements we need for this step.
      if (readProgress >= 100) {
        readProgress = 0;
        progressCompleted = (100 * ((readsFinished) / 18));
        this.handleUnlockBtns();
        newSkipFirst = true;
      }
      this.setState({
        quadsData: newquadsData,
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
        store.delete('runningODCal');
        ipcRenderer.send('start-calibration', this.state.experimentName, this.props.socket.io.opts.hostname, 'sigmoid', this.state.experimentName, 'od_90', true);
      }
    }.bind(this));
  }

  componentDidMount() {
    this.props.logger.info('Routed to Density Calibration Page.')
    if (store.has('runningODCal')) {
      this.setState({
        resumeOpen: true
      })
    } else {
      this.keyboard.current.onOpenModal();
    }
    this.setState({
      vialOpacities: Array(4).fill([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),
    })
  };

  componentWillUnmount() {
    this.props.socket.removeAllListeners('broadcast');
    this.props.socket.removeAllListeners('calibrationrawcallback');
    this.setState({
      readProgress: 0
    });
  };


  startRead = () => {
    this.handleLockBtns();
    var newquadsData = this.state.quadsData;

    // Initialization of data lists
    // First dimension is Vial
    // Second dimension is step number
    // Each step will be a list with 3 technical replicates
    if (newquadsData.od90[0].length === 0) {
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 18; j++) {
          newquadsData.od90[i].push([]);
          //newquadsData.temp[i].push([]);
          for (var k = 0; k < 18; k++) {
            // fill these guys with nothing to start just to
            newquadsData.od90[i][j].push([]);
            //newquadsData.temp[i][j].push([]);
          }
        }
      }
    }

    // remove existing data for particular layout
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 18; j++) {
        newquadsData.od90[i][j][this.calculateShift(j)] = [];
        //newquadsData.temp[i][this.calculateShift(j)] = [];
      }
    }
    this.setState({
      quadsData: newquadsData,
      readProgress: this.state.readProgress + .01
    });
  };

  stopRead = () => {
    this.props.socket.emit('stopread', {});
    this.handleUnlockBtns()
    // remove existing data for particular layout
    var newquadsData = this.state.quadsData;
    if (this.quadsData) {
      for (var i = 0; i < this.quadsData.od90.length; i++) {
        for (var j = 0; j < this.quadsData.od90[i].length; j++) {
          if (newquadsData.od135) {
            newquadsData.od135[i][this.state.currentStep - 1] = [];
          }
          newquadsData.od90[i][this.state.currentStep - 1] = [];
          //newquadsData.temp[i][this.state.currentStep - 1] = [];
        }
      }
    }
    this.setState({
      readProgress: 0,
      quadsData: newquadsData,
      skipFirst: true
    });
  }

  progress = () => {
    let readProgress = this.state.readProgress;
    readProgress = readProgress + (100 / (this.state.timesRead + 1));
    this.setState({
      readProgress: readProgress
    });
  };

  handleBack = () => {
    var disableForward;
    var disableBackward;
    var currentStep = this.state.currentStep - 1;

    if (this.state.currentStep === 18) {
      disableForward = false;
    }
    if (this.state.currentStep === 2) {
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
    if (currentStep > 18) {
      currentStep = 18;
    }
    if (currentStep < 1) {
      currentStep = 1;
    }

    if (this.state.currentStep === 1) {
      disableBackward = false;
    }
    if (this.state.currentStep === 18) {
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

    if (this.state.currentStep === 1) {
      disableBackward = true;
      disableForward = false;
    }
    if (this.state.currentStep === 18) {
      disableBackward = false;
      disableForward = true;
    }
    this.setState({
      disableForward: disableForward,
      disableBackward: disableBackward,
    });
  };

  handleODChange = (odValues) => {
    let newEnteredValues = this.state.enteredValues;
    newEnteredValues[this.state.selectedSmartQuad] = odValues;
    this.setState({
      enteredValues: newEnteredValues
    });
  }

  handleStepOne = () => {
    let floatValues = this.state.enteredValuesFloat;
    for (var i = 0; i < this.state.enteredValues.length; i++) {
      let temp = [];
      for (var j = 0; j < this.state.enteredValues[i].length; j++) {
        temp[j] = parseFloat(this.state.enteredValues[i][j]);
      }
      floatValues[i] = temp;
    }

    let newVialOpacities = this.state.vialOpacities;
    for (var i = 0; i < this.state.enteredValues.length; i++) {
      let inputOD = JSON.parse(JSON.stringify(floatValues[i]));
      let normalizedOD = normalize(inputOD);
      newVialOpacities[i] = normalizedOD;
    }
    this.setState({
      enteredValuesFloat: floatValues,
      vialOpacities: newVialOpacities,
      inputsEntered: true,
      generalOpacity: Array(4).fill().map(() => Array(18).fill(1))
    });
  }

  handleKeyboardInput = (input) => {
    var exptName;
    if (input == '') {
      exptName = 'ODCal-' + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    } else {
      exptName = input
    }
    this.setState({
      experimentName: exptName
    });
  }

  handleFinishExpt = () => {
    this.setState({alertOpen: true})
    console.log("Experiment Finished!");
    var d = new Date();
    var currentTime = d.getTime();

    var rawList = [];
    var saveData = {
      name: this.state.experimentName,
      calibrationType: "od",
      timeCollected: currentTime,
      measuredData: this.state.enteredValuesFloat,
      fits: []
    };
    if (this.state.quadsData.od90[0][0].length > 0) {
      rawList.push({
        param: 'od_90',
        quadsData: this.state.quadsData.od90
      });
    }
    saveData.raw = rawList;
    this.props.socket.emit('setrawcalibration', saveData);

  };

  handleKeyboardModal = () => {
    this.keyboard.current.onOpenModal();
  };

  onAlertAnswer = (answer) => {
    if (answer == 'Retry') {
      this.handleFinishExpt();
    }
    if (answer == 'Exit') {
      store.delete('runningODCal');
      this.setState({
        exiting: true
      });
    }
  };

  onResumeAnswer = (answer) => {
    if (answer == 'New') {
      this.keyboard.current.onOpenModal();
      store.delete('runningODCal');
    }
    if (answer == 'Resume') {
      var previousState = store.get('runningODCal');
      this.setState(previousState);
    }
    this.setState({
      resumeOpen: false
    })
  };

  calculateShift = (i) => {
    var shift = -(this.state.currentStep - 1) + i;
    if (shift < 0) {
      shift = 18 + shift;
    }
    return shift;
  };

  handleSmartQuadSelection = (selectedSmartQuad) => {
    this.setState({
      selectedSmartQuad: selectedSmartQuad
    }, () => {
    });
  };

  handleGraph = () => {
    this.setState({displayGraphs: !this.state.displayGraphs})};

  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;

    let measureButton;
    if (this.state.readProgress === 0) {
      measureButton = <button
      className = "measureBtn"
      onClick = {this.startRead} ><FaPlay / >
      </button>;
      try {
        if (this.state.quadsData.od135[0][this.calculateShift(0)].length === this.state.timesRead) {
          measureButton = <button
          className = "measureBtn"
          onClick = {this.startRead} ><FaCheck / >
      </button>;
        }
      } catch (err) {}
    } else {
      measureButton =
        <button
          className = "measureBtn"
          onClick = {this.stopRead}>
          <CircularProgress
            classes = {{
              colorPrimary: classes.circleProgressColor,
              circle: classes.circle
            }}
            variant="static"
            value={this.state.readProgress}
            color="primary"
            size={35}
          />
          <FaStop size={17} className="readStopBtn"/>
        </button>
    }

    let btnRight;
    if ((this.state.progressCompleted >= 100) && (this.state.currentStep === 18)) {
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
          onClick={this.handleAdvance}> <FaArrowRight/>
        </button>
    }

    let progressButtons;
    if (this.state.inputsEntered) {
        progressButtons = <div>
        <div className="row" style={{position: 'absolute'}}>
          <button
            className="tempBackBtn"
            disabled={this.state.disableBackward}
            onClick={this.handleBack}> <FaArrowLeft/>
          </button>
          {measureButton}
          {btnRight}
          </div>
        <button className="odViewGraphBtn" onClick={this.handleGraph}>VIEW COLLECTED DATA</button>
        </div>;
    } else {
      progressButtons =
      <div className="row" >
        <button
          className="stepOneBtn"
          onClick={this.handleStepOne}> Record Sample Densities <FaPlay size = {17}/>
        </button>
      </div>;
    }

    let calGraphic = null;
    let statusText;
    if (!this.state.inputsEntered) {
      statusText = < p className = "statusText" > Please enter OD calibration Values. < /p>
    } else if (this.state.readProgress !== 0) {
      statusText = < p className = "statusText" > Collecting raw values from eVOLVER... < /p>
    } else if (this.state.inputsEntered && (this.state.quadsData.length !== 0)) {
      statusText = < p className = "statusText" > {this.state.readsFinished}/18 Measurements Made </p >
    } else if (this.state.inputsEntered) {
      statusText = < p className = "statusText" > Calibration values locked!Follow sample mapping above. < /p>
    }

    if (this.state.exiting) {
      return <Redirect push to = {
        {
          pathname: routes.CALMENU,
          socket: this.props.socket,
          logger: this.props.logger
        }
      }
      />;
    }

    let linearProgress;
    let graphs;
    let odCalInput;
    let odCalTitles = <div></div>;
    let backArrow = <Link className="backHomeBtn" id="experiments" to={{pathname:routes.CALMENU, socket:this.props.socket , logger:this.props.logger}}><FaArrowLeft/></Link>;
    if (this.state.displayGraphs) {
        linearProgress = <div></div>
        graphs = <VialArrayGraph
            selectedSmartQuad = {this.state.selectedSmartQuad}
            parameter = {this.state.parameter}
            exptDir = {'na'}
            activePlot = {'ALL'}
            ymax = {65000}
            timePlotted = {this.state.timePlotted}
            downsample = {this.state.downsample}
            xaxisName = {'OPTICAL DENSITY'}
            yaxisName = {'ADC VALUE'}
            displayCalibration = {this.state.displayCalibration}
            dataType = {{type:'calibration', param: 'od90'}}
            passedData = {{quadsData: this.state.quadsData, enteredValuesFloat: this.state.enteredValuesFloat, calibration: this.state.calibration}}/>;
        odCalInput = <div></div>;
        progressButtons = <div><button className="odViewGraphBtnBack" onClick={this.handleGraph}>BACK</button></div>;
        backArrow = <button className="backHomeBtn" style={{zIndex: '10', position: 'absolute', top: '-2px', left: '-35px'}} id="experiments" onClick={this.handleGraph}><FaArrowLeft/></button>
    }
    else {
      linearProgress = <div><LinearProgress
            classes= {{
              root: classes.progressBar,
              colorPrimary: classes.colorPrimary,
              bar: classes.bar
            }}
            variant="determinate"
            value={this.state.progressCompleted} />
          {statusText}</div>;
      graphs = <div></div>;

      if (this.state.selectedSmartQuad == 0) {
        odCalInput = < ODCalInput0
        key={'ODCalInput0'}
        id={'ODCalInput0'}
        onChangeValue = {this.handleODChange}
        onInputsEntered = {this.state.inputsEntered}
        currentSmartQuad = {this.state.selectedSmartQuad}
        enteredValues = {this.state.enteredValues[this.state.selectedSmartQuad]}/>
      } else if (this.state.selectedSmartQuad == 1) {
        odCalInput = < ODCalInput1
        key={'ODCalInput1'}
        id={'ODCalInput1'}
        onChangeValue = {this.handleODChange}
        onInputsEntered = {this.state.inputsEntered}
        currentSmartQuad = {this.state.selectedSmartQuad}
        enteredValues = {this.state.enteredValues[this.state.selectedSmartQuad]}/>
      } else if (this.state.selectedSmartQuad == 2) {
        odCalInput = < ODCalInput2
        key={'ODCalInput2'}
        id={'ODCalInput2'}
        onChangeValue = {this.handleODChange}
        onInputsEntered = {this.state.inputsEntered}
        currentSmartQuad = {this.state.selectedSmartQuad}
        enteredValues = {this.state.enteredValues[this.state.selectedSmartQuad]}/>
      } else if (this.state.selectedSmartQuad == 3) {
        odCalInput = < ODCalInput3
        key={'ODCalInput3'}
        id={'ODCalInput3'}
        onChangeValue = {this.handleODChange}
        onInputsEntered = {this.state.inputsEntered}
        currentSmartQuad = {this.state.selectedSmartQuad}
        enteredValues = {this.state.enteredValues[this.state.selectedSmartQuad]}/>
      }
      odCalTitles = <button
        className="odCalTitles"
        onClick={this.handleKeyboardModal}><h4 style={{fontWeight: 'bold', fontStyle: 'italic'}}> {this.state.experimentName} </h4></button>
    }
    calGraphic = <div><Card className={classes.cardODCalGUI}>
            <ODCalGUI
              ref={this.child}
              displayGraphs = {this.state.displayGraphs}
              vialOpacities = {this.state.vialOpacities}
              generalOpacity = {this.state.generalOpacity}
              valueInputs = {this.state.enteredValuesFloat}
              readProgress = {this.state.vialProgress}
              onSmartQuadSelection = {this.handleSmartQuadSelection}
              vialLabels = {this.state.vialLabels}/>
              {linearProgress}
          </Card>
        </div>
    return (
      <div>
        {backArrow}
        {calGraphic}
        {odCalInput}
        {graphs}
        {progressButtons}
        {odCalTitles}

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

export default withStyles(cardStyles, {
  withTheme: true
})(ODcal);
