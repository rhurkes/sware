import { connect } from 'react-redux';
import EventsConfigComponent from './eventsConfigComponent';
import { toggleFetching, updateEventsUserConfig } from './eventsDuck';
import textHelper from '../../utility/textHelper';

// TODO mergeprops for ownProps
const mapStateToProps = (state: any, ownProps) => ({
  eventsUserConfig: ownProps.eventsUserConfig,
  // Needed to force update: https://github.com/reactjs/redux/issues/585
  // TODO set an updated value that happens in reducer instead of this expensive computation
  configHash: textHelper.getHashCode(ownProps.eventsUserConfig),
});

export default connect(
  mapStateToProps,
  { toggleFetching, updateEventsUserConfig },
)(EventsConfigComponent);
