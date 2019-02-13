// @flow
import React, { Component } from 'react';
import Setup from '../components/Setup';

type Props = {};

export default class SetupPage extends Component<Props> {
  props: Props;

  render() {
    return <Setup socket={this.props.location.socket} logger={this.props.location.logger}/>;
  }
}
