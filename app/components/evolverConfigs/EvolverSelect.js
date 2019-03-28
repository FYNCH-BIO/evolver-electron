// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Select from 'react-select';
import Typography from '@material-ui/core/Typography';
const Store = require('electron-store');
const store = new Store();

const isPortReachable = require('is-port-reachable');

const styles = theme => ({
  title: {
    fontSize: 16,
    color: '#f58245',
    fontWeight: 'bold',
  }
})

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
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: null,
      registeredEvolvers: []
    };
  }

  componentDidMount () {
    this.props.onRef(this)
    this._isMounted = true;
    var scanTimer = setInterval(this.scanEvolvers, 1000);
    var selectedOption = this.state.selectedOption;
    var registeredEvolvers = this.state.registeredEvolvers;
    if (store.has('registeredEvolvers')){
      selectedOption = store.get('activeEvolver')
      registeredEvolvers = store.get('registeredEvolvers')
      console.log(registeredEvolvers)
    }
    this.setState({
      scanTimer: scanTimer,
      selectedOption: selectedOption,
      registeredEvolvers: registeredEvolvers},
      console.log(registeredEvolvers));
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.state.scanTimer);
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption });
    console.log(`Option selected:`, selectedOption);

    this.props.selectEvolver(selectedOption)
  }

  scanEvolvers = () => {
    for (var i = 0; i < this.state.registeredEvolvers.length; i++) {
      this.request = isPortReachable(8081, {host: this.state.registeredEvolvers[i].value})
      .then(this.callback_scanEvolvers.bind(null, i).bind(this))};
  }

  callback_scanEvolvers = (index, state) => {
    if (this._isMounted && store.has('activeEvolver')){

      registeredEvolvers = store.get('registeredEvolvers')
      var registeredEvolvers = JSON.parse(JSON.stringify(registeredEvolvers));
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
      store.set('registeredEvolvers', registeredEvolvers)
      this.setState({registeredEvolvers: registeredEvolvers, selectedOption: selectedOption})
    }
  }

  updateRegistry = () => {
    var registeredEvolvers = store.get('registeredEvolvers')
    var activeEvolver;
    if (store.has('activeEvolver')){
      activeEvolver = store.get('activeEvolver')
    } else {
      activeEvolver = null
    }
    this.setState({registeredEvolvers: registeredEvolvers, selectedOption: activeEvolver})
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
            options= {this.state.registeredEvolvers}
            onChange={this.handleChange}
            styles={customStyles}
            placeholder={<div>Select Registered Devices</div>}
          />
          <div style={{position:'absolute',right:'26px',top:'-10px'}}>
            <Typography className={classes.title}> ACTIVE EVOLVER </Typography>
          </div>
      </div>

    );
  }
}

export default withStyles(styles)(EvolverSelect);
