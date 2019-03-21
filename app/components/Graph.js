// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { withStyles } from '@material-ui/core/styles';
import {FaArrowLeft} from 'react-icons/fa';

import {
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart
} from "react-timeseries-charts";

const styles = {

};


class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div>
        <Link className="backHomeBtn" style={{position: 'absolute', margin: '20px 0px 0px 40px'}} id="experiments" to={{pathname:routes.HOME, socket: this.props.socket, logger:this.props.logger}}><FaArrowLeft/></Link>

        <ChartContainer timeRange={series1.timerange()} width={800}>
            <ChartRow height="200">
                <YAxis id="axis1" label="AUD" min={0.5} max={1.5} width="60" type="linear" format="$,.2f"/>
                <Charts>
                    <LineChart axis="axis1" series={series1} column={["aud"]}/>
                    <LineChart axis="axis2" series={series2} column={["euro"]}/>
                </Charts>
                <YAxis id="axis2" label="Euro" min={0.5} max={1.5} width="80" type="linear" format="$,.2f"/>
            </ChartRow>
        </ChartContainer>

      </div>

    );
  }
}

export default withStyles(styles)(Graph);
