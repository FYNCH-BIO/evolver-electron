// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import io from 'socket.io-client'
import Select from 'react-select';



type Props = {};
const options = [
  { value: 'chocolate', label: 'Chocolate \u25CF' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'chocolate2', label: 'Chocolate' },
  { value: 'strawberry2', label: 'Strawberry' },
  { value: 'vanilla2', label: 'Vanilla' },
  { value: 'chocolate3', label: 'Chocolate' },
  { value: 'strawberry3', label: 'Strawberry' },
  { value: 'vanilla3', label: 'Vanilla' },
  { value: 'chocolate4', label: 'Chocolate' },
  { value: 'strawberry4', label: 'Strawberry' },
  { value: 'vanilla4', label: 'Vanilla' }
];

const styles = {

};


class SocketConnection extends React.Component {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: null,
    }

    if (this.props.socket) {
      this.socket = this.props.socket;
    }
    else {

      // this.socket = io.connect("http://localhost:8081/dpu-evolver", {reconnect:true});
      this.socket = io.connect("http://192.168.1.4:8081/dpu-evolver", {reconnect:true});
      this.socket.on('connect', function(){console.log("Connected evolver");}.bind(this));
      this.socket.on('disconnect', function(){console.log("Disconnected evolver")});
      this.socket.on('reconnect', function(){console.log("Reconnected evolver")});
    }
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption);
  }

  render() {
    const { selectedOption } = this.state;


    return (
      <div
        style={{width:'100px', margin: '100px 0px 0px 0px'}}>
        <Select
          value={selectedOption}
          onChange={this.handleChange}
          options={options}
        />
      </div>
      );
  }
}

export default withStyles(styles)(SocketConnection);
