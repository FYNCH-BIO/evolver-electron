// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import styles from './modal-styling.css';
import Modal from 'react-responsive-modal';


const materialStyles = {
  card: {
    width: 450,
    height: 200,
    backgroundColor: 'black',
    padding: '0px 0px 0px 25px',
  },
  labelText: {
    padding: '8px 20px 0px 0px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '0px 0px 0px 0px',
    width: '80px',
    textAlign: 'left'
  },
};


class CalibrationButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      activeTempCal: this.props.activeTempCal,
      activeODCal: this.props.activeODCal,
      tempCalFiles: this.props.tempCalFiles,
      odCalFiles: this.props.odCalFiles,
      modalFiles: [],
      modalParameter: '',
    };
  }
  componentDidUpdate(prevProps) {
    if (this.props.activeTempCal !== prevProps.activeTempCal) {
      this.setState({ activeTempCal: this.props.activeTempCal})
    }
    if (this.props.activeODCal !== prevProps.activeODCal) {
      this.setState({ activeODCal: this.props.activeODCal})
    }
    if (this.props.tempCalFiles !== prevProps.tempCalFiles) {
      this.setState({ tempCalFiles: this.props.tempCalFiles})
    }
    if (this.props.odCalFiles !== prevProps.odCalFiles) {
      this.setState({ odCalFiles: this.props.odCalFiles})
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

  selectNewCal = (index) => {
    this.setState({ open: false });
    this.props.onSelectNewCal(this.state.modalParameter, this.state.modalFiles[index]);
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Card className={classes.card}>
          <div className='row centered'>
            <Typography variant="h5" className={classes.labelText}> OD: </Typography>
            <button className='calibrationBtns' onClick={this.changeActiveODCal}>{this.state.activeODCal}</button>
            <button className='rawCalibrationBtns'>RAW</button>
          </div>
          <div className='row centered'>
            <Typography variant="h5" className={classes.labelText}> Temp: </Typography>
            <button className='calibrationBtns' onClick={this.changeActiveTempCal}>{this.state.activeTempCal}</button>
            <button className='rawCalibrationBtns'>RAW</button>
          </div>
          <div className='row centered'>
            <Typography variant="h5" className={classes.labelText}> Pump: </Typography>
            <button className='calibrationBtns'>CAL</button>
            <button className='rawCalibrationBtns'>RAW</button>
          </div>
          <p className='calibrationBtnInstruction'> Change active calibration file or view RAW values.</p>
        </Card>
        <Modal
          open={this.state.open}
          onClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.customcloseButton,
             modal: styles.customModal,
             overlay: styles.customOverlay,
           }}>

           {this.state.modalFiles.map((modalFiles, index) => (
             <button
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
