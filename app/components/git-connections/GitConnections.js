import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment'
import keytar from 'keytar'

var NodeGit = require("nodegit");


const styles = {

};

class GitConnections extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      test: ''
    };
  }


    componentDidMount(){

    }

    componentDidUpdate(prevProps) {
    // if (this.props.activeScript !== prevProps.activeScript) {
    //     this.setState({
    //       activeScript: this.props.activeScript,
    //     })
    //   }
    }

    clickButton = () => {
      // var cloneURL = "https://github.com/brandogw/evolver-experiments.git";
      // var localPath = require("path").join(__dirname, "private-repo");
      // var cloneOptions = {};
      //
      // cloneOptions.bare = 1;
      // cloneOptions.fetchOpts = {
      //   callbacks: {
      //     certificateCheck: function() { return 0; }
      //   }
      // };
      //
      // var cloneRepository = NodeGit.Clone(cloneURL, localPath, cloneOptions);
      // var errorAndAttemptOpen = function() {
      //     return NodeGit.Repository.open(localPath);
      //   };
      //
      // cloneRepository.catch(errorAndAttemptOpen)
      //   .then(function(repository) {
      //     // Access any repository methods here.
      //     console.log("Is the repository bare? %s", Boolean(repository.isBare()));
      //   });
        console.log('button pressed')

        var nodegit = require('nodegit');
        var repoFolder = require("path").join(__dirname, "evolver-experiments.git");

        var signature = nodegit.Signature.now("Foo bar",
          "foo@bar.com");

        var repository;
        var remote;

        nodegit.Repository.open(repoFolder)
          .then(function(repoResult) {
            repository = repoResult;
            return repository.refreshIndex();
          })
          .then(function(index) {
            return index.addByPath('https://github.com/brandogw/evolver-experiments.git')
          })
          .then(function() {
            return index.write();
          })
          .then(function() {
            return index.writeTree();
          })
          .then(function(oid) {
            return repository.createCommit("HEAD", signature, signature,
              "initial commit", oid, []);
          })
          // Add a new remote
          .then(function() {
            return nodegit.Remote.create(repository, "origin",
              "https://github.com/brandogw/evolver-experiments-private.git")
            .then(function(remoteResult) {
              remote = remoteResult;

              // Create the push object for this remote
              return remote.push(
                ["refs/heads/master:refs/heads/master"],
                {
                  callbacks: {
                    credentials: function(url, userName) {
                      return nodegit.Cred.sshKeyFromAgent(userName);
                    }
                  }
                }
              );
            });
          }).done(function() {
            console.log("Done!");
          });


      }

    render() {
      const { classes } = this.props;

      return (
        <div>

        </div>
      );
    }
  }

  export default withStyles(styles)(GitConnections);
