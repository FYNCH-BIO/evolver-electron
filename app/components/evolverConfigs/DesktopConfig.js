// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';



const cardStyles = theme => ({
  card: {
    width: 800,
    height: 500,
    backgroundColor: 'black',
    border: '1px solid white',
    margin: '0px 0px 0px 0px',
    borderRadius: '20px'
  },
  label: {
    position: 'absolute',
    margin: '0px 0px 0px 20px',
    fontSize: 24,
    color: '#f58245',
    fontWeight: 'bold'
  },
})

class DesktopConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit() {
    console.log(this.state.value);
  }


  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <Card className= {classes.card}>
          <form onSubmit={this.handleSubmit}>
            <div className='registerEvolverContainer' style={{margin: '100px 0px 0px 0px'}}>
                <Typography className={classes.label}>EVOLVER IP: </Typography>
                <input className='registerEvolverInput' type="text" value={this.state.value} onChange={this.handleChange} />
            </div>
            <div className='registerEvolverContainer' style={{margin: '98px 0px 0px 635px'}}>
              <input className='registerEvolverSubmit' type="submit" value="Find" />
            </div>
          </form>
        </Card>
      </div>

    );
  }
}

export default withStyles(cardStyles)(DesktopConfig);
