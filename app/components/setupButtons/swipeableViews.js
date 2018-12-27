import React, { Component } from 'react'
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
    label: 'Stir Rate',
    outputTag: 'stir',
  },
  {
    label: 'Temperature',
    outputTag: 'temp',
  },
  {
    label: 'Peristaltic Pump Array',
    outputTag: 'pump',
  },
  {
    label: 'Light Input',
    outputTag: 'light',
  },
];

const styles = theme => ({
  root: {
    flexGrow: 1,
    maxWidth: 450,
    minWidth: 450,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    height: 50,
    paddingLeft: theme.spacing.unit * 4,
    backgroundColor: 'black',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSecondary: {
    color: 'white',
    fontStyle: 'italic',
  },
  card: {
    width: 450,
    height: 170,
    backgroundColor: 'black',
  },
  cardSpacer: {
    width: 450,
    height: 30,
    backgroundColor: 'black',
  },
  mobileStepper: {
    backgroundColor: 'black',
  },
  stepperStyle: {
    color: 'white',
    height: 50,
    width: 70,
  },
  dot: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
  },
  dotActive: {
    backgroundColor: '#f58245',
  },
});

function ActiveButtons(props) {
  const currentTag = props.currentTag;
  if (currentTag == 'stir') {
    return <StirSlider onSubmitButton={props.onSubmitButton}/>;
  }
  if (currentTag == 'temp') {
    return <TempSlider onSubmitButton={props.onSubmitButton}/>;
  }
  if (currentTag == 'pump') {
    return <FluidicsButtons onSubmitButton={props.onSubmitButton}/>;
  }
  if (currentTag == 'light') {
    return <LightButtons onSubmitButton={props.onSubmitButton}/>;
  }
  return null;
}

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
          <Typography variant="h5" className={classes.headerText}> PARAMETER: &nbsp; </Typography>
          <Typography variant="h5" className={classes.headerSecondary}>{tutorialSteps[activeStep].label}</Typography>

        </Paper>
        <Card className={classes.cardSpacer}/>

        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={activeStep}
          onChangeIndex={this.handleStepChange}
          disabled= {true}
        >
            {tutorialSteps.map((step, index) => (
              <Card key={step.label} className={classes.card}>
                  {Math.abs(activeStep - index) <= 2 ? (
                    <ActiveButtons currentButtons={activeStep}
                    currentTag={tutorialSteps[activeStep].outputTag} onSubmitButton={this.props.onSubmitButton}/>
                  ) : null}
              </Card>
          ))}
        </SwipeableViews>

        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          classes={{
              root: classes.root,
              dotActive: classes.dotActive,
              dot: classes.dot,
            }}
          nextButton={
            <Button size="large" className={classes.stepperStyle} onClick={this.handleNext} disabled={activeStep === maxSteps - 1}>
              Next
              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </Button>
          }
          backButton={
            <Button size="large" className={classes.stepperStyle} onClick={this.handleBack} disabled={activeStep === 0}>
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
