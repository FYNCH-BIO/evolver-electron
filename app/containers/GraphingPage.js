// @flow
import React, { Component } from 'react';
import Graph from '../components/Graph';

type Props = {};

export default class GraphingPage extends Component<Props> {
  props: Props;

  render() {
    return <Graph exptDir={this.props.location.exptDir}/>;
  }
}
