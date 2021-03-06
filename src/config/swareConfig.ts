// NOTE: Configs for hard-coded values that users can't change
// REMINDER: All urls must be https! TODO add test for this
//import Modules from '../pages/modules';

const eventsConfig = {
  DATA_URL: 'https://weather.im/iembot-json/room/botstalk?seqnum={seq}',
  SN_DATA_URL: 'https://sigtor.org/wx/api/spotternetwork/events?sequence={seq}',
  POLLING_INTERVAL_MS: 60 * 1000,
  EVENT_LIMIT: 250,
  UPDATE_TIMEAGO_INTERVAL_MS: 60 * 1000,
  SEVERE_MODE_PRODUCTS: [ 'afd', 'ffa', 'ffs', 'ffw', 'flw', 'ftm', 'lsr', 'swo', 'pwo', 'sps', 'svr', 'svs', 'tor', 'wou', 'wcn', 'wwp', 'pts' ],
};

const appConfig = {
  DEVELOPMENT_MODE: true,
};

const homeConfig = {
  HOME_IMAGE_REFRESH_MS: 3 * 60 * 1000,
};

const goes16Config = {
  IMAGE_URL_TEMPLATE: 'http://weather.cod.edu/data/goes16/{region}/{band}/{filename}',
  DATA_URL: 'https://sigtor.org/wx/api/cod/goes16/{region}/{band}',
  POLLING_INTERVAL_MS: 60 * 1000,
};

const geolocationConfig = {
  ENABLED: true,
  UPDATE_INTERVAL_MS: 30 * 1000,
};

const audioConfig = {
  DELAY_BETWEEN_SOUNDS_MS: 2000,
};

const speechConfig = {
  ENABLED: true,
  PLAY_INTRO: false,
};

const utterancesConfig = {
  INTRO: 'Welcome to sware. I will be helping you remain situationally aware.',
};

// TODO why can't I use modules.events here?
export default {
  app: appConfig,
  geolocation: geolocationConfig,
  speech: speechConfig,
  audio: audioConfig,
  utterances: utterancesConfig,
  home: homeConfig,
  events: eventsConfig,
  goes16: goes16Config,
};
