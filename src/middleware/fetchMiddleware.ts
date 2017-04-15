import { fetchJSONP } from '../utility/fetchJSONP';
import actions from '../actions';
import {
  IFetchAPIAction,
  INetworkStat,
} from '../middleware/fetchMiddlewareModel';
import fake from '../../test_data/iem-outlook-error';
import fakeSN from '../../test_data/sn-hail-no-size';

const useFakeData = false;

/**
 * Fetches data from an API
 */
const fetchAPI = (store: any) => (next: any) => (action: IFetchAPIAction): void => {
  const StatusCodeOK: number = 200;
  const StatusCodeInternalError: number = 500;

  const buildNetworkStat = (statusCode: number, elapsedMs: number): INetworkStat => ({
    isError: statusCode !== StatusCodeOK,
    elapsedMs,
  });

  if (!action.meta || !action.meta.url) { return next(action); }
  const { url, isJSONP, moduleName, polling, source } = action.meta;

  /*if (useFakeData) {
    store.dispatch({
      type: actions.FETCH_SUCCESS,
      moduleName,
      source,
      data: fakeSN,
      networkStat: buildNetworkStat(StatusCodeOK, 100),
    });
    return;
  }*/

  if (isJSONP) {
    fetchJSONP(url)
      .then((resp: any) => {
        if (useFakeData) {
          store.dispatch({
            type: actions.FETCH_SUCCESS,
            moduleName,
            source,
            data: fake,
            networkStat: buildNetworkStat(StatusCodeOK, 100),
          });
        } else if (!resp.ok) {
          store.dispatch({
            type: actions.FETCH_FAILURE,
            moduleName,
            source,
            error: 'Unknown error while retreiving JSONP',
            networkStat: buildNetworkStat(StatusCodeInternalError, resp.elapsedMs),
          });
        } else {
        Promise.all([ resp.json(), resp.elapsedMs ])
          .then((values: any[]) => {
            store.dispatch({
              type: actions.FETCH_SUCCESS,
              moduleName,
              source,
              data: values[0],
              networkStat: buildNetworkStat(StatusCodeOK, values[1]),
            });
          });
        }
      })
      .catch(console.error)
      .then(() => {
        if (polling) {
          const { delay, createNextAction, continueCheck, timerActionType } = polling;

          // Any polling that requests a last sequence ID will need to reference store
          // but you can also modify subsequent requests in other ways here if needed
          const nextAction = typeof createNextAction === 'function'
            ? createNextAction(store, action)
            : action;

          // This is a way of checking the caller's state to see if the polling interval has
          // been stopped after firing the first call, but before the timeout is registered
          if (continueCheck(store)) {
            const pollingTimer = setTimeout(() => {
              store.dispatch(nextAction);
            }, delay);

            // Since the component lifecycle handles cleanup of timers and toggling fetch
            // status, it needs to be provided with the timer reference.
            store.dispatch({
              type: timerActionType,
              pollingTimer,
            });
          }
        }
      });
  } else {
    const start = Date.now();
    fetch(url, { mode: 'cors' })  // TODO disable
      .then((resp: any) => {
        if (!resp.ok) {
          store.dispatch({
            type: actions.FETCH_FAILURE,
            moduleName,
            source,
            error: 'Unknown error while fetching JSON',
            networkStat: buildNetworkStat(StatusCodeInternalError, Date.now() - start),
          });
        } else {
          resp.json().then(data => {
            store.dispatch({
              type: actions.FETCH_SUCCESS,
              moduleName,
              source,
              data,
              networkStat: buildNetworkStat(StatusCodeOK, Date.now() - start),
            });
          });
        }
      })
      .catch(err => {
        store.dispatch({
          type: actions.FETCH_FAILURE,
          moduleName,
          source,
          error: 'Error connecting to URL',
          networkStat: buildNetworkStat(StatusCodeInternalError, Date.now() - start),
        });
      });
  }
};

export default {
  fetchAPI,
};
