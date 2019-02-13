import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LightSlider from './LightSlider'
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

const styles = {
  root: {
    marginTop: -20,
    height: 17,
    width: 100,
  },
  icon: {
    width: 30,
    height: 30,
  },
  switchBase: {
    width: 55,
  },
  bar: {
    width: 45,
    height: 17,
    backgroundColor: 'white',
    margin: '8px 0px 0px -23px'
  },
  checked: {
    transform: 'translateX(35px)',
    '& + $bar': {
      opacity: 1,
    },
  },
  label: {
    color: 'white',
    fontSize: '18px',
    margin: '10px 0px 0px 0px',
  },
  labelPlacementStart: {
    margin: '0px 0px 0px 0px',
    padding: '0px 0px 0px 0px',
    height: 20,
  },
  colorPrimary: {
    '&$checked': {
      color: '#f58245',
      '& + $bar': {
        backgroundColor: '#f58245',
      },
    },
  },
  colorSecondary: {
    '&$checked': {
      color: 'grey',
      '& + $bar': {
        backgroundColor: 'grey',
      },
    },
  },
  card: {
    width: 450,
    height: 70,
    backgroundColor: 'black',
    padding: '0px 0px 0px 124px',
  },
};

class LightButtons extends React.Component {
  state = {
    lightAToggle: false,
    lightBToggle: false,
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  handleSubmit = value => {
      var values = {percent: value, lightA: this.state.lightAToggle, lightB: this.state.lightBToggle};
      this.props.onSubmitButton("light", values);
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <LightSlider handleSubmit={this.handleSubmit}/>
        <Card className={classes.card}>
          <FormGroup row className="lightButtons">
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.lightAToggle}
                  onChange={this.handleChange('lightAToggle')}
                  value="lightAToggle"
                  color="primary"
                  classes={{
                    root: classes.root,
                    icon: classes.icon,
                    switchBase: classes.switchBase,
                    bar: classes.bar,
                    checked: classes.checked,
                    colorPrimary: classes.colorPrimary,
                  }}
                />
              }
              labelPlacement="start"
              label ="A"
              classes = {{
                label: classes.label,
                labelPlacementStart: classes.labelPlacementStart,
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={this.state.lightBToggle}
                  onChange={this.handleChange('lightBToggle')}
                  value="lightBToggle"
                  color="primary"
                  classes={{
                    root: classes.root,
                    icon: classes.icon,
                    switchBase: classes.switchBase,
                    bar: classes.bar,
                    checked: classes.checked,
                    colorPrimary: classes.colorPrimary,
                  }}
                />
              }
              labelPlacement="start"
              label ="B"
              classes = {{
                label: classes.label,
                labelPlacementStart: classes.labelPlacementStart,
              }}
            />
          </FormGroup>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(LightButtons);
