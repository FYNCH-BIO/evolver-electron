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

var path = require('path');

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
      activePlot: 'ALL'
    };
  }

  componentDidMount(){
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

  handleActivePlot = (event) => {
    this.setState({activePlot: event})
  }

  render() {
      var exptName = path.basename(this.props.exptDir);
    return (
      <div>
        <Link className="backHomeBtn" style={{zIndex: '10', position: 'absolute', top: '5px', left: '-20px'}} id="experiments" to={{pathname:routes.EXPTMANAGER, socket: this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>
                <h4 className="graphTitle">{exptName}</h4>
        <VialArrayGraph
          parameter={this.state.parameter}
          exptDir={this.props.exptDir}
          activePlot = {this.state.activePlot}
          ymax={this.state.ymax}
          timePlotted={this.state.timePlotted}
          downsample = {this.state.downsample}
          xaxisName = {this.state.xaxisName}/>
        <div style={{position: 'absolute', top: '155px', left: '-10px'}}>
          <VialArrayBtns
            labels={this.state.parameterChoices}
            radioTitle = {this.state.parameterTitle}
            value={this.state.parameter}
            onSelectRadio={this.handleParameterSelect}/>
        </div>
        <div style={{position: 'absolute', top: '240px', left: '-10px'}}>
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
      </div>

    );
  }
}

export default withStyles(styles)(Graph);
