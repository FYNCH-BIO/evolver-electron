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
    margin: '0px 6px 0px 6px'
  },
  radio: {
    color: 'white',
    '&$checked': {
      color: 'orange',
    },
    padding: '0px 5px 0px 0px'
  },
  checked: {},
  focused: {},
});


class VialArrayBtns extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      labels: this.props.labels,
      title: this.props.radioTitle
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
    this.props.onSelectRadio(event.target.value);
    this.setState({ value: event.target.value });
  };

  render() {
    const { classes } = this.props;

    return (
      <div style={{margin: '0px 0px 0px 0px'}}>
        <FormControl component="fieldset">
          <FormLabel classes={{ root: classes.label, focused: classes.focused}} component="legend">{this.state.title}</FormLabel>
          <RadioGroup
            aria-label="Gender"
            name="gender1"
            row
            classes={{
              root: classes.root
              }}
            value={this.state.value}
            onChange={this.handleChange}
          >
            {this.state.labels.map((labels, index) => (
                <FormControlLabel
                  key = {index}
                  labelPlacement="end"
                  classes={{ label: classes.radiolabel, root: classes.labelRoot}}
                  value={labels} control={
                    <Radio
                    classes={{
                      root: classes.radio,
                      checked: classes.checked}}
                    />}
                  label={labels} />
            ))}
          </RadioGroup>
        </FormControl>

      </div>

    );
  }
}

export default withStyles(styles)(VialArrayBtns);
