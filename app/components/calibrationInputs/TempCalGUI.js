import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import VialItem from './VialItem';
import QuadOutline from './QuadOutline';

function zipValues(odState, quadOpacities, generalOpacity, valueInputs, quadLabels) {
  let quadOpacitiesNew = [];
  let generalOpacityNew = [];
  let valueInputsNew = [];
  let quadLabelsNew = [];

  var i;
  for (i = 0; i < odState.length; i++) {
    valueInputsNew[i] = valueInputs[odState[i]]
    quadOpacitiesNew[i] = quadOpacities[odState[i]]
    quadLabelsNew[i] = quadLabels[odState[i]]

    if ( isNaN(valueInputsNew[i]) && (typeof valueInputsNew[i] !== 'string')) {
      generalOpacityNew[i] = 0;
    }
    else{
      generalOpacityNew[i] = generalOpacity[odState[i]]
    }
  }

  let zippedSamples = odState.map((x, i) => [x, quadOpacitiesNew[i], generalOpacityNew[i], valueInputsNew[i], quadLabelsNew[i]]);

  return zippedSamples
}
//generalOpacity = newState.map((x, i) => x[2])

function unzipValues(zippedArray) {
  let odState = zippedArray.map((x, i) => x[0])
  let quadOpacities = zippedArray.map((x, i) => x[1])
  let generalOpacity = zippedArray.map((x, i) => x[2])
  let valueInputs = zippedArray.map((x, i) => x[3])
  let quadLabels = zippedArray.map((x, i) => x[4])

  let quadOpacitiesNew = []
  let generalOpacityNew = []
  let valueInputsNew = []
  let quadLabelsNew = []

  var i;
  for (i = 0; i < odState.length; i++) {
    quadOpacitiesNew[odState[i]] = quadOpacities[i]
    generalOpacityNew[odState[i]] = generalOpacity[i]
    valueInputsNew[odState[i]] = valueInputs[i]
    quadLabelsNew[odState[i]] = quadLabels[i]
  }

  return [ odState, quadOpacitiesNew, generalOpacityNew, valueInputsNew, quadLabelsNew]
}


export default class TempCalGUI extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      odState: [2,3,0,1],
      quadOpacities: this.props.quadOpacities,
      generalOpacity: this.props.generalOpacity,
      valueInputs: this.props.valueInputs,
      quadLabels: this.props.quadLabels,
      zipped: [],
      readProgress: this.props.readProgress,
      displayGraphs: this.props.displayGraphs,
      selectedSmartQuad: NaN
    };
  }

  componentDidUpdate(prevProps) {
    if ((this.props.generalOpacity !== prevProps.generalOpacity) || this.props.quadOpacities !== prevProps.quadOpacities || this.props.valueInputs !== prevProps.valueInputs || this.props.quadLabels !== prevProps.quadLabels) {
      let zippedSamples = zipValues(this.state.odState, this.props.quadOpacities, this.props.generalOpacity, this.props.valueInputs, this.props.quadLabels)
      this.setState({
        generalOpacity: this.props.generalOpacity,
        quadOpacities: this.props.quadOpacities,
        valueInputs: this.props.valueInputs,
        quadLabels: this.props.quadLabels,
        zipped: zippedSamples,
      })
    }
    if (this.props.readProgress !== prevProps.readProgress) {
      this.setState({ readProgress: this.props.readProgress})
    }
  }

  handleBack = (event) => {
    let zippedSamples = zipValues(this.state.odState, this.state.quadOpacities, this.state.generalOpacity, this.state.valueInputs, this.state.quadLabels)
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
    let quadOpacities = unzipped[1]
    let generalOpacity = unzipped[2]
    let valueInputs = unzipped[3]
    let quadLabels = unzipped[4]

    this.setState({
      zipped: newState,
      odState: odState,
      quadOpacities: quadOpacities,
      generalOpacity: generalOpacity,
      valueInputs: valueInputs,
      quadLabels: quadLabels,
    });
  }

  handleAdvance = (event) => {
    let zippedSamples = zipValues(this.state.odState, this.state.quadOpacities, this.state.generalOpacity, this.state.valueInputs, this.state.quadLabels)
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
    let quadOpacities = unzipped[1]
    let generalOpacity = unzipped[2]
    let valueInputs = unzipped[3]
    let quadLabels = unzipped[4]

    this.setState({
      zipped: newState,
      odState: odState,
      quadOpacities: quadOpacities,
      generalOpacity: generalOpacity,
      valueInputs: valueInputs,
      quadLabels: quadLabels,
    });
  };

  handleSmartQuadSelection = (selectedSmartQuad) => {
    this.setState({
      selectedSmartQuad: selectedSmartQuad
    }, () => {
      this.props.onSmartQuadSelection(this.state.selectedSmartQuad);
    });
  }

  render() {
    const { odState } = this.state;
    let outputs;
    if (this.props.displayGraphs) {
      outputs = <div></div>
    }
    else {
        outputs = <div>
        <VialItem
          currentValue = {this.state.zipped}/>
        <QuadOutline
          readProgress = {this.state.readProgress}
          onSmartQuadSelection = {this.handleSmartQuadSelection}
          type = "temp"/>
      </div>
    }

    return(
            <div>{outputs}</div>
);
  }
}
