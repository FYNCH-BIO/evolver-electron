import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Setup from '../components/Setup';
import * as SetupActions from '../actions/setup';

function mapStateToProps(state) {
  return {
    vials: state.vials
  };
}

export default connect(
  mapStateToProps,
)(Setup);
