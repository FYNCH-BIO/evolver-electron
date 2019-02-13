// @flow
import React, { Component } from 'react';
import Home from '../components/Home';

type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return <Home socket={this.props.location.socket} logger={this.props.location.logger} />;
  }
}
