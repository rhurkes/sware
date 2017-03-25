import { fetchJSONP } from './fetchJSONP';

interface IFetchDataRequest {
    url: string,
    isJSONP: boolean,
    pollingIntervalMs: number,
    source: string,
    fetchingActionType: string,
    fetchingErrorType: string,
}

function fetchData(req: IFetchDataRequest) {
  const networkCall = req.isJSONP ? fetchJSONP(req.url) : fetch(req.url);
  networkCall.then().catch();
}

export default {
  fetchData,
};
