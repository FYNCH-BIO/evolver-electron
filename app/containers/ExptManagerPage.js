// @flow
import React, { Component } from 'react';
import ExptManager from '../components/ExptManager';

type Props = {};

export default class ExptManagerPage extends Component<Props> {
  props: Props;

  render() {
      console.log(this.props);
    return <ExptManager evolverIp = {this.props.location.evolverIp}/>;
  }
}
