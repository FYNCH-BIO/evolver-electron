// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft} from 'react-icons/fa';
import VialArrayGraph from './graphing/VialArrayGraph';
import VialArrayBtns from './graphing/VialArrayBtns';
import VialMenu from './graphing/VialMenu';
import AceEditor from 'react-ace';

const { dialog } = require('electron').remote

var path = require('path');
var os = require('os');
var zipdir = require('zip-dir');
var fs = require('fs');
var Tail = require('tail').Tail;
var readline = require('readline');

const styles = {
};

const ymaxChoicesOD = ['0.1', '0.5', '1.0', '2.0'];
const ymaxChoicesTemp = ['30', '35', '40', '45'];
const xAxisNameOD = 'OPTICAL DENSITY'
const xAxisNameTemp = 'TEMPERATURE (C)'

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ymax: '0.5',
      ymaxChoices: ymaxChoicesOD,
      ymaxTitle: 'YAXIS - MAX VALUE',
      timePlotted: '5h',
      timePlottedChoices: ['1h', '5h', '12h', '24h'],
      timePlottedTitle: 'XAXIS - RECENT DATA:',
      downsample: 5,
      parameterChoices: ['OD', 'Temp'],
      parameter: 'OD',
      parameterTitle: 'PARAMETER:',
      xaxisName: xAxisNameOD,
      activePlot: 'ALL',
      logToggleText: 'VIEW LOGS',
      logToggleOptions: ['VIEW GRAPH', 'VIEW LOGS'],
      logToggleState: true,
      logData: ''
    };
  }

  componentDidMount() {
    var options = {fromBeginning: false, follow: true, nLines: 200}
    var logFilename = path.join(this.props.exptDir, 'data', 'evolver.log');

    if (fs.existsSync(logFilename)) {
      var tail = new Tail(logFilename, options);
      const file = readline.createInterface({
        input: fs.createReadStream(logFilename)
        });
      var reverseFile = '';
      file.on('line', function(line){
        reverseFile = line + '\n' + reverseFile;
        }.bind(this));
      file.on('close', function(line){
        this.setState({logData: reverseFile});
        }.bind(this));

      tail.on("line", function(data) {
        var logData = this.state.logData;
        logData = data + '\n' + logData;
        this.setState({logData: logData});
      }.bind(this));
      tail.on("error", function(error) {
        console.log('ERROR: ', error);
      });
    } else {
      this.setState({logData: 'No log file found'})
    };
  }

  handleYmax = event => {
    console.log(event)
    this.setState({
      ymax: event
    })
  };

  handleTimePlotted = event => {
    var downsample;
    if (event == '1h'){
      downsample = 1;
    }
    if (event == '5h'){
      downsample = 5;
    }
    if (event == '12h'){
      downsample = 15;
    }
    if (event == '24h'){
      downsample = 20;
    }

    this.setState({
      timePlotted: event,
      downsample: downsample
    })
  };

  handleParameterSelect = event => {
    var ymaxChoices, ymax, xaxisName
    if (event == 'OD'){
      ymax = '0.5'
      ymaxChoices = ymaxChoicesOD;
      xaxisName = xAxisNameOD;
    }
    if (event == 'Temp'){
      ymax = '40'
      ymaxChoices = ymaxChoicesTemp;
      xaxisName = xAxisNameTemp;
    }
    this.setState({
      parameter: event,
      ymax: ymax,
      ymaxChoices: ymaxChoices,
      xaxisName: xaxisName,
    })
  }

  downloadData = () => {
    var pathToDownload;
    var isWin = os.platform() === 'win32';
    if (!isWin) {
      pathToDownload  = dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory']});
    }
    else {
      pathToDownload = dialog.showOpenDialog({properties: ['openDirectory', 'promptToCreate']});
    }

    var zipFilename = path.join(pathToDownload[0], path.basename(this.props.exptDir) + '.zip');
    zipdir(this.props.exptDir, {saveTo: zipFilename});
  }

  toggleLog = () => {
    var logToggleState = !this.state.logToggleState;
    var logToggleText = logToggleState ? this.state.logToggleOptions[1] : this.state.logToggleOptions[0];
    this.setState({logToggleState: logToggleState, logToggleText: logToggleText});
  }

  handleActivePlot = (event) => {
    this.setState({activePlot: event})
  }

  render() {
    const { classes } = this.props;
      var exptName = path.basename(this.props.exptDir);
      var dataDisplay = this.state.logToggleState ?
        <VialArrayGraph
            parameter={this.state.parameter}
            exptDir={this.props.exptDir}
            activePlot = {this.state.activePlot}
            ymax={this.state.ymax}
            timePlotted={this.state.timePlotted}
            downsample = {this.state.downsample}
            xaxisName = {this.state.xaxisName}/> :
        <div className="logViewer"><AceEditor
            value={this.state.logData}
            width='750px'
            height='570px'
            mode="elixer"
            theme="terminal"
            readOnly={true}
            name="logViewer"
            showGutter={false}
            setOptions={{autoScrollEditorIntoView:true}}
            editorProps={{$blockScrolling: true}}/></div>

    return (
      <div>
        <Link className="backHomeBtn" style={{zIndex: '10', position: 'absolute', top: '5px', left: '-20px'}} id="experiments" to={{pathname:routes.EXPTMANAGER, socket: this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>
                <h4 className="graphTitle">{exptName}</h4>
                {dataDisplay}
        <div style={{position: 'absolute', top: '100px', left: '-10px'}}>
          <VialArrayBtns
            labels={this.state.parameterChoices}
            radioTitle = {this.state.parameterTitle}
            value={this.state.parameter}
            onSelectRadio={this.handleParameterSelect}/>
        </div>
        <div style={{position: 'absolute', top: '185px', left: '-10px'}}>
          <VialArrayBtns
            labels={this.state.timePlottedChoices}
            radioTitle = {this.state.timePlottedTitle}
            value={this.state.timePlotted}
            onSelectRadio={this.handleTimePlotted}/>
          <VialArrayBtns
            labels={this.state.ymaxChoices}
            radioTitle = {this.state.ymaxTitle}
            value={this.state.ymax}
            onSelectRadio={this.handleYmax}/>
        </div>
        <VialMenu onSelectGraph={this.handleActivePlot}/>
        <div className="dataActionButtons">
          <button className={"dataActionButton"} onClick={this.downloadData}>DOWNLOAD</button>
          <button className={"dataActionButton"} onClick={this.toggleLog}>{this.state.logToggleText}</button>
        </div>
      </div>

    );
  }
}

export default withStyles(styles)(Graph);
