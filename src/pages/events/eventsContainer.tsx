import { connect } from 'react-redux';
import EventsComponent from './eventsComponent';
import {
  getFilteredEvents, updateEventsTimeAgo, getEventsUserConfig, getRequiresFilterEvents,
  triggerFilterEvents, getFilteredNewEvents,
} from './eventsDuck';
import { triggerIyaProcessing } from '../../modules/app/appDuck';

const mapStateToProps = (state: any) => {
  const userConfig = getEventsUserConfig(state);
  return ({
    userConfig,
    fetching: userConfig.fetching.value,
    filteredEvents: getFilteredEvents(state),
    filteredNewEvents: getFilteredNewEvents(state),
    requiresFilterEvents: getRequiresFilterEvents(state),
  });
};

export default connect(
  mapStateToProps,
  { updateEventsTimeAgo, triggerFilterEvents, triggerIyaProcessing },
)(EventsComponent);
