// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';



const cardStyles = {

};


class ModalAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.alertOpen,
      question: this.props.alertQuestion,
      value: '',
      stayOnPage: this.props.stayOnPage
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
    this.props.onAlertAnswer(false);
  };

  handleAnswer = () => {
    this.props.onAlertAnswer(this.state.value);
    this.setState({open: false, value: ''});
  }

  render() {
    const { open } = this.state;

    var acceptButton;
    acceptButton = <button
      onClick={() => this.handleAnswer()}
      className={styles.alertBtns}>
      OK
    </button>

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
           <div style={{height: '180px'}}>
              <p style={{textAlign: 'center', margin: '20px 50px 15px 50px', fontStyle: 'italic', fontSize: '24px',fontWeight: 'bold'}}>
                {this.state.question}
              </p>
              <div className='alertBtnRow' style={{margin: '0px 30px 0px 30px'}}>
                      {acceptButton}
              </div>
            </div>
          </Modal>
      </div>
    );
  }
}

export default withStyles(cardStyles)(ModalAlert);
