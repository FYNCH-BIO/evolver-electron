// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

const remote = require('electron').remote;
const app = remote.app;

const styles = {};

var fs = require('fs');
var path = require('path');

class TstatEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            temperature: [],
            stir: [],
            upperThreshold: [],
            lowerThreshold: []
        };

        this.readParameters(this.props.tstatParameters);
    }
    readParameters = (tstatParameters) => {
        var parameters = fs.readFileSync(tstatParameters, 'utf8');
        console.log(parameters);
        parameters = JSON.parse(parameters);
        console.log(parameters);
        this.setState({temperature: parameters.temperatures, stir: parameters.stir, upperThreshold: parameters.upperThreshold, lowerThreshold: parameters.lowerThreshold});
    };
    
    render() {return <div><span>a tstat component</span></div>}
    
}

export default withStyles(styles)(TstatEditor);