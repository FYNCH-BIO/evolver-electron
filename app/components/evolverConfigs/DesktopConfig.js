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
    border: '1px solid white',
    margin: '0px 0px 0px 0px',
    borderRadius: '20px'
  }
})


class DesktopConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <Card className= {classes.card}>
          <p>desktop</p>
        </Card>
      </div>

    );
  }
}

export default withStyles(cardStyles)(DesktopConfig);
