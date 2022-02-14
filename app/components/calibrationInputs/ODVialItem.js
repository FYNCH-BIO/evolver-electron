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

export default class VialItem extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.currentValue,
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
        <PoseGroup>
          {this.state.items.map((items,index) => (
            <Item
              className="vialItem"
              key={items[0]}
              style= {{opacity: items[2]}}>
              <div
                className="vialDensity"
                style={{opacity: items[1]}}>
              </div>
              <p className="vialLabels"> {items[4]} </p>
              <p className="vialInput"> {items[3]} </p>
            </Item>
          ))}
        </PoseGroup>
      </ul>
    );
  }
}
