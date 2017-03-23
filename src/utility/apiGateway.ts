import { fetchJSONP } from './fetchJSONP';

interface IFetchDataRequest {
    url: string,
    isJSONP: boolean,
    pollingIntervalMs: number,
    source: string,
    fetchingActionType: string,
    fetchingErrorType: string,
}

/**
 * 
 * @param request 
 */
function fetchData(req: IFetchDataRequest) {
  const networkCall = req.isJSONP ? fetchJSONP(req.url) : fetch(req.url);
  /* store.dispatch({ type: req.fetchingActionType });

  const timerFunc = () => {
    iemTimer = setTimeout(fetchData, req.pollingIntervalMs);
  };*/

  networkCall.then().catch();

  /* network.fetchJsonp(req.url, req.source, timerFunc)
    .then((response) => {
      const { messages } = response;

      if (messages && messages.length) {
        store.dispatch(addLog(`Recieved ${messages.length} new messages`, null, req.source));
        sequence = messages[messages.length - 1].seqnum;

        const formattedMessages = messages
          .map(formatIemMessage)
          .filter(x => x != null);

        if (formattedMessages.length) {
          store.dispatch(addMessages(formattedMessages));
        }
      }
    })
    .catch(error => store.dispatch({
      type: req.fetchingErrorType,
      message: error.message,
    }));*/
}

export default {
    fetchData,
}

/* function wrappedFetchJsonp(url, dataSource, pollingFunc) {
  let responseData;

  return fetchJsonp(url)
    .then((response) => {
      const fakeStatusCode = response.ok ? 200 : 500;

      store.dispatch(addNetworkLog(
        url, dataSource, fakeStatusCode, response.networkTime
      ));

      return response.json();
    })
    .then((response) => {
      responseData = response;
    })
    .catch((error) => {
      const logText = `Error while fetching ${url}: ${error.message}`;
      store.dispatch(addLog(logText, null, dataSource));
    })
    .then(() => {
      if (typeof pollingFunc === 'function') {
        return pollingFunc();
      }
      return null;
    })
    .then(() => (responseData));
}*/
