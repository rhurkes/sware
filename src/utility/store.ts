import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { reducer as eventsReducer } from '../pages/events/eventsDuck';
import { reducer as appReducer } from '../modules/app/appDuck';
import middleware from './middleware';
import fetchMiddleware from '../middleware/fetchMiddleware';
import iya from '../middleware/iyaMiddleware';
import swareConfig from '../config/swareConfig';

const combinedReducers = combineReducers({
  app: appReducer,
  events: eventsReducer,
});

// Compose all middleware functions into the redux execution chain (ordering is important)
const composedMiddleware = swareConfig.app.DEVELOPMENT_MODE
  ? compose(applyMiddleware(middleware.logger, fetchMiddleware.fetchAPI, iya.processor))
  : compose(applyMiddleware(fetchMiddleware.fetchAPI, iya.processor))

const store = createStore(combinedReducers, composedMiddleware);
export default store;
