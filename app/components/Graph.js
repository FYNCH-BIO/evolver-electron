// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft} from 'react-icons/fa';
import VialArrayGraph from './graphing/VialArrayGraph';
import VialArrayBtns from './graphing/VialArrayBtns';



const styles = {

};


class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ymax: '1.0',
      ymaxChoices: ['0.2', '0.5', '1.0', '2.0'],
      defaultYmax: '0.5',
      ymaxTitle: 'YAxis Max',
      timePlotted: '',
      timePlottedChoices: ['1h', '5h', '12h', '24h'],
      timePlottedTitle: 'Plot Last:',
      downsample: 1,
      defaultTimePlotted:'5h'
    };
  }

  componentDidMount(){
    this.setState({
      ymax: this.state.defaultYmax,
      timePlotted: this.state.defaultTimePlotted
      })
  }

  handleYmax = event => {
    console.log(event)
    this.setState({
      ymax: event
    })
  };

  handleTimePlotted = event => {
    console.log(event)
    // timePlottedChoices: ['1h', '5h', '12h', '24h'],
    var downsample;
    if (event == '1h'){
      downsample = 1;
    }
    if (event == '5h'){
      downsample = 10;
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

  render() {

    return (
      <div>
        <Link className="backHomeBtn" style={{zIndex: '10', position: 'absolute', top: '5px', left: '-20px'}} id="experiments" to={{pathname:routes.HOME, socket: this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>
        <VialArrayGraph
          ymax={this.state.ymax}
          timePlotted={this.state.timePlotted}
          downsample = {this.state.downsample}/>
        <div style={{position: 'absolute', top: '90px', left: '0px'}}>
          <VialArrayBtns
            labels={this.state.ymaxChoices}
            radioTitle = {this.state.ymaxTitle}
            value={this.state.defaultYmax}
            onSelectRadio={this.handleYmax}/>
          <VialArrayBtns
            labels={this.state.timePlottedChoices}
            radioTitle = {this.state.timePlottedTitle}
            value={this.state.defaultTimePlotted}
            onSelectRadio={this.handleTimePlotted}/>
        </div>
      </div>

    );
  }
}

export default withStyles(styles)(Graph);
