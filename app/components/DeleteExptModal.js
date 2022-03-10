// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';
import routes from '../constants/routes.json';



const cardStyles = {

};


class DeleteExptModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.alertOpen,
      question: this.props.alertQuestion,
      answers: this.props.alertAnswers,
      useLink: this.props.useLink,
      buttonText: this.props.buttonText,
      value: this.props.value
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

  handleAnswer = (value) => {
    this.props.onAlertAnswer(1, value);
    this.setState({open: false, value: ''});
  }

  render() {
    const { open } = this.state;
    var confirmButton;
    if (this.state.useLink) {
      confirmButton = <Link className="cloneButton" id="clone" to={{pathname: routes.EXPTMANAGER}}><button
              onClick={() => this.handleAnswer()}
              className={styles.alertBtns}>
              {this.state.buttonText}
              </button></Link>
    }
    else {
      confirmButton = <button onClick={() => this.handleAnswer(this.state.value)} className={styles.alertBtns}>{this.state.buttonText}</button>;
    }

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
           <div style={{height: '120px'}}>
              <p style={{textAlign: 'center', margin: '20px 50px 15px 50px', fontStyle: 'italic', fontSize: '24px',fontWeight: 'bold'}}>
                {this.state.question}
              </p>
              <div className='alertBtnRow' style={{margin: '0px 30px 0px 30px'}}>
              {confirmButton}
              <button onClick={this.onCloseModal} className={styles.alertBtns}>Cancel</button>
              </div>
            </div>
          </Modal>
      </div>

    );
  }
}

export default withStyles(cardStyles)(DeleteExptModal);
