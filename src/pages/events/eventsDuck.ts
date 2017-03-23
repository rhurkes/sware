import swareConfig from '../../config/swareConfig';
import datetimeHelper from '../../utility/datetimeHelper';
import { IFetchAPIAction } from '../../middleware/fetchMiddlewareModel';
import { WxEvent } from './eventsModels';
import actions from '../../actions';
import userConfig from '../../config/userConfig';
import configHelper from '../../config/configHelper';
import objectHelper from '../../utility/objectHelper';
import eventProcessor from './eventsProcessor';

export const moduleName = 'events';

// Selectors
export const getFilteredNewEvents = state => state[moduleName].filteredNewEvents;
export const getFilteredEvents = state => state[moduleName].filteredEvents;
export const getLastIEMSequence = state => state[moduleName].lastIEMSequence;
export const getPollingTimer = state => state[moduleName].pollingTimer;
export const getRequiresFilterEvents = state => state[moduleName].requiresFilterEvents;

// Action creators
export const toggleFetching = () => ({ type: actions.TOGGLE_EVENTS_FETCHING });
export const updateEventsTimeAgo = () =>  ({ type: actions.UPDATE_EVENTS_TIMEAGO });
export const triggerFilterEvents = () => ({ type: actions.TRIGGER_FILTER_EVENTS });

export const updateEventsUserConfig = (path: string, value, key: string = 'value') => ({
  type: actions.UPDATE_USER_CONFIG, path: `${moduleName}|${path}`, value, key,
});

export const fetchEvents = (lastIEMSequence: number): IFetchAPIAction => ({
  type: actions.FETCH_REQUEST,
  meta: {
    url: swareConfig.events.DATA_URL.replace(/{seq}/, lastIEMSequence.toString()),
    isJSONP: true,
    analyze: true,
    moduleName,
    polling: {
      delay: swareConfig.events.POLLING_INTERVAL_MS,
      timerActionType: actions.POLLING_TIMER_UPDATE,
      continueCheck: store => store.getState()[moduleName].eventsUserConfig.fetching.value,
      createNextAction: (store, action) => {
        const nextAction = Object.assign({}, action);
        nextAction.meta.url = swareConfig.events.DATA_URL.replace(
          '{seq}', store.getState()[moduleName].lastIEMSequence);

        return nextAction;
      },
    },
  },
});

// Reducers
const initialState = {
  eventsUserConfig: configHelper.decorateConfig(userConfig.events),
  events: [],
  requiresFilterEvents: false,
  filteredEvents: [],
  filteredNewEvents: [],
  lastIEMSequence: 0,
  pollingTimer: 0,
};

export const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actions.POLLING_TIMER_UPDATE: {
      return {
        ...state, pollingTimer: action.pollingTimer,
      };
    }
    case actions.TOGGLE_EVENTS_FETCHING: {
      return {
        ...state,
        fetching: !state.eventsUserConfig.fetching.value,
        // Reset to 0 only when enabling fetching again to allow cancels to work
        pollingTimer: !state.eventsUserConfig.fetching.value ? 0 : state.pollingTimer,
      }
    }
    case actions.FETCH_SUCCESS: {
      if (action.moduleName !== moduleName || !action.data ||
        !action.data.messages || !action.data.messages.length) {
        return state;
      }

      const { events, filteredEvents, filteredNewEvents, lastIEMSequence }
        = eventProcessor.processIncomingEvents(action.data.messages, state, swareConfig.events.EVENT_LIMIT);

      return {
        ...state,
        events, filteredEvents, filteredNewEvents, lastIEMSequence,
      };
    }
    /*case actions.UPDATE_EVENTS_USER_CONFIG: {
      const eventsUserConfig = objectHelper.setFromPath(
        state.eventsUserConfig, action.key, action.path, action.value);
      
      // TODO make sure this logic remains
      // Updating the fetching status should not trigger a filter-only action
      const requiresFilterEvents = action.path !== 'fetching';

      return { ...state, eventsUserConfig, requiresFilterEvents };
    }*/
    case actions.UPDATE_EVENTS_TIMEAGO: {
      if (state.events.length === 0) { return state; }

      // TODO can probably move this to event processor
      const updatedEvents = state.events.map((x) => {
        const newEvent = Object.assign({}, x);
        newEvent.timeAgo = datetimeHelper.getTimeAgo(x.tsUTC);

        return newEvent;
      });

      const filteredEvents = eventProcessor.filterEvents(updatedEvents, state.eventsUserConfig);

      return { ...state, events: updatedEvents, filteredEvents };
    }
    case actions.TRIGGER_FILTER_EVENTS: {
      const events = state.events.slice();
      const filteredEvents = eventProcessor.filterEvents(events, state.eventsUserConfig);

      return { ...state, filteredEvents, requiresFilterEvents: false };
    }
    default: {
      return state;
    }
  }
};
