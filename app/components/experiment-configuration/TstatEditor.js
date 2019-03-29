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
    top: '0px',
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

var fs = require('fs');
var path = require('path');

class TstatEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vialData: data,
            rawData: [],
            selectedItems: []
        };

        this.readParameters(this.props.tstatParameters);
    }
    
    componentDidMount() {
        this.readParameters(this.props.tstatParameters);
    }
    readParameters = (tstatParameters) => {
        var parameters = fs.readFileSync(tstatParameters, 'utf8');
        parameters = JSON.parse(parameters);
        var newRawData = parameters;
        parameters = this.formatVialSelectStrings(parameters, 'upper');
        parameters = this.formatVialSelectStrings(parameters, 'lower');
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
          newData[i].upper = '\u2191OD: ' + newData[i].upper;
        }
        if (parameter === 'lower') {
            newData[i].lower = '\u2193OD: ' + newData[i].lower;
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
          value = '\u2191OD: ' + value;
        }
        if (component === 'lower') {
            value = '\u2193OD: ' + value;
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
        console.log('trying to save...')    
        this.props.onSave(this.state.rawData);
    }
    
    render() {
        const {classes} = this.props;
        return (
        <div>
            <div className="col-8.5 centered">
                <div className="row centered">
                <Card classes={{root:classes.cardRoot}} className={classes.tstatButtons}>
                    <TstatButtonCards                  
                      onSubmitButton={this.onSubmitButton}
                      classes={classes.tstatButtons}
                       />
                </Card>
                <Card className={classes.cardVials}>
                    <TstatVialSelector
                        items={this.state.vialData}
                        vialSelectionFinish={this.onSelectVials}
                        onSave={this.handleSave}
                        className={classes.temp}/>
                </Card> 
                </div>
            </div>
        </div>
        );
                }
    
}

export default withStyles(styles)(TstatEditor);