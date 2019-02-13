// @flow
import React, { Component } from 'react';
import TempCalibrate from '../components/TempCalibrate';

type Props = {};

export default class TempCalibrationsPage extends Component<Props> {
  props: Props;

  render() {
    return <TempCalibrate socket={this.props.location.socket} logger={this.props.location.logger}/>;
  }
}
