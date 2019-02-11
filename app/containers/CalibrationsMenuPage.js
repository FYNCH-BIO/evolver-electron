// @flow
import React, { Component } from 'react';
import CalibrationsMenu from '../components/CalibrationsMenu';

type Props = {};

export default class CalibrationsMenuPage extends Component<Props> {
  props: Props;

  render() {
    return <CalibrationsMenu socket={this.props.location.socket} logger={this.props.location.logger}/>;
  }
}
