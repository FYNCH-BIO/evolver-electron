import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import TempSlider from './TempSlider'
import StirSlider from './StirSlider'
import FluidicsButtons from './FluidicsButtons'
import LightButtons from './LightButtons'

const styles = {
  card: {
    width: 280,
    height: 90,
    margin: '10px 0px 0px -20px',
    padding:'20px 5px 0px 5px'
  },
  cardSwitches: {
    width: 280,
    height: 130,
    margin: '0px 0px 0px -20px',
    padding:'0px 5px 0px 5px'
  },
  cardText: {
      width: 570,
      height: 90,
      margin: '10px 0px 0px -20px',
      padding: '20px 5px 0px 5px'
  }
};

class SetupButtons extends React.Component {


  render(){
    const { classes } = this.props;
    return (
      <div>
        <div className="row">
          <div className="col">
            <Card className={classes.cardSwitches}>
                <FluidicsButtons onSubmitButton={this.props.onSubmitButton}/>
            </Card>
          </div>
          <div className="col">
            <Card className={classes.cardSwitches}>
                <LightButtons onSubmitButton={this.props.onSubmitButton}/>
            </Card>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <Card className={classes.card}>
              <div className="span1"><StirSlider onSubmitButton={this.props.onSubmitButton}/></div>
            </Card>
          </div>
          <div className="col">
            <Card className={classes.card}>
                <div className="span1"><TempSlider onSubmitButton={this.props.onSubmitButton}/></div>
            </Card>
          </div>
        </div>
        <div className="row">
            <div className="col">
              <Card className={classes.cardText}>
                <div className="span1">{this.props.arduinoMessage}</div>
              </Card>
            </div>
        </div>
      </div>
    )
  };
}

SetupButtons.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SetupButtons);
