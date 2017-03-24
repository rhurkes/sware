import { connect } from 'react-redux';
import EventsConfigComponent from './eventsConfigComponent';
import { getEventsUserConfig, updateUserConfig } from '../events/eventsDuck';
import textHelper from '../../utility/textHelper';

const mapStateToProps = (state: any) => {
  // Needed to force update: https://github.com/reactjs/redux/issues/585
  // TODO set an updated value that happens in reducer instead of this expensive computation
  const userConfig = getEventsUserConfig(state);
  return ({
    userConfig,
    configHash: textHelper.getHashCode(userConfig),
  });
};

export default connect(
  mapStateToProps,
  { updateUserConfig },
)(EventsConfigComponent);
