// @flow
import React, { Component } from 'react';
import PumpCalibrate from '../components/PumpCalibrate';

type Props = {};

export default class PumpCalibrationsPage extends Component<Props> {
  props: Props;
  
  render() {
    return <PumpCalibrate socket={this.props.location.socket} logger={this.props.location.logger}/>;
  }
}
