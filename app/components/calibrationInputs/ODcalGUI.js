import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import VialItem from './VialItem';
import VialOutline from './VialOutline';


export default class ODcalGUI extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      odState: [12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3],
    };
  }

  handleAdvance = (event) => {
    let oldState = this.state.odState
    let newState = []
    newState[0] = oldState[7]
    newState[1] = oldState[0]
    newState[2] = oldState[1]
    newState[3] = oldState[2]

    newState[4] = oldState[11]
    newState[5] = oldState[4]
    newState[6] = oldState[5]
    newState[7] = oldState[6]

    newState[8] = oldState[15]
    newState[9] = oldState[8]
    newState[10] = oldState[9]
    newState[11] = oldState[10]

    newState[12] = oldState[3]
    newState[13] = oldState[12]
    newState[14] = oldState[13]
    newState[15] = oldState[14]


    this.setState({odState: newState});

  }

  render() {
    const { odState } = this.state;

    return(
      <div>
        <VialItem
          currentValue = {this.state.odState}
        />
        <VialOutline/>
        <div className="row">
          <button
            className="odAdvanceBtn"
            onClick={this.handleAdvance}>
            testing
          </button>
        </div>
      </div>

    );
  }
}
