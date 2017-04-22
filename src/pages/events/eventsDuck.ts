import swareConfig from '../../config/swareConfig';
import datetimeHelper from '../../utility/datetimeHelper';
import { IFetchAPIAction } from '../../middleware/fetchMiddlewareModel';
import actions from '../../actions';
import configHelper from '../../config/configHelper';
import objectHelper from '../../utility/objectHelper';
import eventProcessor from './eventsProcessor';
import Modules from '../../pages/modules';
import { EventSource } from './eventsModels';

export const moduleName = Modules.Events;

// Selectors
export const getFilteredNewEvents = state => state[moduleName].filteredNewEvents;
export const getFilteredEvents = state => state[moduleName].filteredEvents;
export const getLastIEMSequence = state => state[moduleName].lastIEMSequence;
export const getLastSNSequence = state => state[moduleName].lastSNSequence;
export const getPollingTimer = state => state[moduleName].pollingTimer;
export const getRequiresFilterEvents = state => state[moduleName].requiresFilterEvents;
export const getEventsUserConfig = state => state[moduleName].userConfig;

// Action creators
export const updateEventsTimeAgo = eventsUserConfig => ({ type: actions.UPDATE_EVENTS_TIMEAGO, eventsUserConfig });
export const triggerFilterEvents = eventsUserConfig => ({ type: actions.TRIGGER_FILTER_EVENTS, eventsUserConfig });

export const updateUserConfig = (path: string, value) => ({
  type: actions.UPDATE_EVENTS_USER_CONFIG, path, value,
});

export const fetchSNEvents = (lastSNSequence: number): IFetchAPIAction => ({
  type: actions.FETCH_REQUEST,
  meta: {
    url: swareConfig[moduleName].SN_DATA_URL.replace(/{seq}/, lastSNSequence.toString()),
    moduleName,
    source: EventSource.SpotterNetwork,
    polling: {
      delay: swareConfig[moduleName].POLLING_INTERVAL_MS,
      timerActionType: actions.POLLING_TIMER_UPDATE,
      continueCheck: store => store.getState()[moduleName].userConfig.get('fetching'),
      createNextAction: (store, action) => {
        const nextAction = Object.assign({}, action);
        nextAction.meta.url = swareConfig[moduleName].SN_DATA_URL.replace(
          '{seq}', store.getState()[moduleName].lastSNSequence);

        return nextAction;
      },
    },
  },
});

export const fetchEvents = (lastIEMSequence: number): IFetchAPIAction => ({
  type: actions.FETCH_REQUEST,
  meta: {
    url: swareConfig[moduleName].DATA_URL.replace(/{seq}/, lastIEMSequence.toString()),
    isJSONP: true,
    analyze: true,
    moduleName,
    source: EventSource.IEM,
    polling: {
      delay: swareConfig[moduleName].POLLING_INTERVAL_MS,
      timerActionType: actions.POLLING_TIMER_UPDATE,
      continueCheck: store => store.getState()[moduleName].userConfig.get('fetching'),
      createNextAction: (store, action) => {
        const nextAction = Object.assign({}, action);
        nextAction.meta.url = swareConfig[moduleName].DATA_URL.replace(
          '{seq}', store.getState()[moduleName].lastIEMSequence);

        return nextAction;
      },
    },
  },
});

// Reducers
const initialState = {
  events: [],
  userConfig: configHelper.getUserConfig(Modules.Events),
  requiresFilterEvents: false,
  filteredEvents: [],
  filteredNewEvents: [],
  lastIEMSequence: 0,
  lastSNSequence: 0,
  pollingTimer: 0,
};

export const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actions.POLLING_TIMER_UPDATE: {
      return {
        ...state, pollingTimer: action.pollingTimer,
      };
    }
    case actions.FETCH_SUCCESS: {
      if (action.moduleName !== moduleName || !action.data) {
        return state;
      }

      if (action.source === EventSource.IEM) {
        if (!action.data.messages || !action.data.messages.length) { return state; }

        const lastIEMSequence = action.data.messages[action.data.messages.length - 1].seqnum;
        const { events, filteredEvents, filteredNewEvents } = eventProcessor.processIncomingEvents(
          action.data.messages, state.events, state.userConfig, swareConfig[moduleName].EVENT_LIMIT);

        return {
          ...state,
          events, filteredEvents, filteredNewEvents, lastIEMSequence,
        };
      } else if (action.source === EventSource.SpotterNetwork) {
        if (!action.data || !action.data.events || !action.data.events.length) { return state; }

        const lastSNSequence = action.data.events[action.data.events.length - 1].details.sequenceID;
        const { events, filteredEvents, filteredNewEvents } = eventProcessor.processIncomingEvents(
          action.data.events, state.events, state.userConfig, swareConfig[moduleName].EVENT_LIMIT);

        return {
          ...state,
          events, filteredEvents, filteredNewEvents, lastSNSequence,
        };
      }
    }
    case actions.UPDATE_EVENTS_USER_CONFIG: {
      const userConfig = objectHelper.setValueFromPath(state.userConfig, action.path, action.value);
      configHelper.saveUserConfig(moduleName, userConfig);

      // Updating the fetching status should not trigger a filter-only action
      const requiresFilterEvents = action.path !== 'fetching';

      return { ...state, userConfig, requiresFilterEvents };
    }
    case actions.UPDATE_EVENTS_TIMEAGO: {
      if (!state.events.length) { return state; }

      // TODO can probably move this to event processor
      const updatedEvents = state.events.map(x => {
        const newEvent = Object.assign({}, x);
        newEvent.timeAgo = datetimeHelper.getTimeAgo(x.tsUTC);

        return newEvent;
      });

      const filteredEvents = eventProcessor.filterEvents(updatedEvents, state.userConfig);

      return { ...state, events: updatedEvents, filteredEvents };
    }
    case actions.TRIGGER_FILTER_EVENTS: {
      const events = state.events.slice();
      const filteredEvents = eventProcessor.filterEvents(events, state.userConfig);

      return { ...state, filteredEvents, requiresFilterEvents: false };
    }
    default: return state;
  }
};
