import React from 'react';
import { withStyles } from '@material-ui/core/styles';


const styles = {

};

class CloneExpt extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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

    render() {
      const { classes } = this.props;

      return (
        <div>

        </div>
      );
    }
  }

  export default withStyles(styles)(CloneExpt);
