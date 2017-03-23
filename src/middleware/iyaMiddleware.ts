import actions from '../actions';
import audio, { AudioType, Sound } from '../utility/audio';
import { metaCode, NWSProduct } from '../utility/iemHelper';

let firstAlertFired;

function fireFirstAlert() {
  if (!firstAlertFired) {
    firstAlertFired = true;
    audio.playSound(Sound.Bamboo);
  }
}

function hailWarningRule(evt, store?) {
  if (evt.details.code === NWSProduct.LocalStormReport && evt.details.alertTextValues) {
    fireFirstAlert();
    audio.speak(evt.details.alertTextValues);
  }
}

function torWarningRule(evt, store?) {
  if (evt.details.code === NWSProduct.TornadoWarning) {
    fireFirstAlert();
    audio.speak([`${evt.details.wfo.toUpperCase()} issues tornado warning`]);
  }
}

function torReportRule(evt, store?) {
  if (evt.details.metaCode === metaCode.TornadoReport) {
    fireFirstAlert();
    audio.speak(evt.details.alertTextValues);
  }
}

function mdRule(evt, store?) {
  if (evt.details.metaCode === metaCode.MesoscaleDiscussion) {
    fireFirstAlert();
    audio.speak([evt.details.text]);
  }
}

function torEmergencyRule(evt, store?) {
  if (evt.details.metaCode === metaCode.TornadoEmergency) {
    audio.playSound(Sound.EAS);
    audio.speak([evt.details.text]);
  }
}

function spcOutlookRule(evt, store?) {
  if (evt.details.code === NWSProduct.ProbabilisticOutlookPoints) {
    fireFirstAlert();
    audio.speak(evt.details.text.split(':'));
  }
}

const eventsRules = [spcOutlookRule, mdRule, torEmergencyRule, torReportRule, torWarningRule, hailWarningRule];

function processEventsRules(events, store) {
  eventsRules.forEach(rule => {
    events.forEach(evt => rule(evt, store));
  });
}

const processor = store => next => action => {
  if (action.type === actions.TRIGGER_IYA_PROCESSING) {
    firstAlertFired = false;  // Reset on fresh batch of events
    processEventsRules(action.events, store);
  }

  return next(action);
};

export default {
  processor,
};
