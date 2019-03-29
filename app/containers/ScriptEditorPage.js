// @flow
import React, { Component } from 'react';
import ScriptEditor from '../components/ScriptEditor';

type Props = {};

export default class ScriptEditorPage extends Component<Props> {
  props: Props;

  render() {
    return <ScriptEditor exptDir={this.props.location.exptDir}/>;
  }
}
