import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { reducer as eventsReducer } from '../pages/events/eventsDuck';
import { reducer as appReducer } from '../modules/app/appDuck';
import { reducer as goes16Reducer } from '../pages/goes16/goes16Duck';
import middleware from './middleware';
import fetchMiddleware from '../middleware/fetchMiddleware';
import iya from '../middleware/iyaMiddleware';
import swareConfig from '../config/swareConfig';
import Modules from '../pages/modules';

const combinedReducers = combineReducers({
  [Modules.App]: appReducer,
  [Modules.Events]: eventsReducer,
  [Modules.GOES16]: goes16Reducer,
});

// Compose all middleware functions into the redux execution chain (ordering is important)
const composedMiddleware = swareConfig.app.DEVELOPMENT_MODE
  ? compose(applyMiddleware(middleware.logger, fetchMiddleware.fetchAPI, iya.processor))
  : compose(applyMiddleware(fetchMiddleware.fetchAPI, iya.processor))

const store = createStore(combinedReducers, composedMiddleware);
export default store;
