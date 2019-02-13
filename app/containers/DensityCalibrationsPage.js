// @flow
import React, { Component } from 'react';
import DensityCalibrate from '../components/DensityCalibrate';

type Props = {};

export default class DensityCalibrationsPage extends Component<Props> {
  props: Props;

  render() {
    return <DensityCalibrate socket={this.props.location.socket} logger={this.props.location.logger}/>;
  }
}
