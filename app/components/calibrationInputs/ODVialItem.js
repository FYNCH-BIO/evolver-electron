import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import posed, { PoseGroup } from 'react-pose';
import shuffle from './shuffle';

const Item = posed.li({
  flip: {
    scale: 1,
    transition: {
      scale: {
        type: 'spring',
        velocity: .5,
        stiffness:1000,
      }
    }
  }
});

export default class ODVialItem extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.currentValue,
      keys: [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],[18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35],[36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53],[54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71]]
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentValue !== prevProps.currentValue) {
      this.setState({ items: this.props.currentValue})
    }
  }

  clickButton = (id) => {
    console.log(id)
  }

  render() {

    return(
      <ul>
        <ul style={{maxWidth:250, marginTop:50}}>
          <PoseGroup>
            {this.state.items[2].map((items,index) => (
              <Item
                className="odVialItem"
                key={this.state.keys[2][index]}
                style= {{opacity: items[2]}}>
                <div
                  className="odVialDensity"
                  style={{opacity: items[1]}}>
                </div>
                <p className="odVialLabels"> {items[4]} </p>
                <p className="odVialInput"> {items[3]} </p>
              </Item>
            ))}
          </PoseGroup>
        </ul>
        <ul style={{maxWidth:250, marginLeft:40, marginTop:50}}>
          <PoseGroup>
            {this.state.items[3].map((items,index) => (
              <Item
                className="odVialItem"
                key={this.state.keys[3][index]}
                style= {{opacity: items[2]}}>
                <div
                  className="odVialDensity"
                  style={{opacity: items[1]}}>
                </div>
                <p className="odVialLabels"> {items[4]} </p>
                <p className="odVialInput"> {items[3]} </p>
              </Item>
            ))}
          </PoseGroup>
        </ul>
        <ul style={{maxWidth:250, marginTop:50}}>
          <PoseGroup>
            {this.state.items[0].map((items,index) => (
              <Item
                className="odVialItem"
                key={this.state.keys[0][index]}
                style= {{opacity: items[2]}}>
                <div
                  className="odVialDensity"
                  style={{opacity: items[1]}}>
                </div>
                <p className="odVialLabels"> {items[4]} </p>
                <p className="odVialInput"> {items[3]} </p>
              </Item>
            ))}
          </PoseGroup>
        </ul>
        <ul style={{maxWidth:250, marginTop:50, marginLeft:40}}>
          <PoseGroup>
            {this.state.items[1].map((items,index) => (
              <Item
                className="odVialItem"
                key={this.state.keys[1][index]}
                style= {{opacity: items[2]}}>
                <div
                  className="odVialDensity"
                  style={{opacity: items[1]}}>
                </div>
                <p className="odVialLabels"> {items[4]} </p>
                <p className="odVialInput"> {items[3]} </p>
              </Item>
            ))}
          </PoseGroup>
        </ul>
      </ul>
    );
  }
}
