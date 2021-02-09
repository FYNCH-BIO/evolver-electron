// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import {Typography, Tooltip} from '@material-ui/core';
import styles from './modal-styling.css';
import Modal from 'react-responsive-modal';


const materialStyles = {
  card: {
    width: 450,
    backgroundColor: 'black',
    padding: '0px 0px 0px 25px',
  },
  labelText: {
    padding: '10px 20px 0px 0px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '0px 0px 0px 0px',
    width: '80px',
    textAlign: 'left'
  },
  tooltip: {
    backgroundColor: '#f58245',
    fontSize: '14px',
    maxWidth: 400
  }
};


class CalibrationButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      activeTempCal: this.props.activeTempCal,
      activeODCal: this.props.activeODCal,
      activePumpCal: this.props.activePumpCal,
      tempCalFiles: this.props.tempCalFiles,
      odCalFiles: this.props.odCalFiles,
      pumpCalFiles: this.props.pumpCalFiles,
      modalFiles: [],
      modalParameter: '',
      showRawTemp: this.props.showRawTemp,
      showRawOD: this.props.showRawOD
    };
  }
  componentDidUpdate(prevProps) {
    if (this.props.activeTempCal !== prevProps.activeTempCal) {
      this.setState({ activeTempCal: this.props.activeTempCal});
    }
    if (this.props.activeODCal !== prevProps.activeODCal) {
      this.setState({ activeODCal: this.props.activeODCal});
    }
    if (this.props.activePumpCal !== prevProps.activePumpCal) {
      this.setState({activePumpCal: this.props.activePumpCal});
    }
    if (this.props.tempCalFiles !== prevProps.tempCalFiles) {
      this.setState({ tempCalFiles: this.props.tempCalFiles});
    }
    if (this.props.odCalFiles !== prevProps.odCalFiles) {
      this.setState({ odCalFiles: this.props.odCalFiles});
    }
    if (this.props.pumpCalFiles !== prevProps.pumpCalFiles) {
      this.setState({pumpCalFiles: this.props.pumpCalFiles});
    }
    if (this.props.showRawOD !== prevProps.showRawOD) {
      this.setState({ showRawOD: this.props.showRawOD});
    }
    if (this.props.showRawTemp !== prevProps.showRawTemp) {
      this.setState({ showRawTemp: this.props.showRawTemp});
    }
  }


  onCloseModal = () => {
    this.setState({ open: false });
  };

  changeActiveODCal = () => {
    console.log(this.state.odCalFiles);
    this.setState({
      open: true,
      modalFiles: this.state.odCalFiles,
      modalParameter: 'od',
    });
  }
  changeActiveTempCal = () => {
    console.log(this.state.tempCalFiles);
    this.setState({
      open: true,
      modalFiles: this.state.tempCalFiles,
      modalParameter: 'temp'
    });
  }
  changeActivePumpCal = () => {
    console.log(this.state.pumpCalFiles);
    this.setState({
      open: true,
      modalFiles: this.state.pumpCalFiles,
      modalParameter: 'pump'
    });
  }

  toggleRawTemp = () => {
    this.props.onSelectNewCal('rawtemp', []);
  }

  toggleRawOD = () => {
    this.props.onSelectNewCal('rawod', []);
  }

  selectNewCal = (index) => {
    this.setState({ open: false });
    if (this.state.modalParameter == 'od') {
      this.props.onSelectNewCal(this.state.modalParameter, [this.state.activeTempCal, this.state.modalFiles[index]]);
    }
    else if (this.state.modalParameter == 'temp') {
      this.props.onSelectNewCal(this.state.modalParameter, [this.state.activeODCal, this.state.modalFiles[index]]);
    }
    else if (this.state.modalParameter == 'pump') {
      this.props.onSelectNewCal(this.state.modalParameter, [this.state.activePumpCal, this.state.modalFiles[index]]);
    }
  }

  render() {
    const { classes } = this.props;

    let tempRawBtn, odRawBtn;
    if (this.state.showRawTemp){
      tempRawBtn = 'rawCalibrationBtnsPushed'
    } else {
      tempRawBtn = 'rawCalibrationBtns'
    }

    if (this.state.showRawOD){
      odRawBtn = 'rawCalibrationBtnsPushed'
    } else {
      odRawBtn = 'rawCalibrationBtns'
    }


    return (
      <div>
        <Card className={classes.card}>
          <div className='row centered'>
            <Typography variant="h5" className={classes.labelText}> Temp: </Typography>
            <Tooltip arrow classes={{tooltip:classes.tooltip}}title={"Change temperature calibration file"} placement={"bottom"}><button className='calibrationBtns' onClick={this.changeActiveTempCal}>{this.state.activeTempCal}</button></Tooltip>
            <Tooltip arrow classes={{tooltip:classes.tooltip}}title={"View live RAW Temperature data"} placement={"bottom"}><button className={tempRawBtn} onClick={this.toggleRawTemp}>RAW</button></Tooltip>
          </div>
          <div className='row centered'>
            <Typography variant="h5" className={classes.labelText}> OD: </Typography>
              <Tooltip arrow classes={{tooltip:classes.tooltip}}title={"Change OD calibration file"} placement={"bottom"}><button className='calibrationBtns' onClick={this.changeActiveODCal}>{this.state.activeODCal}</button></Tooltip>
            <Tooltip arrow classes={{tooltip:classes.tooltip}}title={"View live RAW OD data"} placement={"bottom"}><button className={odRawBtn} onClick={this.toggleRawOD}>RAW</button></Tooltip>
          </div>
          <div className='row centered'>
            <Typography variant="h5" className={classes.labelText}> Pump: </Typography>
              <Tooltip arrow classes={{tooltip:classes.tooltip}}title={"Change Pump calibration file"} placement={"bottom"}><button className='calibrationBtns' onClick={this.changeActivePumpCal}>{this.state.activePumpCal}</button></Tooltip>
          </div>
          {/*<div className='row centered'>
            <Typography variant="h5" className={classes.labelText}> Pump: </Typography>
            <button className='calibrationBtns'>CAL</button>
            <button className='rawCalibrationBtns'>RAW</button>
          </div>*/}
          <p className='calibrationBtnInstruction'> Change active calibration file or view RAW values.</p>
        </Card>
        <Modal
          open={this.state.open}
          onClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.calibrationCloseButton,
             modal: styles.calibrationModal,
             overlay: styles.calibrationOverlay,
           }}>

           {this.state.modalFiles.map((modalFiles, index) => (
             <button
              key= {index}
              id={index}
              className='activeCalSelection'
              onClick={() => this.selectNewCal(index)}>
              {modalFiles}
            </button>
           ))}

        </Modal>
      </div>

    );
  }
}

export default withStyles(materialStyles)(CalibrationButtons);
