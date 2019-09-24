// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import data from './sample-data'
import VialSelector from './VialSelector'
import Navbar from './Navbar'
import SetupButtons from './SetupButtons/SetupButtons'
import ButtonCards from './SetupButtons/ButtonCards';
import {FaArrowLeft} from 'react-icons/fa';
import SetupLog from './SetupButtons/SetupLog'
const Store = require('electron-store');
const store = new Store();


export default class Setup extends Component<Props> {
  constructor(props) {
      super(props);
      this.child = React.createRef();
      this.state = {
            selectedItems: [],
            arduinoMessage: "",
            rawVialData: data,
            vialData: data,
            tempCalFiles: [],
            odCalFiles: [],
            activeTempCal: 'Retreiving...',
            activeODCal: 'Retreiving...',
            tempCal: {},
            odCal: {},
            command: {},
            showRawTemp: false,
            showRawOD: false,
            strain: ["FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100"]
        };
      this.control = Array.from(new Array(32).keys()).map(item => Math.pow(2,item));
      this.props.socket.emit('getactivecal', {});
      this.props.socket.emit('getfitnames', {});
      this.props.socket.on('broadcast', function(response) {this.handleRawData(this.handlePiIncoming(response.data), this.state.showRawOD, this.state.showRawTemp)}.bind(this));
      this.props.socket.on('fitnames', function(response) {
        var odCalFiles = [];
        var tempCalFiles = [];
        for (var i = 0; i < response.length; i++) {
            if (response[i].calibrationType == "od") {
              odCalFiles.push(response[i].name);
            }
            else if (response[i].calibrationType == "temperature") {
              tempCalFiles.push(response[i].name);
            }
        }
        this.setState({odCalFiles: odCalFiles, tempCalFiles: tempCalFiles})

      }.bind(this))
      this.props.socket.on('activecalibrations', function(response) {
        var activeODCal;
        var activeTempCal;
        for (var i = 0; i < response.length; i++) {
          for (var j = 0; j < response[i].fits.length; j++) {
            if (response[i].fits[j].active) {
              if (response[i].calibrationType == 'od') {
                activeODCal = response[i].fits[j]
              }
              else if (response[i].calibrationType == 'temperature') {
                activeTempCal = response[i].fits[j]
              }
            }
          }
        }
        this.setState({odCal: activeODCal, tempCal: activeTempCal, activeODCal: activeODCal.name, activeTempCal: activeTempCal.name});
        store.set('activeODCal', activeODCal.name);
        store.set('activeTempCal', activeTempCal.name);
        }.bind(this))
    }

  componentDidMount() {
    console.log(this.props.socket)
    this.props.logger.info('Routed to Setup Page.')
    var initialData = this.state.rawVialData;
    initialData = this.handleRawToCal(initialData);
    initialData = this.formatVialSelectStrings(initialData, 'od');
    initialData = this.formatVialSelectStrings(initialData, 'temp');
    this.setState({
      vialData: initialData,
      activeODCal:store.get('activeODCal'),
      activeTempCal:store.get('activeTempCal'),
      });
  };

  componentWillUnmount() {
    this.props.socket.removeAllListeners('activecalibrationod');
    this.props.socket.removeAllListeners('activecalibrationtemp');
    this.props.socket.removeAllListeners('calibrationod');
    this.props.socket.removeAllListeners('calibrationtemp');
    this.props.socket.removeAllListeners('odfittedfilenames');
    this.props.socket.removeAllListeners('tempfittedfilenames');
    this.props.socket.removeAllListeners('broadcast');
  }

  handlePiIncoming = (response) => {
    var responseData = JSON.parse(JSON.stringify(response));
    var rawData = Array.apply(null, Array(16)).map(function () {});
    for(var i = 0; i < this.state.vialData.length; i++) {
      rawData[i] = {};
      rawData[i].vial = this.state.vialData[i].vial;
      rawData[i].selected = this.state.vialData[i].selected;

      rawData[i].od_135 = responseData.od_135[i];
      rawData[i].od_90 = responseData.od_90[i];
      rawData[i].temp = responseData.temp[i];
    }
    return rawData
  }

  handleRawData = (rawData, showRawOD, showRawTemp) => {
    console.log(rawData)
    var newVialData = this.handleRawToCal(rawData, showRawOD, showRawTemp);
    if (!showRawOD && (this.state.odCal.length !== 0)){
      newVialData = this.formatVialSelectStrings(newVialData, 'od');
    }
    if (!showRawTemp && (this.state.tempCal.length !== 0)){
      newVialData = this.formatVialSelectStrings(newVialData, 'temp');
    }
    this.setState({vialData: newVialData, rawVialData: rawData});
  }

  formatVialSelectStrings = (vialData, parameter) => {
    var newData = JSON.parse(JSON.stringify(vialData));
    for(var i = 0; i < newData.length; i++) {
      if (parameter == 'od'){
        newData[i].od = 'OD: ' + newData[i].od;
      }
      if (parameter == 'temp'){
        newData[i].temp = newData[i].temp +'\u00b0C';
      }
    }
    return newData
  }

  handleRawToCal = (response, showRawOD, showRawTemp) => {
    var newVialData = JSON.parse(JSON.stringify(response));
    for(var i = 0; i < newVialData.length; i++) {
        try {
          if ((!showRawOD) && (this.state.odCal.length !== 0)) {
            if (this.state.odCal.type == 'sigmoid') {
              newVialData[i].od = this.sigmoidRawToCal(parseInt(newVialData[i][this.state.odCal.params[0]]), this.state.odCal.coefficients[i]).toFixed(3);
            }
            else if (this.state.odCal.type == '3d') {
              newVialData[i].od = this.multidimRawToCal(parseInt(newVialData[i][this.state.odCal.params[0]]), parseInt(newVialData[i][this.state.odCal.params[1]]), this.state.odCal.coefficients[i]).toFixed(3);
            }
          } else if (this.state.odCal.length == 0) {
            newVialData[i].od = '--'
          } else {
            newVialData[i].od = newVialData[i][this.state.odCal.params[0]]
          }
        }
        catch (err) {
            console.log(err);
        }
        try {
          if ((!showRawTemp) && (this.state.tempCal.length !== 0)){
            newVialData[i].temp = this.linearRawToCal(newVialData[i].temp, this.state.tempCal.coefficients[i]).toFixed(2);
          } else if (this.state.tempCal.length == 0) {
            newVialData[i].temp = '--'
          } else {
            newVialData[i].temp = newVialData[i].temp;
          }
        }
        catch (err) {
            console.log(err);
        }
    }
    return newVialData
  };

  getBinaryString = vials => {
      var binaryInteger = 0;
      for (var i = 0; i< vials.length; i++) {
          binaryInteger += this.control[vials[i]];
      }
      return binaryInteger.toString(2);
  };

  onSelectVials = (selectedVials) =>    {
    this.setState({selectedItems: selectedVials});
  };

  onSelectNewCal = (parameter, filenames) => {
    if (parameter == 'od'){
      this.props.socket.emit("setactivecal", {'calibration_names': filenames});
      this.setState({showRawOD: false});
      this.handleRawData(this.state.rawVialData, false, this.state.showRawTemp)
    }
    if (parameter == 'temp'){
      this.props.socket.emit("setactivecal", {'calibration_names': filenames});
      this.setState({showRawTemp: false});
      this.handleRawData(this.state.rawVialData, this.state.showRawOD, false)
    }
    if (parameter == 'rawod'){
      this.setState({showRawOD: !this.state.showRawOD});
      this.handleRawData(this.state.rawVialData, !this.state.showRawOD, this.state.showRawTemp)
    }
    if (parameter == 'rawtemp'){
      this.setState({showRawTemp: !this.state.showRawTemp});
      this.handleRawData(this.state.rawVialData, this.state.showRawOD, !this.state.showRawTemp)
    }
  }

  onSubmitButton = (evolverComponent, value) => {
    var vials = this.state.selectedItems.map(item => item.props.vial);
    var evolverMessage = {};
    evolverMessage = Array(16).fill("NaN")
    if (evolverComponent == "pump") {
      evolverMessage = Array(48).fill("--");
      for (var i = 0; i < 48; i++) {
        if (value.in1) {
          evolverMessage[vials[i]] = value.time;
        }
        if (value.efflux) {
          evolverMessage[vials[i] + 16] = value.time;
        }
        if (value.in2) {
          evolverMessage[vials[i] + 32] = value.time;
        }
      }
    }
    else {
      for (var i = 0; i < vials.length; i++) {
          if (evolverComponent == "temp") {
            evolverMessage[vials[i]] = this.linearCalToRaw(value, this.state.tempCal.coefficients[i]).toFixed(0);
          }
          else {
            evolverMessage[vials[i]] = value;
          }
      }
    }

    this.setState({arduinoMessage:"Set \"" + evolverComponent + "\" to " + value + " Vials: " + vials});
    console.log({param: evolverComponent, value: evolverMessage, immediate: true})
    this.props.socket.emit("command", {param: evolverComponent, value: evolverMessage, immediate: true});
    this.setState({command: {param: evolverComponent, value: evolverMessage}});
  };

  sigmoidRawToCal = (value, cal) => {
    return (cal[2] - ((Math.log10((cal[1] - cal[0]) / (value - cal[0]) - 1)) / cal[3]));
  };

  multidimRawToCal = (value1, value2, cal) => {
    return cal[0] + cal[1] * value1 + cal[2] * value2 + cal[3] * value1 * value1 + cal[4] * value1 * value2 + cal[5] * value2 * value2;
  };

  linearRawToCal = (value, cal) => {
    return (value * cal[0]) + cal[1];
  };

  linearCalToRaw = (value, cal) => {
    return (value - cal[1])/cal[0];
  };

  render() {
    return (
      <div>
        <div className="col-8.5 centered">
            <div className="row centered">
              <div className="buttons-dashboard ">
                <Link className="backCalibrateBtn" id="experiments" to={{pathname:routes.HOME, socket: this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>
                <h3 className="dashboardTitles"> Experiment Setup Dashboard </h3>
                <ButtonCards
                  arduinoMessage={this.state.arduinoMessage}
                  onSubmitButton={this.onSubmitButton}
                  activeTempCal={this.state.activeTempCal}
                  activeODCal={this.state.activeODCal}
                  tempCalFiles= {this.state.tempCalFiles}
                  odCalFiles={this.state.odCalFiles}
                  showRawTemp= {this.state.showRawTemp}
                  showRawOD= {this.state.showRawOD}
                  onSelectNewCal = {this.onSelectNewCal}
                   />
              </div>
              <SetupLog
                socket={this.props.socket}
                ref={this.child}
                command={this.state.command}
                activeTempCal={this.state.activeTempCal}
                activeODCal={this.state.activeODCal}/>
              <div>
                <VialSelector
                  items={this.state.vialData}
                  vialSelectionFinish={this.onSelectVials}/>
              </div>
            </div>
        </div>
      </div>
    )
  }
}
