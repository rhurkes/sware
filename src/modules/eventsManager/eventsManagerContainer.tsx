import { connect } from 'react-redux';
import EventsProcessorComponent from './eventsManagerComponent';
import {
  getFilteredEvents, fetchEvents, fetchSNEvents, getEventsUserConfig, getLastIEMSequence,
  getLastSNSequence, getPollingTimer, getFilteredNewEvents,
} from '../../pages/events/eventsDuck';
import { triggerIyaProcessing } from '../../modules/app/appDuck';

const mapStateToProps = (state: any) => {
  const userConfig = getEventsUserConfig(state);
  return ({
    userConfig,
    fetching: userConfig.get('fetching'),
    filteredEvents: getFilteredEvents(state),
    filteredNewEvents: getFilteredNewEvents(state),
    lastIEMSequence: getLastIEMSequence(state),
    lastSNSequence: getLastSNSequence(state),
    pollingTimer: getPollingTimer(state),
  });
};

export default connect(
  mapStateToProps,
  { fetchEvents, fetchSNEvents, triggerIyaProcessing },
)(EventsProcessorComponent);
