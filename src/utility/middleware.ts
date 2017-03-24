/**
 * Logs all actions and states after they are dispatched.
 */
const logger = store => next => action => {
  console.log('dispatching', action);
  next(action);
  //console.log('next state', store.getState());
};

/**
 * Lets you dispatch promises in addition to actions.
 * If the promise is resolved, its result will be dispatched as an action.
 * The promise is returned from `dispatch` so the caller may handle rejection.
 */
const vanillaPromise = store => next => action => {
  if (typeof action.then !== 'function') {
    return next(action);
  }

  return Promise.resolve(action).then(store.dispatch);
};

/**
 * Schedules actions with { meta: { delay: N } } to be delayed by N milliseconds.
 * Makes `dispatch` return a function to cancel the timeout in this case.
 */
const timeoutScheduler = store => next => action => {
  if (!action.meta || !action.meta.delay) {
    return next(action);
  }

  let timeoutId = setTimeout(
    () => next(action),
    action.meta.delay
  );

  return function cancel() {
    clearTimeout(timeoutId);
  };
};

export default {
  logger, vanillaPromise, timeoutScheduler,
};
