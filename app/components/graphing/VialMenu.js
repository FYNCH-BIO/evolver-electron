// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

const styles = {

};

const vialButtons = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
const quadButtons = [2,3,0,1];


class VialMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSmartQuad: 0,
      activePlot: 'ALL'
    };
  }

  handlePlotToggle = (activePlot) => {
    this.props.onSelectGraph(activePlot);
    this.setState({activePlot:activePlot})
  }

  handleSmartQuadSelection = (smartQuad) => {
    this.setState({selectedSmartQuad: smartQuad});
    this.props.onSmartQuadSelect(smartQuad);
  }


  render() {
    let plotToggle;
    let title;
    if (this.state.activePlot == 'ALL') {
      title = `SQ${this.state.selectedSmartQuad} ALL`
      plotToggle =
      <div style={{
        width:'200px',
        height: '200px',
        position: 'absolute',
        margin: '440px 0px 0px 25px'}}>
          <button
            className = 'allMenuBtnSelected'
            onClick={() => this.handlePlotToggle('ALL')}
            key= 'allVials'
            id='allVials'>
            <p className='allMenuBtnTextSelected'>{title}</p>
          </button>
      </div>
    } else {
      plotToggle =
      <div style={{
        width:'200px',
        height: '200px',
        position: 'absolute',
        margin: '440px 0px 0px 25px'}}>
          <button
            className = 'allMenuBtn'
            onClick={() => this.handlePlotToggle('ALL')}
            key= 'allVials'
            id='allVials'>
            <p className='allMenuBtnText'>SQ{this.state.selectedSmartQuad}ALL</p>
          </button>
      </div>
    }

    return (

      <div>
        <p style={{fontSize: '21px', fontWeight: 'bold', position: 'absolute', margin: '335px 0px 0px 8px' }}>PLOT SELECTION</p>
        <div style={{
          width:'300px',
          position: 'absolute',
          margin: '365px 0px 0px 10px'
          }}>
        {quadButtons.map((quadButton, index) => (
          quadButton == this.state.selectedSmartQuad ?
          <button
            className = 'quadMenuBtnsSelected'
            onClick={() => this.handleSmartQuadSelection(quadButton)}
            key= {quadButton}
            id={quadButton}>
            <p className='quadMenuBtnsTextSelected'>SQ{quadButton}</p>
          </button> :
          <button
            className = 'quadMenuBtns'
            onClick={() => this.handleSmartQuadSelection(quadButton)}
            key= {quadButton}
            id={quadButton}>
            <p className='quadMenuBtnsText'>SQ{quadButton}</p>
          </button>
          ))}
        </div>
        {plotToggle}
        <div style={{
          width:'200px',
          height: '200px',
          position: 'absolute',
          margin: '440px 0px 0px 10px'}}>
          {vialButtons.map((vialButton, index) => (
            vialButton == this.state.activePlot ?
            <button
              className = 'vialPlotsMenuBtnsSelected'
              onClick={() => this.handlePlotToggle(vialButton)}
              key= {vialButton}
              id={vialButton}>
              <p className='vialPlotMenuBtnsTextSelected'>{vialButton}</p>
            </button> :
            <button
              className = 'vialPlotsMenuBtns'
              onClick={() => this.handlePlotToggle(vialButton)}
              key= {vialButton}
              id={vialButton}>
              <p className='vialPlotMenuBtnsText'>{vialButton}</p>
            </button>
          ))}
        </div>

      </div>

    );
  }
}

export default withStyles(styles)(VialMenu);
