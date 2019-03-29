// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import keytar from 'keytar'
import Modal from 'react-responsive-modal';
import styles from './login-styling.css';

const Octokit = require('@octokit/rest')
var octokit;
var os = require('os');


const cardStyles = {

};


class GitLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      username: '',
      password: '',
      loggedIn: false,
      loginStatus: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(){
    // octokit.oauthAuthorizations.checkAuthorization({
    //   client_id, access_token
    //   }).then(result => {})

    keytar.findCredentials('evolverGithub').then(function(credentials){
      if(credentials.length !== 0){

        octokit = new Octokit ({
            auth: {
              username: credentials[0].account,
              password: credentials[0].password
            }
          });

        octokit.repos.list({}).then(result => {
          console.log(result)
          })

        octokit.activity.listReposStarredByAuthenticatedUser({}).then(result => {
          console.log(result)
          })


        } else {
          this.setState({open:true})
        }
    }.bind(this));
  }

  componentWillUnmount(){
    // keytar.deletePassword('KeytarTest','AccountName').then(function(results){
    //   if (results) {
    //     console.log('password deleted!');
    //   };
    // });
  }

  handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  onOpenModal = () => {
    this.setState({ open: true});
  };

  onCloseModal = () => {
    this.setState({ open: false });
  };

  onFormSubmit = (e) => {
   if(e.keyCode == 13){
      var username = this.state.username;
      var password = this.state.password;
      var fingerprint = Date.now()

      octokit = new Octokit ({
            auth: {
              username: username,
              password: password
          }
        });

      octokit.oauthAuthorizations.createAuthorization({
        note: 'eVOLVER Application',
        fingerprint: fingerprint
        }).then(function(result){
          keytar.setPassword('evolverGithub', username, result.data.token);
          this.setState({open: false, loginStatus: ''})
          }.bind(this)).catch(function onError(error) {
          if (error.status === 400) {
            this.setState({loginStatus: 'Bad request, often due to missing a required parameter.'});
          } else if (error.status === 401) {
            this.setState({loginStatus: 'Invalid login credentials.'});
          } else if (error.status === 404) {
            this.setState({loginStatus: 'The requested resource doesn\'t exist.'});
          }
        }.bind(this))

     };
  };



  render() {
    const { open } = this.state;
    const { classes, theme } = this.props;

    return (
      <div>
        <Modal
          open={open}
          onClose={this.onCloseModal}
          center
          closeOnOverlayClick = {false}
          closeOnEsc = {false}
          classNames={{
             closeButton: styles.customcloseButton,
             modal: styles.customModal,
             overlay: styles.customOverlay,
           }}>

           <form onKeyDown={this.onFormSubmit}>

            <label>Username</label>
            <input type="text" name="username" onChange={this.handleChange}/>

            <label>Password</label>
            <input type="password" name="password" onChange={this.handleChange}/>
          </form>
          <p className='gitStatusText'> {this.state.loginStatus} </p>

        </Modal>
      </div>

    );
  }
}

export default withStyles(cardStyles, { withTheme: true })(GitLogin);
