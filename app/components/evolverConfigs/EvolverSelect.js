// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Select from 'react-select';
import Typography from '@material-ui/core/Typography';

const isPortReachable = require('is-port-reachable');

const styles = theme => ({
  title: {
    fontSize: 16,
    color: '#f58245',
    fontWeight: 'bold',
  }
})

const options = [
  { value: '192.168.1.2', label: 'Darwin (192.168.1.2)',  statusColor: '#DC143C'  },
  { value: '192.168.1.27', label: 'Mendel (192.168.1.27)',  statusColor: '#DC143C'   },
  { value: '192.168.1.4', label: 'Bernoulli (192.168.1.4)',  statusColor: '#DC143C'   },
  { value: '192.168.1.201', label: 'Darwin-2 (192.168.1.201)' ,  statusColor: '#DC143C'  },
  { value: '192.168.1.21', label: 'Mendel-2 (192.168.1.21)' ,  statusColor: '#DC143C'  },
  { value: '192.168.1.41', label: 'Bernoulli-2 (192.168.1.41)',  statusColor: '#DC143C'   },
  { value: '192.168.1.202', label: 'Darwin-3 (192.168.1.202)' ,  statusColor: '#DC143C'  },
  { value: '192.168.1.22', label: 'Mendel-3 (192.168.1.22)',  statusColor: '#DC143C'   },
  { value: '192.168.1.42', label: 'Bernoulli-3 (192.168.1.42)' ,  statusColor: '#DC143C'  },
  { value: '192.168.1.203', label: 'Darwin-4 (192.168.1.203)',  statusColor: '#DC143C'   },
  { value: '192.168.1.20', label: 'Mendel-4 (192.168.1.20)',  statusColor: '#DC143C'   },
  { value: '192.168.1.43', label: 'Bernoulli-4 (192.168.1.43)',  statusColor: '#DC143C'   }
];

const customStyles = {
  control: (base, state) => ({
    ...base,
    boxShadow: state.isFocused ? 0 : 0,
    borderColor: state.isFocused
      ? 'black'
      : base.borderColor,
    '&:hover': {
      borderColor: state.isFocused
        ? 'black'
        : base.borderColor,
    }
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = data.statusColor;
    return {
      ...styles,
      backgroundColor: 'black',
      color: 'white',
      '&:active': {
        backgroundColor: 'black',
        color:'#f58245'
      },
      ...dot(data.statusColor)
    };
  },
  singleValue: (styles, { data }) => ({ ...styles, ...dot(data.statusColor) })
}

const dot = (color = "#ccc") => ({
  alignItems: "center",
  display: "flex",

  ":before": {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: "block",
    marginRight: 15,
    marginTop: 1,
    height: 10,
    width: 10
  }
});


class EvolverSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: options[2],
      registeredEvolvers: options
    };
  }

  componentDidMount () {
    var scanTimer = setInterval(this.scanEvolvers, 1000);
    this.setState({scanTimer: scanTimer});
  }

  componentWillUnmount() {
    clearInterval(this.state.scanTimer);
    if (this.request) {
      console.log('aborting callback!')
      this.request = undefined;
    }
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption });
    console.log(`Option selected:`, selectedOption);
  }

  scanEvolvers = () => {
    for (var i = 0; i < this.state.registeredEvolvers.length; i++) {
      this.request = isPortReachable(8081, {host: this.state.registeredEvolvers[i].value})
      .then(this.callback_scanEvolvers.bind(null, i).bind(this))};
  }

  callback_scanEvolvers = (index, state) => {
    var registeredEvolvers = JSON.parse(JSON.stringify(this.state.registeredEvolvers));
    var selectedOption = JSON.parse(JSON.stringify(this.state.selectedOption));
    if (state){
      registeredEvolvers[index]['statusColor'] = '#32CD32';
    } else {
      registeredEvolvers[index]['statusColor'] = '#DC143C';
    }
    if (registeredEvolvers[index]['value'] == this.state.selectedOption['value']){
      if (state){
        selectedOption['statusColor'] = '#32CD32';
      } else {
        selectedOption['statusColor'] = '#DC143C';
      }
    }
    this.setState({registeredEvolvers: registeredEvolvers, selectedOption: selectedOption})
  }

  render() {
    const { selectedOption } = this.state;
    const { classes, theme } = this.props;

    return (
      <div>
          <Select
            isDisabled = {false}
            value={selectedOption}
            className='selectEvolver'
            classNamePrefix='selectEvolver'
            onChange={this.handleChange}
            options={this.state.registeredEvolvers}
            styles={customStyles}
            placeholder={<div>No Registered Devices</div>}
          />
          <div style={{position:'absolute',right:'-74px',top:'-10px'}}>
            <Typography className={classes.title}> ACTIVE EVOLVER </Typography>
          </div>
      </div>

    );
  }
}

export default withStyles(styles)(EvolverSelect);
