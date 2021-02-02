// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Modal from 'react-responsive-modal';
import styles from './modal-styling.css';



const cardStyles = {

};


class ModalReset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.resetOpen,
      question: this.props.resetQuestion,
      value: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.resetOpen !== prevProps.resetOpen) {
      this.setState({ open: this.props.resetOpen});
    }
    if (this.props.resetQuestion !== prevProps.resetQuestion) {
      this.setState({question: this.props.resetQuestion});
    }
  }
  
  componentWillReceiveProps(nextProps) {
      this.setState({open:nextProps.resetOpen, question: nextProps.resetQuestion});
  }

  onOpenModal = () => {
    this.setState({ open: true, input:''});
  };

  onCloseModal = () => {
    this.setState({open: false, value:''});
    this.props.onResetAnswer(false);
  };

  handleAnswer = () => {
    this.setState({open: false, value: ''});
    this.props.onResetAnswer(true);
  }

  render() {
    const { open } = this.state;
    var buttons = this.props.ableToReset ? <div className='alertBtnRow' style={{height: 50, margin: '10px 0px 10px 0px'}}>
              <button onClick={this.handleAnswer} className={styles.alertBtnsReset}>YES</button>
              <button onClick={this.onCloseModal} className={styles.alertBtnsReset}>NO</button>
            </div> : <div/>;

    return (
      <div>
        <Modal
          open={open}
          onClose={this.onCloseModal}
          onRequestClose={this.onCloseModal}
          center
          classNames={{
             closeButton: styles.alertCloseButton,
             modal: styles.resetExptModal,
             overlay: styles.customOverlay
           }}>
           <div style={{height: '80px'}}>
              <p style={{textAlign: 'center', margin: '0px 10px 0px 10px', fontStyle: 'italic', fontSize: '24px',fontWeight: 'bold'}}>
                {this.state.question}
              </p>
            </div>
            {buttons}
          </Modal>
      </div>

    );
  }
}

export default withStyles(cardStyles)(ModalReset);
