import React, { Component } from 'react'
import { SelectableGroup, createSelectable,  SelectAll, DeselectAll  } from 'react-selectable-fast'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import ReactTooltip from 'react-tooltip';


const disabledVial = []

function isDisabled(currentVial) {
  return disabledVial.includes(currentVial)
}

function ActiveButtons(state) {
  const numberSelected = state.selectedItems.length;
  if (numberSelected == 0) {
      return <SelectAll className="selectable-button"><div><ReactTooltip/><button  className="btn btn-md vialSelectorButtons tstat" data-tip="Select all vials to apply settings simultaneously">Select All</button></div></SelectAll>
  }
  else {
      return <DeselectAll className="selectable-button"><div><ReactTooltip/><button className="btn btn-md vialSelectorButtons tstat" data-tip="De-select all selected vials">Clear Sel.</button></div></DeselectAll>
  }
  return null;
}


const styles = {
  card: {
    width: 560,
    height: 620,
    margin: '3px 5px 15px 20px',
  }
};

const LabelTStat = ({ selecting, selected, vial, upper, lower, temp, stir}) => (
  <div
  className="album-label">
    <h2>
    Vial <span>{`${vial}`}</span>
    </h2>
    <span className="upper-label"> {`${upper}`} -</span>
    <span className="lower-label"> {`${lower}`} </span><br/>
    <span className="temp-label"> {`${temp}`} </span><br/>
    <span className="stir-label"> {`${stir}`} </span>
    <br />
  </div>
)

const LabelCStat = ({ selecting, selected, vial, rate, temp, stir}) => (
  <div
  className="album-label">
    <h2>
    Vial <span>{`${vial}`}</span>
    </h2>
    <span className="rate-label"> {`${rate}`} </span><br/>
    <span className="temp-label"> {`${temp}`} </span><br/>
    <span className="stir-label"> {`${stir}`} </span>
    <br />
  </div>
)

const LabelGrowthCurve = ({ selecting, selected, vial, temp, stir}) => (
  <div
  className="album-label">
    <h2>
    Vial <span>{`${vial}`}</span>
    </h2>
    <br/>
    <span className="temp-label"> {`${temp}`} </span>
    <span className="stir-label"> {`${stir}`} </span>
    <br />
  </div>
)

class TStatList extends Component {
  componentDidUpdate(nextProps) {
    return nextProps.items !== this.props.items
  }

  render() {
    return (
      <div style={{width: 560}}>
        <div className="centered">
          {this.props.items.map((item) => (
            <SelectableAlbumTStat key={item.vial} vial={item.vial} selected={item.selected} upper={item.upper} lower={item.lower} temp={item.temp} stir={item.stir}/>
          ))}
        </div>
      </div>
    )
  }
}

class CStatList extends Component {
  componentDidUpdate(nextProps) {
    return nextProps.items !== this.props.items
  }

  render() {
    return (
      <div style={{width: 560}}>
        <div className="centered">
          {this.props.items.map((item) => (
            <SelectableAlbumCStat key={item.vial} vial={item.vial} selected={item.selected} rate={item.rate} temp={item.temp} stir={item.stir}/>
          ))}
        </div>
      </div>
    )
  }
}

class GrowthCurveList extends Component {
  componentDidUpdate(nextProps) {
    return nextProps.items !== this.props.items
  }

  render() {
    return (
      <div style={{width: 560}}>
        <div className="centered">
          {this.props.items.map((item) => (
            <SelectableAlbumGrowthCurve key={item.vial} vial={item.vial} selected={item.selected} temp={item.temp} stir={item.stir}/>
          ))}
        </div>
      </div>
    )
  }
}

const AlbumTStat = ({
  selectableRef, selected, selecting, strain, vial, upper, lower, temp, stir
}) => (
  <div
    id = {"vialID-" + vial}
    ref={selectableRef}
    className={`
      ${(isDisabled(vial)) && 'not-selectable'}
      item
      ${selecting && 'selecting'}
      ${selected && 'selected'}
    `}
  >
    <div className="tick">+</div>
    <LabelTStat selected={selected} selecting={selecting} vial={vial} strain={strain} upper={upper} lower={lower} temp={temp} stir={stir}/>
  </div>
)

const AlbumCStat = ({
  selectableRef, selected, selecting, strain, vial, rate, temp, stir
}) => (
  <div
    id = {"vialID-" + vial}
    ref={selectableRef}
    className={`
      ${(isDisabled(vial)) && 'not-selectable'}
      item
      ${selecting && 'selecting'}
      ${selected && 'selected'}
    `}
  >
    <div className="tick">+</div>
    <LabelCStat selected={selected} selecting={selecting} vial={vial} strain={strain} rate={rate} temp={temp} stir={stir}/>
  </div>
)

const AlbumGrowthCurve = ({
  selectableRef, selected, selecting, strain, vial, temp, stir
}) => (
  <div
    id = {"vialID-" + vial}
    ref={selectableRef}
    className={`
      ${(isDisabled(vial)) && 'not-selectable'}
      item
      ${selecting && 'selecting'}
      ${selected && 'selected'}
    `}
  >
    <div className="tick">+</div>
    <LabelGrowthCurve selected={selected} selecting={selecting} vial={vial} strain={strain} temp={temp} stir={stir}/>
  </div>
)

const SelectableAlbumTStat = createSelectable(AlbumTStat);
const SelectableAlbumCStat = createSelectable(AlbumCStat);
const SelectableAlbumGrowthCurve = createSelectable(AlbumGrowthCurve);



class TstatVialSelector extends Component<Props>  {
  state = {
    disableFirstRow: false,
    buttonFront: "Vial Order",
    buttonBack: "Vial Order",
    selectedItems: [],
    selectingItems: [],
  }

  handleSelecting = selectingItems => {
    console.log("Handle selecting");
            if (selectingItems.length !== this.state.selectingItems.length) {
      this.setState({ selectingItems })
    }
  }

  handleSelectionFinish = selectedItems => {
    console.log("Handle selection finish");
    console.log(selectedItems);
            this.setState({
      selectedItems: selectedItems,
      selectingItems: [],
    }, this.props.vialSelectionFinish(selectedItems))
  }

  handleSelectionClear = selectedItems => {
    console.log("Handle selection clear");
  }

  toggleFirstRow = () => {
    this.setState({ disableFirstRow: !this.state.disableFirstRow })
  }

  toggleOrder = () => {
    this.setState({
      reversed: !this.state.reversed,
    })
  }

    handleSave = () => {
        this.props.onSave();
    }
  render() {
    const { classes } = this.props;
    const { items } = this.props
    const { reversed } = this.state

    const orderedItems = reversed ? items.slice(12,16).concat(items.slice(8,12)).concat(items.slice(4,8)).concat(items.slice(0,4)) : items
    const buttonLabel = reversed ? this.state.buttonBack: this.state.buttonFront

    var list;
    if (this.props.function == 'turbidostat') {
      list = <TStatList items={orderedItems}/>
    }
    else if (this.props.function == 'growthcurve') {
      list = <GrowthCurveList items={orderedItems}/>;
    }
    else if (this.props.function == 'chemostat') {
      list = <CStatList items={orderedItems}/>;
    }

    return (
        <Card className={classes.card}>
          <div className="vialArray-gui tstat" style={{display: 'flex'}}>
            <SelectableGroup
              ref={ref => (window.selectableGroup = ref)}
              className="main"
              clickClassName="tick"
              enableDeselect
              tolerance={0}
              deselectOnEsc={true}
              allowClickWithoutSelected={false}
              duringSelection={this.handleSelecting}
              onSelectionClear={this.handleSelectionClear}
              onSelectionFinish={this.handleSelectionFinish}
              ignoreList={['.not-selectable']}
            >
              {list}

              <div className="button-position tstat">
                <ActiveButtons selectedItems={this.state.selectedItems}/>
              </div>

            </SelectableGroup>
          </div>
          <div className= "toggle-button-position tstat">
            <ReactTooltip />
            <button className = "btn btn-md tstatSelectorButtons" data-tip="Flip ordering of vials." onClick={this.toggleOrder}>{buttonLabel}</button>
          </div>
          <div className="save-button-position">
          <ReactTooltip />
          <button className = "btn btn-md saveAllButton" data-tip="Save settings for experiment." onClick={this.props.onSave}>Save Expt.</button>
          </div>
          <div className = "reset-button-position">
          <button className = "btn btn-md resetAllButton" data-tip="Reset experiment parameters to defaults." onClick={this.props.onResetToDefault}>Reset</button>
          </div>
        </Card>
    )
  }
}

TstatVialSelector.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TstatVialSelector);
