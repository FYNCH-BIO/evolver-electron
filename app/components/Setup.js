// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import data from './sample-data'
import VialSelector from './VialSelector'
import Navbar from './Navbar'
import SetupButtons from './SetupButtons/SetupButtons'
import io from 'socket.io-client'
import ButtonCards from './SetupButtons/SwipeableViews';

type Props = {
};

export default class Setup extends Component<Props> {
  constructor(props) {
      super(props);
      this.state = {
            selectedItems: [],
            arduinoMessage: "",
            vialData: data
        };
      this.control = Array.from(new Array(32).keys()).map(item => Math.pow(2,item));
      this.socket = io("http://localhost:8081/dpu-evolver");

      // TODO: Define params from actual device
      this.socket.on('connect', function(){console.log("Connected evolver");this.socket.emit('pingdata', {});}.bind(this));
      this.socket.on('disconnect', function(){console.log("Disconnected evolver")});
      this.socket.on('dataresponse', function(response) {
        console.log("Handling it");
        console.log(response);
        var newVialData = Array.apply(null, Array(16)).map(function () {});
        for(var i = 0; i < this.state.vialData.length; i++) {
            newVialData[i] = {};
            newVialData[i].vial = this.state.vialData[i].vial;
            newVialData[i].selected = this.state.vialData[i].selected;
            newVialData[i].od = response.OD[this.state.vialData[i].vial];
            newVialData[i].temp = response.temp[this.state.vialData[i].vial];
        }
        this.setState({vialData: newVialData});}.bind(this));

  }
  props: Props

  getBinaryString = vials => {
      var binaryInteger = 0;
      for (var i = 0; i< vials.length; i++) {
          binaryInteger += this.control[vials[i]];
      }
      return binaryInteger.toString(2);
  }

  onSelectVials = (selectedVials) =>    {
    this.setState({selectedItems: selectedVials});
  }

  onSubmitButton = (evolverComponent, value) => {
      var vials = this.state.selectedItems.map(item => item.props.vial);
      if (evolverComponent == "pump") {
          var evolverMessage = {};
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
          this.setState({arduinoMessage: evolverComponent});
      }
      else if (evolverComponent == "light") {
          this.setState({arduinoMessage: "Set \"" + evolverComponent + '\" to ' + value.percent + " Vials: " + this.state.selectedItems.map(function (item) {return item.props.vial;})});

      }
      else {
        var evolverMessage = Array(16).fill("NaN")
        for (var i = 0; i < vials.length; i++) {
            evolverMessage[vials[i]] = value;
        }
      }
      console.log(evolverComponent);
      console.log(evolverMessage);
      this.socket.emit("command", {param: evolverComponent, message: evolverMessage});
  }

  render() {
    return (
      <div>
        <div className="col-8.5 centered">
            <div className="row centered">
              <div>
                <VialSelector items={this.state.vialData} vialSelectionFinish={this.onSelectVials}/>
              </div>
              <div className="buttons-dashboard ">
                <ButtonCards arduinoMessage={this.state.arduinoMessage} onSubmitButton={this.onSubmitButton}/>
                {/*
                <SetupButtons arduinoMessage={this.state.arduinoMessage} onSubmitButton={this.onSubmitButton}/>
                */}
              </div>
            </div>
        </div>
      </div>
    )
  }
}
