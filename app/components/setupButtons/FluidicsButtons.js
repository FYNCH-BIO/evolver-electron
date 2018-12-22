import React from 'react';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FluidicsSlider from './FluidicsSlider'

class FluidicsButtons extends React.Component {
  state = {
    mediaAToggle: false,
    mediaBToggle: false,
    effluxToggle: false,
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };
  
  handleSubmit = value => {
      var values = {time: value, in1: this.state.mediaAToggle, in2: this.state.mediaBToggle, efflux: this.state.effluxToggle};
      this.props.onSubmitButton("pump", values);
  };
      
  render() {
    return (
      <div>
        <FormGroup row className="fluidicButtons">
          <FormControlLabel
            control={
              <Switch
                checked={this.state.mediaAToggle}
                onChange={this.handleChange('mediaAToggle')}
                value="mediaAToggle"
                color="primary"
              />
            }
            label ="IN 1"
          />

          <FormControlLabel
            control={
              <Switch
                checked={this.state.mediaBToggle}
                onChange={this.handleChange('mediaBToggle')}
                value="mediaBToggle"
                color="primary"
              />
            }
            label ="IN 2"
          />

          <FormControlLabel
            control={
              <Switch
                checked={this.state.effluxToggle}
                onChange={this.handleChange('effluxToggle')}
                value="effluxToggle"
              />
            }
            label ="E"
          />
        </FormGroup>
        <FluidicsSlider handleSubmit={this.handleSubmit}/>
      </div>
    );
  }
}

export default FluidicsButtons;
