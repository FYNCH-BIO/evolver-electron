// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import NumPad from 'react-numpad';

export default class ODcalInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event){
    event = event.substring(0, event.length - 1);
    console.log(event);
    this.setState({value: event});
  };

  render() {
    return (
      <div>
        <NumPad.Number
            value={this.state.value}
            onChange={this.handleChange}
            label={'Sample 1'}
            position={'center'}
        />
      </div>

    );
  }
}
