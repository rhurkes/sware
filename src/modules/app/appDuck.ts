import actions from '../../actions';
import configHelper from '../../config/configHelper';
import objectHelper from '../../utility/objectHelper';
import { rebuildNetworkStats } from '../../middleware/fetchMiddlewareModel';
import Modules from '../../pages/modules';

export const moduleName = 'app';

// Selectors
export const getSidebarOpen = state => state[moduleName].sidebarOpen;
export const getGeolocation = state => state[moduleName].geolocation;
export const getNetworkStats = state => state[moduleName].networkStats;
export const getAudioQueue = state => state[moduleName].audioQueue;
export const getUserConfig = state => state[moduleName].userConfig;

// Action creators
export const triggerIyaProcessing = (events: any) => ({ type: actions.TRIGGER_IYA_PROCESSING, events });
export const toggleSidebarOpen = (open: boolean) => ({ type: actions.TOGGLE_SIDEBAR_OPEN, open });
export const queueAudioAlert = () => ({ type: actions.QUEUE_AUDIO_ALERT });
export const popAudioQueue = () => ({ type: actions.POP_AUDIO_QUEUE });

export const updateGeolocation = (geolocation: Coordinates) => ({
  type: actions.UPDATE_GEOLOCATION,
  geolocation,
});

const initialState = {
  sidebarOpen: false,
  audioQueue: [],
  geolocation: {},
  userConfig: configHelper.getUserConfig(Modules.App),
  networkStats: {
    min: 0,
    avg: 0,
    max: 0,
    count: 0,
    errors: 0,
    errorPercent: 0,
    rawMsTimes: [],
  },
};

export const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actions.TOGGLE_SIDEBAR_OPEN: {
      return {
        ...state, sidebarOpen: action.open,
      };
    }
    case actions.QUEUE_AUDIO_ALERT: {
      return {
        ...state, audioQueue: state.audioQueue.concat(action.payload),
      };
    }
    case actions.POP_AUDIO_QUEUE: {
      return {
        ...state, audioQueue: state.audioQueue.length ? state.audioQueue.slice(1) : [],
      };
    }
    case actions.UPDATE_GEOLOCATION: {
      return {
        ...state, geolocation: action.geolocation,
      };
    }
    case actions.FETCH_SUCCESS:
    case actions.FETCH_FAILURE: {
      return {
        ...state, networkStats: rebuildNetworkStats(action.networkStat, state.networkStats),
      };
    }
    default: {
      return state;
    }
  }
};
