import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import Card from '@material-ui/core/Card';


import TempSlider from './TempSlider'
import StirSlider from './StirSlider'
import FluidicsButtons from './FluidicsButtons'
import LightButtons from './LightButtons'

const tutorialSteps = [
  {
    label: 'STIR RATE',
  },
  {
    label: 'TEMPERATURE',
  },
  {
    label: 'FLUIDICS',
  },
  {
    label: 'LIGHT',
  },
];

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 650,
    maxWidth: 480,
    minWidth: 480,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    paddingLeft: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.default,
  },
  img: {
    height: 492,
    display: 'block',
    maxWidth: 480,
    overflow: 'hidden',
    width: '100%',
  },
  card: {
    width: 480,
    height: 200,
  },
});

class SwipeableTextMobileStepper extends React.Component {
  state = {
    activeStep: 0,
  };

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1,
    }));
  };

  handleStepChange = activeStep => {
    this.setState({ activeStep });
  };

  render() {
    const { classes, theme } = this.props;
    const { activeStep } = this.state;
    const maxSteps = tutorialSteps.length;

    return (
      <div className={classes.root}>

        <Paper square elevation={0} className={classes.header}>
          <Typography variant="body2">
            {tutorialSteps[activeStep].label}
          </Typography>
        </Paper>

        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={activeStep}
          onChangeIndex={this.handleStepChange}
        >
            {tutorialSteps.map((step, index) => (
              <Card key={step.label} className={classes.card}>
                  {Math.abs(activeStep - index) <= 2 ? (
                    <StirSlider onSubmitButton={this.props.onSubmitButton}/>
                  ) : null}
              </Card>
          ))}
        </SwipeableViews>

        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          className={classes.mobileStepper}
          nextButton={
            <Button size="large" onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
              Next
              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </Button>
          }
          backButton={
            <Button size="large" onClick={this.handleBack} disabled={activeStep === 0}>
              {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              Back
            </Button>
          }
        />
      </div>
    );
  }
}

SwipeableTextMobileStepper.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(SwipeableTextMobileStepper);
