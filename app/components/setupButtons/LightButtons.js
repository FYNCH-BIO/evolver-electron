import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LightSlider from './LightSlider'

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
    return (
      <div>
        <FormGroup row className="lightButtons">
          <FormControlLabel
            control={
              <Switch
                checked={this.state.lightAToggle}
                onChange={this.handleChange('lightAToggle')}
                value="lightAToggle"
                color="primary"
              />
            }
            label ="Blue"
          />

          <FormControlLabel
            control={
              <Switch
                checked={this.state.lightBToggle}
                onChange={this.handleChange('lightBToggle')}
                value="lightBToggle"
              />
            }
            label ="Red"
          />
        </FormGroup>
        <LightSlider handleSubmit={this.handleSubmit}/>
      </div>
    );
  }
}

export default LightButtons;
