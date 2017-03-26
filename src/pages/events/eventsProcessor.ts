import iemHelper, { IIEMMessageData } from '../../utility/iemHelper';
import { WxEvent } from './eventsModels';
import swareConfig from '../../config/swareConfig';

const nonIssuedRegex = /... (?:cancels|expires|continues)/;

function filterByTime(cutoffMinutes: number, events: WxEvent[]) {
  const checkTerm = (cutoffMinutes * 60000 - Date.now()) / -1;
  return cutoffMinutes
    ? events.filter(x => x.time >= checkTerm)
    : events;
}

function filterEvents(events, userConfig) {
  let filteredEvents = events.slice();

  try {
    // Filter by age first, since it can quickly filter many events before more complex filters
    filteredEvents = filterByTime(userConfig.age.value, filteredEvents);

    // CWA filter
    if (!userConfig.showAllCWAs.value) {
      filteredEvents = filteredEvents.filter((evt) => {
        const cwaSetting = userConfig.cwas.children[evt.details.wfo];
        return !cwaSetting || cwaSetting.value;
      });
    }

    // Product filter
    if (userConfig.severeMode.value) {
      filteredEvents = filteredEvents.filter(x =>
        swareConfig.events.SEVERE_MODE_PRODUCTS.includes(x.details.code));
    }

    if (userConfig.hideNonIssued.value) {
      filteredEvents = filteredEvents.filter(x =>
        x.details.text && !x.details.text.slice(0, 13).match(nonIssuedRegex));
    }
  } catch(ex) {
    console.error(ex);
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

export function processIncomingEvents(incomingEvents: IIEMMessageData[], events: WxEvent[], userConfig: any, eventLimit: number) {  
  const formattedEvents = incomingEvents
    .map(x => iemHelper.formatMessage(x, userConfig))
    .filter(x => x) // Remove null results from formatter
    .reverse(); // Ensure newest events first

  const condensedEvents = iemHelper.condenseSPCOutlooks(formattedEvents);
  const filteredNewEvents = filterEvents(condensedEvents, userConfig);
  const truncatedOldEvents = truncateOldEvents(events, condensedEvents.length, eventLimit);
  const filteredOldEvents = filterEvents(truncatedOldEvents, userConfig);

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
