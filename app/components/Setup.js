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


type Props = {
};

export default class Setup extends Component<Props> {
  constructor(props) {
      super(props);
      props: Props;
      this.state = {
            selectedItems: [],
            arduinoMessage: "",
            rawVialData: data,
            vialData: data,
            tempCalFiles: [],
            odCalFiles: [],
            activeTempCal: '',
            activeODCal: '',
            tempCal: [],
            odCal: [],
            showRawTemp: false,
            showRawOD: false,
            strain: ["FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100", "FL100"]
        };
      this.control = Array.from(new Array(32).keys()).map(item => Math.pow(2,item));
      this.props.location.socket.emit('getcalibrationod', {});
      this.props.location.socket.emit('getcalibrationtemp', {});
      this.props.location.socket.emit('getfittedcalibrationfilenamesod', {});
      this.props.location.socket.emit('getfittedcalibrationfilenamestemp', {});
      this.props.location.socket.on('databroadcast', function(response) {
        this.handleRawData(response)}.bind(this));
      this.props.location.socket.on('odfittedfilenames', function(response) {this.setState({odCalFiles: response})}.bind(this))
      this.props.location.socket.on('tempfittedfilenames', function(response) {this.setState({tempCalFiles: response})}.bind(this))
      this.props.location.socket.on('activecalibrationod', function(response) {this.setState({activeODCal: response})}.bind(this))
      this.props.location.socket.on('activecalibrationtemp', function(response) {this.setState({activeTempCal: response})}.bind(this))

      this.props.location.socket.on('calibrationod', function(response) {
        console.log(response)
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

      this.props.location.socket.on('calibrationtemp', function(response) {
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
    var initialData = this.state.rawVialData;
    initialData = this.handleRawToCal(initialData);
    initialData = this.formatVialSelectStrings(initialData, 'od');
    initialData = this.formatVialSelectStrings(initialData, 'temp');
    this.setState({vialData: initialData});
  };

  componentWillUnmount() {
    this.props.location.socket.removeAllListeners('activecalibrationod');
    this.props.location.socket.removeAllListeners('activecalibrationtemp');
    this.props.location.socket.removeAllListeners('calibrationod');
    this.props.location.socket.removeAllListeners('calibrationtemp');
    this.props.location.socket.removeAllListeners('odfittedfilenames');
    this.props.location.socket.removeAllListeners('tempfittedfilenames');
    this.props.location.socket.removeAllListeners('databroadcast');
  }

  handleRawData = (rawData, showRawOD, showRawTemp) => {
    var newVialData = this.handleRawToCal(rawData, showRawOD, showRawTemp);
    if (!showRawOD){
      newVialData = this.formatVialSelectStrings(newVialData, 'od');
    }
    if (!showRawTemp){
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
    console.log(parameter)
    console.log(filename)
    if (parameter == 'od'){
      this.props.location.socket.emit("setActiveODCal", {filename: filename});
      this.setState({showRawOD: false});
      this.handleRawData(this.state.rawVialData, false, this.state.showRawTemp)
    }
    if (parameter == 'temp'){
      this.props.location.socket.emit("setActiveTempCal", {filename: filename});
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
      this.props.location.socket.emit("command", {param: evolverComponent, message: evolverMessage});
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
                <Link className="backCalibrateBtn" id="experiments" to={{pathname:routes.HOME, socket: this.props.location.socket}}><FaArrowLeft/></Link>
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
