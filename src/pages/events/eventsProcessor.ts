import iemHelper, { IIEMMessageData } from '../../utility/iemHelper';
import { WxEvent } from './eventsModels';
import swareConfig from '../../config/swareConfig';

function filterByTime(cutoffMinutes: number, events: WxEvent[]) {
  const checkTerm = (cutoffMinutes * 60000 - Date.now()) / -1;
  return cutoffMinutes
    ? events.filter(x => x.time >= checkTerm)
    : events;
}

function filterEvents(events, config) {
  // Filter by age first, since it can quickly filter many events before more complex filters
  let filteredEvents = filterByTime(config.age.value, events);

  // CWA filter
  filteredEvents = filteredEvents.filter((evt) => {
    const cwaSetting = config.cwas.children[evt.details.wfo];
    return !cwaSetting || cwaSetting.value;
  });

  // Product filter
  if (config.severeMode.value) {
    filteredEvents = filteredEvents.filter(x =>
      swareConfig.events.SEVERE_MODE_PRODUCTS.includes(x.details.code));
  }

  return filteredEvents;
}

function truncateOldEvents(events, condensedEventsLength, eventLimit) {
  if (condensedEventsLength + events.length > eventLimit) {
    return (condensedEventsLength > events.length || condensedEventsLength > eventLimit)
      ? []  // Don't show new events if hitting the limit on a response. Odd case.
      : events.slice(0, eventLimit - condensedEventsLength);  // Normal truncation
  }

  return events;
}

export function processIncomingEvents(incomingEvents: IIEMMessageData[], state: any, eventLimit: number) {  
  const formattedEvents = incomingEvents
    .map(iemHelper.formatMessage)
    .filter(x => x) // Remove null results from formatter
    .reverse(); // Ensure newest events first

  const condensedEvents = iemHelper.condenseSPCOutlooks(formattedEvents);
  const filteredNewEvents = filterEvents(condensedEvents, state.eventsUserConfig);
  const truncatedOldEvents = truncateOldEvents(state.events, condensedEvents.length, eventLimit);
  const filteredOldEvents = filterEvents(truncatedOldEvents, state.eventsUserConfig);

  return {
    events: condensedEvents.concat(truncatedOldEvents),
    filteredEvents: filteredNewEvents.concat(filteredOldEvents),
    filteredNewEvents,
  };
}

export default {
  filterEvents,
  processIncomingEvents,
};
