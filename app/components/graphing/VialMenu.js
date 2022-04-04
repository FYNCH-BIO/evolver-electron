// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

const styles = {

};

const vialButtons = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
const quadButtons = [0,1,2,3];


class VialMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleVialBtns = (id) => {
    this.props.onSelectGraph(id);
  }

  render() {
    return (

      <div style={{
        width:'300px',
        height: '500px'}}>

        <p style={{fontSize: '21px', fontWeight: 'bold', position: 'absolute', margin: '350px 0px 0px 40px' }}>INDIVIDUAL PLOTS</p>
        <div style={{
          width:'200px',
          height: '200px',
          position: 'absolute',
          margin: '410px 0px 0px 130px'}}>
          {vialButtons.map((vialButton, index) => (
            <button
              className = 'vialPlotsMenuBtns'
              onClick={() => this.handleVialBtns(vialButton)}
              key= {vialButton}
              id={vialButton}>
              <p className='vialPlotMenuBtnsText'>{vialButton}</p>
            </button>
          ))}
        </div>
        <div style={{
          width:'150px',
          position: 'absolute',
          margin: '380px 0px 0px 15px'
          }}>
        {quadButtons.map((quadButton, index) => (
          <button
            className = 'quadMenuBtns'
            onClick={() => this.handleVialBtns(quadButton)}
            key= {quadButton}
            id={quadButton}>
            <p className='quadMenuBtnsText'>SQ{quadButton}</p>
          </button>
          ))}
        </div>

      </div>

    );
  }
}

export default withStyles(styles)(VialMenu);
