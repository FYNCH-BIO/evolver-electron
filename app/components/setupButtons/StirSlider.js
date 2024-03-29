import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';

const styles = {
  root: {
    alignItems: 'center',
    margin: '40px 20px 0px 50px',
    width: '350px'
  },
  track: {
    height: '5px',
    backgroundColor: 'white',
  },
  thumb: {
    width: '30px',
    height: '30px',
    opacity: 1,
    backgroundColor: '#f58245',
  },
};

class StirSlider extends React.Component {
  state = {
    value: 8,
    min: 0,
    max: 15,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  clickAdd = (event,value) => {
    let newValue = this.state.value + 1
    if(newValue > this.state.max){
      newValue = this.state.max;
    }
    this.setState({ value: newValue});
  }

  clickSubtract = (value) => {
    let newValue = this.state.value - 1
    if(newValue < this.state.min){
      newValue = this.state.min;
    }
    this.setState({ value: newValue});
  }

  clickSubmit = (event) => {
      this.props.onSubmitButton("stir", (Math.round(this.state.value * 100)/100).toFixed(0));
  }

  render() {
    const { value } = this.state;
    const { classes } = this.props;

    return (
      <div className="slider-style">
        <span id="label">
            <button type="button" className="btn btn-outline-secondary btn-circle setupButton" onClick={this.clickSubtract}><i className="fa fa-minus"></i></button>
              <button className = "btn btn-lg btn-outline-secondary setupButton" onClick={this.clickSubmit}>
                <span className="slider-label">
                   Stir: {(Math.round(this.state.value * 100)/100).toFixed(0)}
                </span>
              </button>
            <button type="button" className="btn btn-outline-secondary btn-circle setupButton" onClick={this.clickAdd}><i className="fa fa-plus"></i></button>
          <Slider
            value={value}
            min={this.state.min}
            max={this.state.max}
            step={1}
            aria-labelledby="label"
            onChange={this.handleChange}
            classes={{
              root: classes.root,
              track: classes.track,
              thumb: classes.thumb,
            }}

             />
        </span>
      </div>
    );
  }
}

StirSlider.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StirSlider);
