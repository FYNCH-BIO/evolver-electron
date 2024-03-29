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
    return <SelectAll className="selectable-button"><button  className="btn btn-md vialSelectorButtonsPumpCal">Select All</button></SelectAll>
  }
  else {
    return <DeselectAll className="selectable-button"><button className="btn btn-md vialSelectorButtonsPumpCal">Clear Selection</button></DeselectAll>
  }
  return null;
}


const styles = {
  card: {
    width: 580,
    height: 630,
    margin: '3px 5px 15px 20px',
  },
};

const Label = ({ selecting, selected, vial, IN1, IN2, E}) => (
  <div
  className="album-label">
    <h2>
    Vial <span>{`${vial}`}</span>
    </h2>
    <span className="IN1-label">{`${IN1}`}</span><br/>
    <span className="IN2-label">{`${IN2}`}</span><br/>
    <span className="E-label">{`${E}`}</span><br/>
  </div>
)

class List extends Component {
  componentDidUpdate(nextProps) {
    return nextProps.items !== this.props.items
  }

  render() {
    return (
      <div style={{width: 595}}>
        <div className="centered">
          {this.props.items.map((item) => (
            <SelectableAlbum key={item.vial} vial={item.vial} selected={item.selected} IN1={item.IN1} IN2={item.IN2} E={item.E}/>
          ))}
        </div>
      </div>
    )
  }
}

const Album = ({
  selectableRef, selected, selecting, strain, vial, IN1, IN2, E
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
    <Label selected={selected} selecting={selecting} vial={vial} strain={strain} IN1={IN1} IN2={IN2} E={E}/>
  </div>
)

const SelectableAlbum = createSelectable(Album)



class VialSelector extends Component<Props>  {
  state = {
    disableFirstRow: false,
    buttonFront: "Vial Order",
    buttonBack: "Device Map",
    selectedItems: [],
    selectingItems: [],
    reversed: true
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

  render() {
    const { classes } = this.props;
    const { items } = this.props
    const { reversed } = this.state

    const orderedItems = this.state.reversed ? items.slice(12,16).concat(items.slice(8,12)).concat(items.slice(4,8)).concat(items.slice(0,4)) : items
    const buttonLabel = this.state.reversed ? this.state.buttonBack: this.state.buttonFront

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
              allowClickWithoutSelected={true}
              duringSelection={this.handleSelecting}
              onSelectionClear={this.handleSelectionClear}
              onSelectionFinish={this.handleSelectionFinish}
              ignoreList={['.not-selectable']}
            >
              <List items={orderedItems} />

              <div className="button-position">
                <ActiveButtons selectedItems={this.state.selectedItems} />
              </div>
            </SelectableGroup>
          </div>
          <div className= "toggle-button-position-cal">
            <button className = "btn btn-md vialSelectorButtonsPumpCal" onClick={this.toggleOrder}>{buttonLabel}</button>
          </div>
          <div className="stop-cal-button-position">
          <button className = "btn btn-md pump-cal-stop-button" > FORCE STOP ALL </button>
          </div>
        </Card>
    )
  }
}

VialSelector.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(VialSelector);
