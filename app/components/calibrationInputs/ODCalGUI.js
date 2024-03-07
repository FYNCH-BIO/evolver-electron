import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import ODVialItem from './ODVialItem';
import QuadOutline from './QuadOutline';

function zipValues(odState, vialOpacities, generalOpacity, valueInputs, vialLabels) {
  let vialOpacitiesNew = [[],[],[],[]];
  let generalOpacityNew = [[],[],[],[]];
  let valueInputsNew = [[],[],[],[]];
  let vialLabelsNew = [[],[],[],[]];
  let zippedSamples = new Array(4);
  for (var i = 0; i < zippedSamples.length; i++) {
    zippedSamples[i] = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],];
  }

  for (var i = 0; i < odState.length; i++) {
    for (var j = 0; j < odState[i].length; j++) {
      valueInputsNew[i][j] = valueInputs[i][odState[i][j]];
      vialOpacitiesNew[i][j] = vialOpacities[i][odState[i][j]];
      vialLabelsNew[i][j] = vialLabels[i][odState[i][j]];

      if ( isNaN(valueInputsNew[i][j]) && (typeof valueInputsNew[i][j] !== 'string')) {
        generalOpacityNew[i][j] = 0;
      }
      else{
        generalOpacityNew[i][j] = generalOpacity[i][odState[i][j]];
      }
    }
  }

  for (var i = 0; i < zippedSamples.length; i++) {
    for (var j = 0; j < odState[i].length; j++) {
      let temp = new Array(5);
      temp[0] = odState[i][j];
      temp[1] = vialOpacitiesNew[i][j];
      temp[2] = generalOpacityNew[i][j];
      temp[3] = valueInputsNew[i][j];
      temp[4] = vialLabelsNew[i][j];
      zippedSamples[i][j] = temp;
    }
  }
  //console.log(zippedSamples)
  return zippedSamples
}
//generalOpacity = newState.map((x, i) => x[2])

function unzipValues(zippedArray) {
  let odState = [[],[],[],[]];
  let vialOpacities = [[],[],[],[]];
  let generalOpacity = [[],[],[],[]];
  let valueInputs = [[],[],[],[]];
  let vialLabels = [[],[],[],[]];

  //console.log(zippedArray)
  for (var i = 0; i < zippedArray.length; i++) {
    odState[i] = zippedArray[i].map((x,j) => x[0]);
    vialOpacities[i] = zippedArray[i].map((x,j) => x[1]);
    generalOpacity[i] = zippedArray[i].map((x,j) => x[2]);
    valueInputs[i] = zippedArray[i].map((x,j) => x[3]);
    vialLabels[i] = zippedArray[i].map((x,j) => x[4])
  }

  let vialOpacitiesNew = [[],[],[],[]];
  let generalOpacityNew = [[],[],[],[]];
  let valueInputsNew = [[],[],[],[]];
  let vialLabelsNew = [[],[],[],[]];

  for (var i = 0; i < odState.length; i++) {
    for (var j = 0; j < odState[i].length; j++) {
      vialOpacitiesNew[i][odState[i][j]] = vialOpacities[i][j];
      generalOpacityNew[i][odState[i][j]] = generalOpacity[i][j];
      valueInputsNew[i][odState[i][j]] = valueInputs[i][j];
      vialLabelsNew[i][odState[i][j]] = vialLabels[i][j];
    }
  }

  return [ odState, vialOpacitiesNew, generalOpacityNew, valueInputsNew, vialLabelsNew]
}



export default class ODCalGUI extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      odState: Array(4).fill([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]),
      vialOpacities: this.props.vialOpacities,
      generalOpacity: this.props.generalOpacity,
      valueInputs: this.props.valueInputs,
      vialLabels: this.props.vialLabels,
      zipped: [[],[],[],[]],
      readProgress: this.props.readProgress,
      selectedSmartQuad: NaN
    };
  }

  componentDidUpdate(prevProps) {
    if ((this.props.generalOpacity !== prevProps.generalOpacity) || this.props.vialOpacities !== prevProps.vialOpacities || this.props.valueInputs !== prevProps.valueInputs || this.props.vialLabels !== prevProps.vialLabels) {
      let zippedSamples = zipValues(this.state.odState, this.props.vialOpacities, this.props.generalOpacity, this.props.valueInputs, this.props.vialLabels)
      this.setState({
        generalOpacity: this.props.generalOpacity,
        vialOpacities: this.props.vialOpacities,
        valueInputs: this.props.valueInputs,
        vialLabels: this.props.vialLabels,
        zipped: zippedSamples,
      })
    }
    if (this.props.readProgress !== prevProps.readProgress) {
      this.setState({ readProgress: this.props.readProgress})
    }
  }

  handleBack = (event) => {
    let zippedSamples = zipValues(this.state.odState, this.state.vialOpacities, this.state.generalOpacity, this.state.valueInputs, this.state.vialLabels)
    let newState = new Array(zippedSamples.length);
    for (var i = 0; i < newState.length; i++) {
      newState[i] = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],];
    }
    for (var i = 0; i < zippedSamples.length; i++) {
      newState[i][17] = zippedSamples[i][0]
      newState[i][0] = zippedSamples[i][1]
      newState[i][1] = zippedSamples[i][2]
      newState[i][2] = zippedSamples[i][3]
      newState[i][3] = zippedSamples[i][4]
      newState[i][4] = zippedSamples[i][5]
      newState[i][5] = zippedSamples[i][6]
      newState[i][6] = zippedSamples[i][7]
      newState[i][7] = zippedSamples[i][8]
      newState[i][8] = zippedSamples[i][9]
      newState[i][9] = zippedSamples[i][10]
      newState[i][10] = zippedSamples[i][11]
      newState[i][11] = zippedSamples[i][12]
      newState[i][12] = zippedSamples[i][13]
      newState[i][13] = zippedSamples[i][14]
      newState[i][14] = zippedSamples[i][15]
      newState[i][15] = zippedSamples[i][16]
      newState[i][16] = zippedSamples[i][17]
    }

    let unzipped = unzipValues(newState)
    let odState = unzipped[0]
    let vialOpacities = unzipped[1]
    let generalOpacity = unzipped[2]
    let valueInputs = unzipped[3]
    let vialLabels = unzipped[4]

    this.setState({
      zipped: newState,
      odState: odState,
      vialOpacities: vialOpacities,
      generalOpacity: generalOpacity,
      valueInputs: valueInputs,
      vialLabels: vialLabels,
    });
  }

  handleAdvance = (event) => {
    let zippedSamples = zipValues(this.state.odState, this.state.vialOpacities, this.state.generalOpacity, this.state.valueInputs, this.state.vialLabels)
    //console.log(zippedSamples)
    let newState = new Array(zippedSamples.length);
    for (var i = 0; i < newState.length; i++) {
      newState[i] = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],];
    }
    for (var i = 0; i < zippedSamples.length; i++) {
      newState[i][0] = zippedSamples[i][17]
      newState[i][1] = zippedSamples[i][0]
      newState[i][2] = zippedSamples[i][1]
      newState[i][3] = zippedSamples[i][2]
      newState[i][4] = zippedSamples[i][3]
      newState[i][5] = zippedSamples[i][4]
      newState[i][6] = zippedSamples[i][5]
      newState[i][7] = zippedSamples[i][6]
      newState[i][8] = zippedSamples[i][7]
      newState[i][9] = zippedSamples[i][8]
      newState[i][10] = zippedSamples[i][9]
      newState[i][11] = zippedSamples[i][10]
      newState[i][12] = zippedSamples[i][11]
      newState[i][13] = zippedSamples[i][12]
      newState[i][14] = zippedSamples[i][13]
      newState[i][15] = zippedSamples[i][14]
      newState[i][16] = zippedSamples[i][15]
      newState[i][17] = zippedSamples[i][16]
    }

    let unzipped = unzipValues(newState)
    //console.log(unzipped)
    let odState = unzipped[0]
    let vialOpacities = unzipped[1]
    let generalOpacity = unzipped[2]
    let valueInputs = unzipped[3]
    let vialLabels = unzipped[4]

    this.setState({
      zipped: newState,
      odState: odState,
      vialOpacities: vialOpacities,
      generalOpacity: generalOpacity,
      valueInputs: valueInputs,
      vialLabels: vialLabels,
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
    } else {
      outputs =
        <div>
          <ODVialItem
            currentValue = {this.state.zipped}/>
          <QuadOutline
            readProgress = {this.state.readProgress}
            onSmartQuadSelection = {this.handleSmartQuadSelection}
            type = "od"/>
        </div>
    }
    return(
      <div>{outputs}</div>
    );
  }
}
