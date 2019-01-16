// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import ODcalInput from './calibrationInputs/ODcalInputs';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import ODcalGUI from './calibrationInputs/ODcalGUI';



const densityButtons = Array.from(Array(16).keys())

const cardStyles = theme => ({
  cardODcalGUI: {
    width: 600,
    height: 800,
    backgroundColor: 'transparent',
    margin: '0px 0px 0px 500px',
    position: 'absolute',
  },
});

class ODcal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
    };
  }


  render() {
    const { classes, theme } = this.props;
    const { currentStep } = this.state;


    return (
      <div>
        <ODcalInput/>
        <Card className={classes.cardODcalGUI}>
          <ODcalGUI/>
        </Card>
      </div>

    );
  }
}

export default withStyles(cardStyles, { withTheme: true })(ODcal);
