import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import VialItem from './VialItem';
import VialOutline from './VialOutline';

function zipValues(odState, vialOpacities, generalOpacity, odInputs) {
  let vialOpacitiesNew = []
  let generalOpacityNew = []
  let odInputsNew = []

  var i;
  for (i = 0; i < odState.length; i++) {
    odInputsNew[i] = odInputs[odState[i]]
    vialOpacitiesNew[i] = vialOpacities[odState[i]]
    if ( isNaN(odInputsNew[i]) ) {
      generalOpacityNew[i] = 0;
    }
    else{
      generalOpacityNew[i] = generalOpacity[odState[i]]
    }
  }

  let zippedSamples = odState.map((x, i) => [x, vialOpacitiesNew[i], generalOpacityNew[i], odInputsNew[i]]);

  return zippedSamples
}
//generalSampleOpacity = newState.map((x, i) => x[2])

function unzipValues(zippedArray) {
  let odState = zippedArray.map((x, i) => x[0])
  let vialOpacities = zippedArray.map((x, i) => x[1])
  let generalOpacity = zippedArray.map((x, i) => x[2])
  let odInputs = zippedArray.map((x, i) => x[3])

  let vialOpacitiesNew = []
  let generalOpacityNew = []
  let odInputsNew = []

  var i;
  for (i = 0; i < odState.length; i++) {
    vialOpacitiesNew[odState[i]] = vialOpacities[i]
    generalOpacityNew[odState[i]] = generalOpacity[i]
    odInputsNew[odState[i]] = odInputs[i]
  }

  return [ odState, vialOpacitiesNew, generalOpacityNew, odInputsNew]
}


export default class ODcalGUI extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      odState: [12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3],
      vialOpacities: this.props.vialOpacities,
      generalSampleOpacity: this.props.generalOpacity,
      odInputs: this.props.odInputs,
      zipped: [[12,0,0],[13,0,0],[14,0,0],[15,0,0],[8,0,0],[9,0,0],[10,0,0],[11,0,0],[4,0,0],[5,0,0],[6,0,0],[7,0,0],[0,0,0],[1,0,0],[2,0,0],[3,0,0]],
    };
  }

  componentDidUpdate(prevProps) {
    if ((this.props.generalOpacity !== prevProps.generalOpacity) || this.props.vialOpacities !== prevProps.vialOpacities || this.props.odInputs !== prevProps.odInputs) {
      let zippedSamples = zipValues(this.state.odState, this.props.vialOpacities, this.props.generalOpacity, this.props.odInputs)

      this.setState({
        generalSampleOpacity: this.props.generalOpacity,
        vialOpacities: this.props.vialOpacities,
        odInputs: this.props.odInputs,
        zipped: zippedSamples,
      })
    }
  }

  handleBack = (event) => {
    let zippedSamples = zipValues(this.state.odState, this.state.vialOpacities, this.state.generalSampleOpacity, this.state.odInputs)
    let newState = []
    newState[7] = zippedSamples[0]
    newState[0] = zippedSamples[1]
    newState[1] = zippedSamples[2]
    newState[2] = zippedSamples[3]
    newState[11] = zippedSamples[4]
    newState[4] = zippedSamples[5]
    newState[5] = zippedSamples[6]
    newState[6] = zippedSamples[7]
    newState[15] = zippedSamples[8]
    newState[8] = zippedSamples[9]
    newState[9] = zippedSamples[10]
    newState[10] = zippedSamples[11]
    newState[3] = zippedSamples[12]
    newState[12] = zippedSamples[13]
    newState[13] = zippedSamples[14]
    newState[14] = zippedSamples[15]

    let unzipped = unzipValues(newState)
    let odState = unzipped[0]
    let vialOpacities = unzipped[1]
    let generalSampleOpacity = unzipped[2]
    let odInputs = unzipped[3]

    this.setState({
      zipped: newState,
      odState: odState,
      vialOpacities: vialOpacities,
      generalSampleOpacity: generalSampleOpacity,
      odInputs: odInputs,
    });
  }

  handleAdvance = (event) => {
    let zippedSamples = zipValues(this.state.odState, this.state.vialOpacities, this.state.generalSampleOpacity, this.state.odInputs)
    let newState = []
    newState[0] = zippedSamples[7]
    newState[1] = zippedSamples[0]
    newState[2] = zippedSamples[1]
    newState[3] = zippedSamples[2]
    newState[4] = zippedSamples[11]
    newState[5] = zippedSamples[4]
    newState[6] = zippedSamples[5]
    newState[7] = zippedSamples[6]
    newState[8] = zippedSamples[15]
    newState[9] = zippedSamples[8]
    newState[10] = zippedSamples[9]
    newState[11] = zippedSamples[10]
    newState[12] = zippedSamples[3]
    newState[13] = zippedSamples[12]
    newState[14] = zippedSamples[13]
    newState[15] = zippedSamples[14]

    let unzipped = unzipValues(newState)
    let odState = unzipped[0]
    let vialOpacities = unzipped[1]
    let generalSampleOpacity = unzipped[2]
    let odInputs = unzipped[3]

    console.log(newState)

    this.setState({
      zipped: newState,
      odState: odState,
      vialOpacities: vialOpacities,
      generalSampleOpacity: generalSampleOpacity,
      odInputs: odInputs,
    });
  }

  render() {
    const { odState } = this.state;

    return(
      <div>
        <VialItem
          currentValue = {this.state.zipped}
        />
        <VialOutline/>
      </div>

    );
  }
}
