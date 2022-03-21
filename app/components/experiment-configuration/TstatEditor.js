// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import TstatVialSelector from './TstatVialSelector';
import data from '../sample-data-tstat'
import TstatButtonCards from './TstatButtonCards';
import TempSlider from '../setupButtons/TempSlider';
import StirSlider from '../setupButtons/StirSlider';
import UpperODSlider from '../setupButtons/UpperODSlider';
import LowerODSlider from '../setupButtons/LowerODSlider';

const remote = require('electron').remote;
const app = remote.app;

const styles = {
  cardRoot: {
    backgroundColor: 'black',
    alignItems: 'center',
    border: '2px solid white',
    padding: '15px 0px 0px 0px',
    margin: '0px 0px 0px 0px',
  },
  tstatButtons: {
      position: 'absolute',
      top: '20px',
      left: '50px',
      border: 'none'
  },
  cardVials: {
    top: '50px',
    left: '500px',
    border: 'none',
    position: 'absolute',
    backgroundColor: 'black'
  },
  cardSpacer: {
    height: 15,
    backgroundColor: 'black'
  }
};

const defaultTstatParameters = [{"vial":0,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":1,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":2,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":3,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":4,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":5,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":6,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":7,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":8,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":9,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":10,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":11,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":12,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":13,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":14,"temp":30,"stir":8,"upper":0.85,"lower":0.3},{"vial":15,"temp":30,"stir":8,"upper":0.85,"lower":0.3}];
const defaultGrowthRateParameters = [{"vial":0,"temp":30,"stir":8},{"vial":1,"temp":30,"stir":8},{"vial":2,"temp":30,"stir":8},{"vial":3,"temp":30,"stir":8},{"vial":4,"temp":30,"stir":8},{"vial":5,"temp":30,"stir":8},{"vial":6,"temp":30,"stir":8},{"vial":7,"temp":30,"stir":8},{"vial":8,"temp":30,"stir":8},{"vial":9,"temp":30,"stir":8},{"vial":10,"temp":30,"stir":8},{"vial":11,"temp":30,"stir":8},{"vial":12,"temp":30,"stir":8},{"vial":13,"temp":30,"stir":8},{"vial":14,"temp":30,"stir":8},{"vial":15,"temp":30,"stir":8}];

var fs = require('fs');
var path = require('path');

class TstatEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vialData: data,
            rawData: [],
            selectedItems: [],
            vialConfiguration: this.props.vialConfiguration
        };
    }

    componentDidMount() {
        this.checkDefaults();
    }
    
    componentDidUpdate(prevProps) {        
        if (this.props.vialConfiguration !== prevProps.vialConfiguration) {
            this.setState({vialConfiguration: this.props.vialConfiguration}, () => {this.checkDefaults()});
        }
    }

    checkDefaults = () => {
      if (this.props.function == 'turbidostat') {
        if (this.props.vialConfiguration) {
          this.readTStatParameters(this.state.vialConfiguration);  
        }
        else {
          this.readTStatParameters(defaultTstatParameters);
        }
      }
      else if (this.props.function == 'growthcurve') {
          if(this.props.vialConfiguration) {
            this.readGrowthRateParameters(this.state.vialConfiguration);   
          }
          else {
              this.readGrowthRateParameters(defaultGrowthRateParameters);
          }
      }                
    }
    
    readTStatParameters = (tstatParameters) => {
        var parameters = tstatParameters;
        var newRawData = parameters;
        parameters = this.formatVialSelectStrings(parameters, 'upper');
        parameters = this.formatVialSelectStrings(parameters, 'lower');
        parameters = this.formatVialSelectStrings(parameters, 'temp');
        parameters = this.formatVialSelectStrings(parameters, 'stir');
        this.setState({vialData: parameters, rawData: newRawData});
    };

    readGrowthRateParameters = (tstatParameters) => {
        var parameters = tstatParameters;
        var newRawData = parameters;
        parameters = this.formatVialSelectStrings(parameters, 'temp');
        parameters = this.formatVialSelectStrings(parameters, 'stir');
        this.setState({vialData: parameters, rawData: newRawData});
    };

    onSelectVials = (selectedVials) =>    {
        this.setState({selectedItems: selectedVials});
    };

    formatVialSelectStrings = (vialData, parameter) => {
      var newData = JSON.parse(JSON.stringify(vialData));
      for(var i = 0; i < newData.length; i++) {
        if (parameter === 'upper'){
          newData[i].upper = 'OD: ' + newData[i].upper;
        }
        if (parameter === 'lower') {
            newData[i].lower = newData[i].lower;
        }
        if (parameter === 'temp'){
          newData[i].temp = newData[i].temp +'\u00b0C';
        }
        if (parameter === 'stir') {
            newData[i].stir = 'Stir: ' + newData[i].stir;
        }
      }
      return newData;
    };

    formatVialString = (value, component) => {
        if (component === 'upper'){
          value = 'OD: ' + value;
        }
        if (component === 'lower') {
            value = value;
        }
        if (component === 'temp'){
          value = value +'\u00b0C';
        }
        if (component === 'stir') {
            value = 'Stir: ' + value;
        }
        return value;
    }

    onSubmitButton = (evolverComponent, value) => {
      var vials = this.state.selectedItems.map(item => item.props.vial);
      var newVialData = this.state.vialData;
      var newRawData = this.state.rawData;
      for (var i = 0; i < vials.length; i++) {
          newVialData[vials[i]][evolverComponent] = this.formatVialString(value, evolverComponent);
          newRawData[vials[i]][evolverComponent] = Number(value);
      }
      this.setState({vialData: newVialData, rawData: newRawData});
    };

    handleSave = () => {
        console.log('trying to save...');
        var expt_config = {'function': this.state.function, 'ip': this.props.evolverIp, 'vial_configuration': this.state.rawData};
        console.log(expt_config);
        this.props.onSave(expt_config);
    }
    
    resetToDefault = () => {
        console.log('trying to reset...');
        var expt_config = {'function': this.state.function, 'ip': this.props.evolverIp, 'vial_configuration': defaultTstatParameters};
        this.setState({vialConfiguration: defaultTstatParameters}, () => {this.checkDefaults()});
        this.props.onSave(expt_config);       
    }

    render() {
        const {classes} = this.props;
        return (
        <div>
            <div className="col-8.5 centered tstat">
                <div className="row centered">
                <Card classes={{root:classes.cardRoot}} className={classes.tstatButtons}>
                    <TstatButtonCards
                      onSubmitButton={this.onSubmitButton}
                      function={this.props.function}
                      classes={classes.tstatButtons}
                       />
                </Card>
                <Card className={classes.cardVials}>
                    <TstatVialSelector
                        items={this.state.vialData}
                        vialSelectionFinish={this.onSelectVials}
                        onSave={this.handleSave}
                        onResetToDefault={this.resetToDefault}
                        className={classes.temp}
                        function={this.props.function}/>
                </Card>
                </div>
            </div>
        </div>
        );
                }

}

export default withStyles(styles)(TstatEditor);
