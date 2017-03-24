import { connect } from 'react-redux';
import EventsComponent from './eventsComponent';
import {
  getFilteredEvents, updateEventsTimeAgo, fetchEvents, getEventsUserConfig,
  getLastIEMSequence, getPollingTimer, getRequiresFilterEvents, triggerFilterEvents,
  getFilteredNewEvents,
} from './eventsDuck';
import { triggerIyaProcessing } from '../../modules/app/appDuck';

const moduleName = 'events';

const mapStateToProps = (state: any) => {
  const userConfig = getEventsUserConfig(state);
  return ({
    userConfig,
    fetching: userConfig.fetching.value,
    filteredEvents: getFilteredEvents(state),
    filteredNewEvents: getFilteredNewEvents(state),
    lastIEMSequence: getLastIEMSequence(state),
    pollingTimer: getPollingTimer(state),
    requiresFilterEvents: getRequiresFilterEvents(state),
  });
};

export default connect(
  mapStateToProps,
  { fetchEvents, updateEventsTimeAgo, triggerFilterEvents, triggerIyaProcessing },
)(EventsComponent);
