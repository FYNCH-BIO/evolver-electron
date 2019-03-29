import React, { Component } from 'react'
import { SelectableGroup, createSelectable,  SelectAll, DeselectAll  } from 'react-selectable-fast'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';


const disabledVial = []

function isDisabled(currentVial) {
  return disabledVial.includes(currentVial)
}

function ActiveButtons(state) {
  const numberSelected = state.selectedItems.length;
  if (numberSelected == 0) {
    return <SelectAll className="selectable-button"><button  className="btn btn-md vialSelectorButtons">Select All</button></SelectAll>
  }
  else {
    return <DeselectAll className="selectable-button"><button className="btn btn-md vialSelectorButtons">Clear Selection</button></DeselectAll>
  }
  return null;
}


const styles = {
  card: {
    width: 580,
    height: 620,
    margin: '3px 5px 15px 20px',
  }
};

const Label = ({ selecting, selected, vial, upper, lower, temp, stir}) => (
  <div
  className="album-label">
    <h2>
    Vial <span>{`${vial}`}</span>
    </h2>
    <span className="upper-label"> {`${upper}`} </span><br/>
    <span className="lower-label"> {`${lower}`} </span><br/>       
    <span className="temp-label"> {`${temp}`} </span>
    <span className="stir-label"> {`${stir}`} </span>     
    <br />
  </div>
)

class List extends Component {
  componentDidUpdate(nextProps) {
    return nextProps.items !== this.props.items
  }

  render() {
    return (
      <div style={{width: 560}}>
        <div className="centered">
          {this.props.items.map((item) => (
            <SelectableAlbum key={item.vial} vial={item.vial} selected={item.selected} upper={item.upper} lower={item.lower} temp={item.temp} stir={item.stir}/>
          ))}
        </div>
      </div>
    )
  }
}

const Album = ({
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
    <Label selected={selected} selecting={selecting} vial={vial} strain={strain} upper={upper} lower={lower} temp={temp} stir={stir}/>
  </div>
)

const SelectableAlbum = createSelectable(Album)



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

    return (
        <Card className={classes.card}>
          <div className="vialArray-gui" style={{display: 'flex', justifyContent:'center', alignItems:'center',}}>
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
              <List items={orderedItems} />

              <div className="button-position">
                <ActiveButtons selectedItems={this.state.selectedItems}/>
              </div>

            </SelectableGroup>
          </div>
          <div className= "toggle-button-position">
            <button className = "btn btn-md vialSelectorButtons" onClick={this.toggleOrder}>{buttonLabel}</button>
          </div>
          <div className="save-button-position">
          <button className = "btn btn-md saveAllButton" onClick={this.props.onSave}> SAVE EXPERIMENT </button>
          </div>
        </Card>
    )
  }
}

TstatVialSelector.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TstatVialSelector);
