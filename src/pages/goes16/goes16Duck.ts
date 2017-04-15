import actions from '../../actions';
import configHelper from '../../config/configHelper';
import objectHelper from '../../utility/objectHelper';
import Modules from '../../pages/modules';
import swareConfig from '../../config/swareConfig';
import { IFetchAPIAction } from '../../middleware/fetchMiddlewareModel';

const moduleName = Modules.GOES16;

export const getGOES16UserConfig = state => state[moduleName].userConfig;
export const getImageData = state => state[moduleName].imageData;

export const fetchImageData = (region: string, band: string): IFetchAPIAction => ({
  type: actions.FETCH_REQUEST,
  meta: {
    url: swareConfig[moduleName].DATA_URL.replace(/{region}/, region).replace(/{band}/, band),
    moduleName,
    source: 'goes16CoD',
    polling: {
      delay: swareConfig[moduleName].POLLING_INTERVAL_MS,
      timerActionType: actions.POLLING_TIMER_UPDATE,  // Probably need unique data attached to these
      continueCheck: store => store.getState()[moduleName].userConfig.fetching.value,
      createNextAction: (store, action) => action,
    },
  },
});

export const updateUserConfig = (path: string, value, key: string = 'value') => ({
  type: actions.UPDATE_GOES16_USER_CONFIG, path, value, key,
});

const initialState = {
  imageData: { imageURLs: [] },
  userConfig: configHelper.getUserConfig(Modules.GOES16),
};

export const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actions.UPDATE_GOES16_USER_CONFIG: {
      const userConfig = objectHelper.setFromPath(state.userConfig, action.path, action.value);
      configHelper.saveUserConfig(moduleName, userConfig);

      return { ...state, userConfig };
    }
    case actions.FETCH_SUCCESS: {
      if (action.moduleName !== moduleName || !action.data) {
        return state;
      }

      const { region, band, imageURLs } = action.data;
      const fullImageURLs = imageURLs.map(x => swareConfig.goes16.IMAGE_URL_TEMPLATE
        .replace(/{region}/, region)
        .replace(/{band}/, band)
        .replace(/{filename}/, x));

      return {
        ...state,
        imageData: { region, band, imageURLs: fullImageURLs },
      };
    }
    default: { return state; }
  }
};
