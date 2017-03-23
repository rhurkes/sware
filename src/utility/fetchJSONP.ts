// Forked from camsong/fetch-jsonp to add hooks for statistics, TypeScript support, and simplify

const defaultOptions = {
  timeout: 5000,
  jsonpCallback: 'callback',
  jsonpCallbackFunction: null,
};

function generateCallbackFunction() {
  // elapsedMs dependent on underscores and Date.now being second delimited value
  return `jsonp_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;
}

// Known issue: Will throw 'Uncaught ReferenceError: callback_*** is not defined'
// error if request timeout
function clearFunction(functionName) {
  delete window[functionName];
}

function removeScript(scriptId) {
  const script = document.getElementById(scriptId);
  document.getElementsByTagName('head')[0].removeChild(script);
}

export function fetchJSONP(_url) {
  const timeout = defaultOptions.timeout;
  const jsonpCallback = defaultOptions.jsonpCallback;
  let timeoutId;

  return new Promise((resolve, reject) => {
    const callbackFunction = generateCallbackFunction();
    const scriptId = `${jsonpCallback}_${callbackFunction}`;

    window[callbackFunction] = (response) => {
      const splitCallbackName = callbackFunction.split('_');
      const callStartTime = parseInt(splitCallbackName[1], 10);
      const elapsedMs = Date.now() - callStartTime;

      resolve({
        ok: true,
        json: () => Promise.resolve(response),
        elapsedMs,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      removeScript(scriptId);
      clearFunction(callbackFunction);
    };

    // Check if the user set their own params, and if not add a ? to start a list of params
    let url = _url;
    url += (url.indexOf('?') === -1) ? '?' : '&';

    const jsonpScript = document.createElement('script');
    jsonpScript.setAttribute('src', `${url}${jsonpCallback}=${callbackFunction}`);
    jsonpScript.id = scriptId;
    document.getElementsByTagName('head')[0].appendChild(jsonpScript);

    timeoutId = setTimeout(() => {
      reject(new Error(`JSONP request to ${_url} timed out`));
      clearFunction(callbackFunction);
      removeScript(scriptId);
    }, timeout);
  });
}
