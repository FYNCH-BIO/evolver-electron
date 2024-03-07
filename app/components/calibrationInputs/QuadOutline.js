import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
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
  },
  progressBar: {
    flexGrow: 1,
    margin: '240px 0px 0px 0px',
    height: 8,
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
    let smartQuads;
    if (this.props.type == "temp") {
      className = "tempOutlineWrapper";
      smartQuads = this.state.items.map((items,index) => (
        <div>
          {selectedSmartQuad == items
            ? <button
                className="smartQuadOutlineSelected"
                key={items[index]}
                onClick={() => this.handleButton(items)}>

                <LinearProgress
                  classes= {{
                    root: classes.progressBar,
                    colorPrimary: classes.colorPrimary,
                    bar: classes.bar,
                  }}
                  variant="determinate"
                  value={this.state.readProgress[items]}
                /> </button>

            : <button
                className="smartQuadOutlineDeSelected"
                key={items[index]}
                onClick={() => this.handleButton(items)}>

                <LinearProgress
                  classes= {{
                    root: classes.progressBar,
                    colorPrimary: classes.colorPrimary,
                    bar: classes.bar,
                  }}
                  variant="determinate"
                  value={this.state.readProgress[items]}
                /> </button>}
          <p className="quadOutlineText">Smart Quad {items}</p>
        </div>));
    } else if (this.props.type == "od") {
      className = "odOutlineWrapper";
      smartQuads = this.state.items.map((items,index) => (
        <div>
          {selectedSmartQuad == items
            ? <button
                className="smartQuadOutlineSelected"
                key={items[index]}
                onClick={() => this.handleButton(items)}>
              </button>

            : <button
                className="smartQuadOutlineDeSelected"
                key={items[index]}
                onClick={() => this.handleButton(items)}>
              </button>}
          <p className="quadOutlineText">Smart Quad {items}</p>
        </div>));
    }

    return(
      <ul className={className}>
      {smartQuads}
      </ul>
    );
  }
}


export default withStyles(styles, { withTheme: true })(QuadOutline);
