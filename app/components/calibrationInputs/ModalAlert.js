// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
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
      answers: this.props.alertAnswers
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.alertOpen !== prevProps.alertOpen) {
      this.setState({ open: this.props.alertOpen})
    }
    if (this.props.alertQuestion !== prevProps.alertQuestion) {
      this.setState({ question: this.props.alertQuestion})
    }
    if (this.props.alertAnswers !== prevProps.alertAnswers) {
      this.setState({ answers: this.props.alertAnswers})
    }
  }

  onOpenModal = () => {
    this.setState({ open: true, input:''});
  };

  onCloseModal = () => {
    this.setState({ open: false});
  };

  handleAnswer = (answer) => {
    this.props.onAlertAnswer(answer);
  }


  render() {
    const { open } = this.state;

    return (
      <div>
        <Modal
          open={open}
          onClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.alertCloseButton,
             modal: styles.alertModal,
             overlay: styles.customOverlay,
           }}>
           <div style={{height: '120px'}}>
              <p style={{textAlign: 'center', margin: '20px 50px 15px 50px', fontStyle: 'italic', fontSize: '24px',fontWeight: 'bold'}}>
                {this.state.question}
              </p>
              <div className='alertBtnRow' style={{margin: '0px 30px 0px 30px'}}>
                {this.state.answers.map((answer, index) => (
                  <button
                    onClick={() => this.handleAnswer(answer)}
                    className ="alertBtns"
                    key= {index}
                    id={index}>
                    {answer}
                  </button>
                ))}
              </div>
            </div>
          </Modal>

      </div>

    );
  }
}

export default withStyles(cardStyles)(ModalAlert);
