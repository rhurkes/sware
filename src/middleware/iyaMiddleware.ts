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
function hailWarningRule(details, store?) {
  if (details.metaCode === metaCode.HailReport) {
    fireFirstAlert();
    audio.speak(details.alertTextValues);
  }
}

function torWatchRule(details, store?) {
  if (details.metaCode === metaCode.TornadoWatch) {
    fireEASAlert();
    audio.speak(details.alertTextValues);
  }
}

function torWarningRule(details, store?) {
  if (details.code === NWSProducts.TornadoWarning) {
    fireFirstAlert();
    audio.speak(details.alertTextValues);
  }
}

function torReportRule(details, store?) {
  if (details.metaCode === metaCode.TornadoReport) {
    fireFirstAlert();
    audio.speak(details.alertTextValues);
  }
}

function mdRule(details, store?) {
  if (details.metaCode === metaCode.MesoscaleDiscussion) {
    fireFirstAlert();
    audio.speak([ details.text ]);
  }
}

function torEmergencyRule(details, store?) {
  if (details.metaCode === metaCode.TornadoEmergency) {
    fireEASAlert()
    audio.speak([ details.text ]);
  }
}

function spcOutlookRule(details, store?) {
  if (details.code === NWSProducts.ProbabilisticOutlookPoints) {
    fireFirstAlert();
    audio.speak(details.text.split(':'));
  }
}

const eventsRules = [ spcOutlookRule, mdRule, torEmergencyRule, torReportRule, torWarningRule,
  hailWarningRule, torWatchRule ];

function processEventsRules(events, store) {
  eventsRules.forEach(rule => {
    events.forEach(evt => rule(evt.details, store));
  });
}

const processor = store => next => action => {
  if (action.type === actions.TRIGGER_IYA_PROCESSING) {
    firstAlertFired = false;  // Reset on fresh batch of events
    firstEASAlertFired = false;  // Reset on fresh batch of events
    processEventsRules(action.events, store);
  }

  return next(action);
};

export default {
  processor,
};
