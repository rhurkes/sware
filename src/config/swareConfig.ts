// NOTE: Configs for hard-coded values that users can't change
// REMINDER: All urls must be https! TODO add test for this

const eventsConfig = {
  DATA_URL: 'https://weather.im/iembot-json/room/botstalk?seqnum={seq}',
  POLLING_INTERVAL_MS: 60 * 1000,
  EVENT_LIMIT: 40,
  UPDATE_TIMEAGO_INTERVAL_MS: 60 * 1000,
  SEVERE_MODE_PRODUCTS: ['afd', 'ffa', 'ffs', 'ffw', 'flw', 'ftm', 'lsr', 'swo', 'pwo', 'sps', 'svr', 'svs', 'tor', 'wou', 'wwp', 'pts'],
};

const appConfig = {
  FULLSCREEN_MODE: false,
  APP_LOG_ENTRY_LIMIT: 500,
  NETWORK_LOG_ENTRY_LIMIT: 500,
  DEVELOPMENT_MODE: true,
};

const homeConfig = {
  HOME_IMAGE_REFRESH_MS: 120 * 1000,
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

const config = {
  app: appConfig,
  geolocation: geolocationConfig,
  speech: speechConfig,
  audio: audioConfig,
  utterances: utterancesConfig,
  home: homeConfig,
  events: eventsConfig,
};

export default config;
