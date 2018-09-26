// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import data from './sample-data'
import VialSelector from './VialSelector'


type Props = {
};

export default class Setup extends Component<Props> {
  props: Props;

  state: { selectedItems: [] }

  onSelectVials = (selectedVials) => {
    this.setState({selectedItems: selectedVials});

    console.log(this.state.selectedItems)
  }

  render() {
    return (
      <div>
        <h1> SETUP </h1>
        <Link to={routes.COUNTER}>to Counter</Link>
        <VialSelector items={data} vialSelectionFinish={this.onSelectVials}/>
      </div>
    );
  }
}
