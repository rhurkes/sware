import actions from '../actions';
import audio, { AudioType, Sound } from '../utility/audio';
import { metaCode } from '../utility/iemHelper';
import NWSProducts from '../models/nwsProducts';

let firstAlertFired;
let firstEASAlertFired;

function fireFirstAlert() {
  if (!firstAlertFired) {
    firstAlertFired = true;
    audio.playSound(Sound.Bamboo);
  }
}

function fireEASAlert() {
  if (!firstEASAlertFired) {
    firstEASAlertFired = true;
    audio.playSound(Sound.EAS);
  }
}

// TODO put these all into a single function
function hailWarningRule(evt, store?) {
  if (evt.details.metaCode === metaCode.HailReport) {
    fireFirstAlert();
    audio.speak(evt.details.alertTextValues);
  }
}

function torWatchRule(evt, store?) {
  if (evt.details.metaCode === metaCode.TornadoWatch) {
    fireEASAlert();
    audio.speak(['Storm Prediction Center issues Tornado Watch']);
  }
}

function torWarningRule(evt, store?) {
  if (evt.details.code === NWSProducts.TornadoWarning) {
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
    fireEASAlert()
    audio.speak([evt.details.text]);
  }
}

function spcOutlookRule(evt, store?) {
  if (evt.details.code === NWSProducts.ProbabilisticOutlookPoints) {
    fireFirstAlert();
    audio.speak(evt.details.text.split(':'));
  }
}

const eventsRules = [spcOutlookRule, mdRule, torEmergencyRule, torReportRule, torWarningRule,
  hailWarningRule, torWatchRule];

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
