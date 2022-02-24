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



class QuadOutline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readProgress: this.props.readProgress,
      items: [2,3,0,1],
      selectedSmartQuad: 0
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.readProgress !== prevProps.readProgress) {
      this.setState({ readProgress: this.props.readProgress})
    }
  }

  handleButton = (id) => {
    this.setState({
      selectedSmartQuad: id
    }, () => {
      this.props.onSmartQuadSelection(id);
    });
  }

  render() {
    const { classes, theme } = this.props;
    const { readProgress } = this.state;
    const selectedSmartQuad = this.state.selectedSmartQuad;
    let className;
    if (this.props.type == "temp") {
      className = "outlineWrapper";
    } else if (this.props.type == "od") {
      className = "odOutlineWrapper";
    }

    return(
      <ul className={className}>
        {this.state.items.map((items,index) => (
          <div>
            {selectedSmartQuad == items
              ? <button
                  className="smartQuadOutlineSelected"
                  key={items[index]}
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
                  /> </button>

              : <button
                  className="smartQuadOutlineDeSelected"
                  key={items[index]}
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
                </button>}
            <p className="quadOutlineText">Smart Quad {items}</p>
          </div>
        ))}
      </ul>
    );
  }
}


export default withStyles(styles, { withTheme: true })(QuadOutline);
