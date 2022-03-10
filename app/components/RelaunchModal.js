// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';


const cardStyles = {

};

class RelaunchModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.alertOpen,
      question: this.props.alertQuestion,
      experiments: this.props.alertExperiments,
      answers: this.props.alertAnswers
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.alertOpen !== prevProps.alertOpen) {
      this.setState({ open: this.props.alertOpen})
    }
  }

  componentWillReceiveProps(nextProps) {
      this.setState({open:nextProps.alertOpen});
  }

  onOpenModal = () => {
    this.setState({ open: true, input:''});
  };

  onCloseModal = () => {
    this.setState({open: false, value:''});
  };

  onYes = () => {
    this.props.onClickYes();
    this.setState({open: false});
  };

  onNo = () => {
    this.props.onClickNo();
    this.setState({open: false});
  };

  render() {
    const { open } = this.state;

    return (
      <div>
        <Modal
          open={open}
          closeOnEsc={false}
          closeOnOverlayClick={false}          
          onClose={this.onCloseModal}
          onRequestClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.alertCloseButton,
             modal: styles.newExptModal,
             overlay: styles.customOverlay
           }}>
           <div style={{height: 'auto'}}>
              <p style={{textAlign: 'center', margin: '10px 5px 5px 5px', fontSize: '20px'}}>
                {this.state.question}
              </p>
              <p style={{whiteSpace: 'pre', textAlign: 'center', margin: '0px 5px 5px 5px', fontSize: '20px'}}>
                {this.state.experiments}
              </p>
              <div className='alertBtnRow' style={{margin: '0px 30px 0px 30px'}}>
                <button
                  onClick={this.onYes}
                  className={styles.alertBtns}>
                  Yes
                </button>
                <button
                  onClick={this.onNo}
                  className={styles.alertBtns}>
                  No
                </button>
              </div>
            </div>
          </Modal>
      </div>

    );
  }
}

export default withStyles(cardStyles)(RelaunchModal);
