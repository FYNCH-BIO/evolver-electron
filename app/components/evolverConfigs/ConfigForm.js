// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';


const cardStyles = theme => ({
  card: {
    width: 800,
    height: 500,
    backgroundColor: 'black',
    border: '2px solid #f58245',
    margin: '0px 0px 0px 0px',
    borderRadius: '20px'
  }
})


class ConfigForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <Card className= {classes.card}/>

      </div>

    );
  }
}

export default withStyles(cardStyles)(ConfigForm);
