import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class VialOutline extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      items: [12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3]
    };
  }

  handleButton = (id) => {
    console.log(id)
  }

  render() {
    return(
      <ul className="outlineWrapper">
        {this.state.items.map((items,index) => (
          <div>
            <button
              className="vialOutline"
              key={items}
              onClick={() => this.handleButton(items)}>
            </button>
            <p className="vialOutlineText">Vial {items}</p>
          </div>
        ))}
      </ul>
    );
  }
}
