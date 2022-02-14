import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
  progressRoot:{
    margin: '-1.52px 0px 0px -1.2px'
  },
  colorPrimary: {
    backgroundColor: 'white',
  },
  bar: {
    backgroundColor: '#f58245',
  },
  circleProgressColor: {
    color: '#f58245',
  },
  circle: {
    strokeWidth: '3px',
  }
});



class VialOutline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readProgress: this.props.readProgress,
      items: [12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3]
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.readProgress !== prevProps.readProgress) {
      this.setState({ readProgress: this.props.readProgress})
    }
  }

  handleButton = (id) => {
    console.log(id)
  }

  render() {
    const { classes, theme } = this.props;
    const { readProgress } = this.state;



    return(
      <ul className="outlineWrapper">
        {this.state.items.map((items,index) => (
          <div>
            <button
              className="vialOutline"
              key={items}
              onClick={() => this.handleButton(items)}>

              <CircularProgress
                classes={{
                  root: classes.progressRoot,
                  colorPrimary: classes.circleProgressColor,
                  circle: classes.circle,
                  }}
                variant="static"
                value={this.state.readProgress[index]}
                color="primary"
                size= {104}
              />

            </button>
            <p className="vialOutlineText">Vial {items}</p>
          </div>
        ))}
      </ul>
    );
  }
}


export default withStyles(styles, { withTheme: true })(VialOutline);
