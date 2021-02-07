// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';


const styles = theme => ({
  root: {
    display: 'flex',
    borderRadius: '10px',
    display: 'flex',
    width: '300px',
    padding: '0px 0px 30px 0px',
    justifyContent: 'center',
  },
  label: {
    color: 'white',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    '&$focused': {
      color: 'white'
    }
  },
  radiolabel: {
    color: 'white',
    textAlign: 'center'
  },
  labelRoot: {
    margin: '0px 0px 35px 55px'
  },
  radio: {
    color: 'white',
    '&$checked': {
      color: 'orange',
    },
    padding: '0px 17px 0px 0px'
  },
  checked: {},
  focused: {},
});


class PumpCalRadioButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      labels: this.props.labels,
      title: this.props.radioTitle,
      name: this.props.name
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.labels !== prevProps.labels) {
      this.setState({
        labels: this.props.labels,
        value: this.props.value})
    }
  }

  componentDidMount () {
  }

  handleChange = event => {
    this.setState({ value: event.target.value });
    this.props.onSelectRadio(this.state.name, event.target.value);

  };

  render() {
    const { classes } = this.props;

    var radioControl = <Radio classes={{root: classes.radio,checked: classes.checked}}/>
    var radioClasses = {label: classes.radiolabel, root: classes.labelRoot};

    return (
      <div style={{margin: '0px 0px 0px 0px'}}>
      <FormControl component="fieldset">
        <RadioGroup name={this.props.name} value={this.state.value} row onChange={this.handleChange}>
          <FormControlLabel value="fast" classes={radioClasses} control={radioControl} />
          <FormControlLabel value="slow" classes={radioClasses} control={radioControl}/>
          <FormControlLabel value="NA" classes={radioClasses} control={radioControl} />
        </RadioGroup>
      </FormControl>
      </div>

    );
  }
}

export default withStyles(styles)(PumpCalRadioButtons);
