// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';



const cardStyles = {

};


class DeleteFileModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.alertOpen,
      question: this.props.alertQuestion,
      answers: this.props.alertAnswers,
      value: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.alertOpen !== prevProps.alertOpen) {
      this.setState({ open: this.props.alertOpen, question: this.props.alertQuestion})
    }
  }
  
  componentWillReceiveProps(nextProps) {
      this.setState({open:nextProps.alertOpen, question: this.props.alertQuestion});
  }

  onOpenModal = () => {
    this.setState({ open: true, input:''});
  };

  onCloseModal = () => {
    this.props.onAlertAnswer(0);
    this.setState({open: false, value:''});
  };

  handleAnswer = () => {
    this.props.onAlertAnswer(1);
    this.setState({open: false, value: ''});
  }

  render() {
    const { open } = this.state;

    return (
      <div>
        <Modal
          open={open}
          onClose={this.onCloseModal}
          onRequestClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.alertCloseButton,
             modal: styles.newExptModal,
             overlay: styles.customOverlay
           }}>
           <div style={{height: '120px'}}>
              <p style={{textAlign: 'center', margin: '20px 50px 15px 50px', fontStyle: 'italic', fontSize: '24px',fontWeight: 'bold'}}>
                {this.state.question}
              </p>
              <div className='alertBtnRow' style={{margin: '0px 30px 0px 30px'}}>
              </div>
              <button
              onClick={this.handleAnswer}
              className={styles.alertBtns}>
              Delete
              </button> 
              <button onClick={this.onCloseModal} className={styles.alertBtns}>Cancel</button>          
            </div>
          </Modal>
      </div>

    );
  }
}

export default withStyles(cardStyles)(DeleteFileModal);
