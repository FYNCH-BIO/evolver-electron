// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

const styles = {

};

const vialButtons = [12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3];


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
        height: '300px'}}>

        <p style={{fontSize: '21px', fontWeight: 'bold', position: 'absolute', margin: '405px 0px 0px 40px' }}>INDIVIDUAL PLOTS</p>
        <div style={{
          width:'220px',
          height: '200px',
          padding: '0px 40px 0px 40px',
          position: 'absolute',
          margin: '445px 0px 0px 75px'}}>
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
        <button
          className = 'vialPlotAllMenuBtns'
          onClick={() => this.handleVialBtns('ALL')}>
          ALL
        </button>
      </div>

    );
  }
}

export default withStyles(styles)(VialMenu);
