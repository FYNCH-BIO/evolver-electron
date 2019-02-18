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
            tempCal: [],
            odCal: [],
            command: {},
            showRawTemp: false,
            showRawOD: false,
            strain: ["FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100"]
        };
      this.control = Array.from(new Array(32).keys()).map(item => Math.pow(2,item));
      this.props.socket.emit('getcalibrationod', {});
      this.props.socket.emit('getcalibrationtemp', {});
      this.props.socket.emit('getfittedcalibrationfilenamesod', {});
      this.props.socket.emit('getfittedcalibrationfilenamestemp', {});
      this.props.socket.on('dataresponse', function(response) {this.handleRawData(this.handlePiIncoming(response), this.state.showRawOD, this.state.showRawTemp)}.bind(this));
      this.props.socket.on('databroadcast', function(response) {this.handleRawData(this.handlePiIncoming(response), this.state.showRawOD, this.state.showRawTemp)}.bind(this));
      this.props.socket.on('odfittedfilenames', function(response) {this.setState({odCalFiles: response})}.bind(this))
      this.props.socket.on('tempfittedfilenames', function(response) {this.setState({tempCalFiles: response})}.bind(this))
      this.props.socket.on('activecalibrationod', function(response) {
        this.setState({activeODCal: response})
        store.set('activeODCal', response)
        }.bind(this))
      this.props.socket.on('activecalibrationtemp', function(response) {
        this.setState({activeTempCal: response})
        store.set('activeTempCal', response)
        }.bind(this))


      this.props.socket.on('calibrationod', function(response) {
        var cal_response = response.trim().split("\n");
        var newOdCal = [];
        for (var i = 0; i < cal_response.length; i++) {
            cal_response[i] = cal_response[i].split(",");
            for (var j = 0; j < cal_response[i].length; j++) {
                if (!newOdCal[j]) {
                    newOdCal.push([]);
                }
                newOdCal[j].push(parseFloat(cal_response[i][j]));
            }
        }
        this.setState({odCal: newOdCal});
      }.bind(this));

      this.props.socket.on('calibrationtemp', function(response) {
          var temp_response= response.trim().split("\n");
          var newTempCal = [];
          for (var i = 0; i < temp_response.length; i++) {
              temp_response[i] = temp_response[i].split(",");
              for (var j = 0; j < temp_response[i].length; j++) {
                  if (!newTempCal[j]) {
                      newTempCal.push([]);
                  }
                  newTempCal[j].push(parseFloat(temp_response[i][j]));
              }
          }
          this.setState({tempCal: newTempCal});
      }.bind(this));
    }

  componentDidMount() {
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
    this.props.socket.removeAllListeners('databroadcast');
    this.props.socket.removeAllListeners('dataresponse');
    this.props.socket.removeAllListeners('commandbroadcast');
  }

  handlePiIncoming = (response) => {
    var responseData = JSON.parse(JSON.stringify(response));
    var rawData = Array.apply(null, Array(16)).map(function () {});
    for(var i = 0; i < this.state.vialData.length; i++) {
      rawData[i] = {};
      rawData[i].vial = this.state.vialData[i].vial;
      rawData[i].selected = this.state.vialData[i].selected;

      rawData[i].od = responseData.od[i];
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
          if ((!showRawOD) && (this.state.odCal.length !== 0)){
            newVialData[i].od = this.sigmoidRawToCal(newVialData[i].od, this.state.odCal[i]).toFixed(3);
          } else if (this.state.odCal.length == 0) {
            newVialData[i].od = '--'
          } else{
            newVialData[i].od = newVialData[i].od;
          }
        }
        catch (err) {
            console.log(err);
        }
        try {
          if ((!showRawTemp) && (this.state.tempCal.length !== 0)){
            newVialData[i].temp = this.linearRawToCal(newVialData[i].temp, this.state.tempCal[i]).toFixed(2);
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

  onSelectNewCal = (parameter, filename) => {
    if (parameter == 'od'){
      this.props.socket.emit("setActiveODCal", {filename: filename});
      this.setState({showRawOD: false});
      this.handleRawData(this.state.rawVialData, false, this.state.showRawTemp)
    }
    if (parameter == 'temp'){
      this.props.socket.emit("setActiveTempCal", {filename: filename});
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
    if (evolverComponent == "pump") {
        evolverMessage = {};
        var vialsToBinary = [];
        for (var i = 0; i < vials.length; i++) {
            if (value.in1) {
              vialsToBinary.push(vials[i]);
            }
            if (value.efflux) {
              vialsToBinary.push(parseInt(vials[i]) + 16);
            }
        }
        var binaryString = this.getBinaryString(vialsToBinary);
        evolverMessage = {pumps_binary: binaryString, pump_time: value.time, efflux_pump_time: 0, delay_interval: 0, times_to_repeat: 0, run_efflux:0};
        this.setState({arduinoMessage: "Running pump for Vials: " + vials});
        value['vials'] = vials;
    }
    else if (evolverComponent == "light") {
        this.setState({arduinoMessage: "Set \"" + evolverComponent + '\" to ' + value.percent + " Vials: " + this.state.selectedItems.map(function (item) {return item.props.vial;})});
    }
    else {
      evolverMessage = Array(16).fill("NaN")
      for (var i = 0; i < vials.length; i++) {
          if (evolverComponent == "temp") {
            evolverMessage[vials[i]] = this.linearCalToRaw(value, this.state.tempCal[i]).toFixed(0);
          }
          else {
            evolverMessage[vials[i]] = value;
          }
      }
      this.setState({arduinoMessage:"Set \"" + evolverComponent + "\" to " + value + " Vials: " + vials});
    }
    this.props.socket.emit("command", {param: evolverComponent, message: evolverMessage,  value: value});
    this.setState({command: {param: evolverComponent, message: evolverMessage, value: value} });
  };

  sigmoidRawToCal = (value, cal) => {
    return (cal[2] - ((Math.log10((cal[1] - cal[0]) / (value - cal[0]) - 1)) / cal[3]));
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
