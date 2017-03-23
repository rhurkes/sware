import { connect } from 'react-redux';
import EventsComponent from './eventsComponent';
import {
  getFilteredEvents, toggleFetching, updateEventsTimeAgo, fetchEvents,
  getLastIEMSequence, getPollingTimer, getRequiresFilterEvents, triggerFilterEvents,
  getFilteredNewEvents,
} from './eventsDuck';
import { triggerIyaProcessing } from '../../modules/app/appDuck';

const moduleName = 'events';

// TODO mergeprops for ownProps things
const mapStateToProps = (state: any, ownProps: any) => ({
  eventsUserConfig: ownProps.userConfig[moduleName],
  fetching: ownProps.userConfig[moduleName].fetching.value,
  filteredEvents: getFilteredEvents(state),
  filteredNewEvents: getFilteredNewEvents(state),
  lastIEMSequence: getLastIEMSequence(state),
  pollingTimer: getPollingTimer(state),
  requiresFilterEvents: getRequiresFilterEvents(state),
});

export default connect(
  mapStateToProps,
  { fetchEvents, updateEventsTimeAgo, triggerFilterEvents, triggerIyaProcessing },
)(EventsComponent);
