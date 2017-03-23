import { fetchJSONP } from '../utility/fetchJSONP';
import actions from '../actions';
import {
  IFetchAPIAction,
  INetworkStat,
} from '../middleware/fetchMiddlewareModel';

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
  const { url, isJSONP, moduleName, polling } = action.meta;

  if (isJSONP) {
    fetchJSONP(url)
      .then((resp: any) => {
        if (!resp.ok) {
          store.dispatch({
            type: actions.FETCH_FAILURE,
            moduleName,
            error: 'Unknown error while retreiving JSONP',
            networkStat: buildNetworkStat(StatusCodeInternalError, resp.elapsedMs),
          })
        } else {
        Promise.all([resp.json(), resp.elapsedMs])
          .then((values: Array<any>) => {
            store.dispatch({
              type: actions.FETCH_SUCCESS,
              moduleName,
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
  }

  // TODO non-JSONP
}

export default {
  fetchAPI,
};
