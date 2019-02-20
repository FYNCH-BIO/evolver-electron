import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment'
import keytar from 'keytar'

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
