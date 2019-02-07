import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment'
import keytar from 'keytar'


const Octokit = require('@octokit/rest')
const octokit = new Octokit ()


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
      keytar.setPassword('KeytarTest', 'AccountName', 'secret');

      var Git = require("nodegit");
      // Clone a given repository into the `./tmp` folder.
      Git.Clone("https://github.com/nodegit/nodegit", "./tmp")
        // Look up this known commit.
        .then(function(repo) {
          // Use a known commit sha from this repository.
          return repo.getCommit("59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5");
        })
        // Look up a specific file within that commit.
        .then(function(commit) {
          return commit.getEntry("README.md");
        })
        // Get the blob contents from the file.
        .then(function(entry) {
          // Patch the blob to contain a reference to the entry.
          return entry.getBlob().then(function(blob) {
            blob.entry = entry;
            return blob;
          });
        })
        // Display information about the blob.
        .then(function(blob) {
          // Show the path, sha, and filesize in bytes.
          console.log(blob.entry.path() + blob.entry.sha() + blob.rawsize() + "b");

          // Show a spacer.
          console.log(Array(72).join("=") + "\n\n");

          // Show the entire file.
          console.log(String(blob));
        })
        .catch(function(err) { console.log(err); });

    }

    componentDidUpdate(prevProps) {
    // if (this.props.activeScript !== prevProps.activeScript) {
    //     this.setState({
    //       activeScript: this.props.activeScript,
    //     })
    //   }
    }

    clickButton = () => {
      octokit.repos.getBranch({
        owner: 'fynch-bioscience',
        repo: 'evolver-experiments',
        branch: 'test1'
      }).then(function (result) {
        var timeString = moment(result.data.commit.commit.committer.date).fromNow();
        console.log(timeString);
        this.setState({test:timeString})
      }.bind(this))
    }

    render() {
      const { classes } = this.props;

      return (
        <div>
          <button type="button" className="scriptSubmitBtn" onClick={this.clickButton}> Stop Code </button>

        </div>
      );
    }
  }

  export default withStyles(styles)(GitConnections);
