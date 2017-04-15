import * as moment from 'moment';
import { clone } from 'ramda';
import datetimeHelper from './datetimeHelper';
import textHelper from './textHelper';
import { IWxEvent, EventSource } from '../pages/events/eventsModels';
import NWSProducts from '../models/nwsProducts';

// TODO this needs to process all events, and potentially be broke out from there

const snTypeMap = [
  'unused', 'tornado', 'funnel', 'wall cloud', 'hail', 'wind',
  'flood', 'flash flood', 'other', 'rain', 'snow',
];

const regexPatterns = {
  LSRTorReport: /(\[.+?\]) (.+?) (reports TORNADO) at (.+? ...?) (.+)/i,
  LSRHailReport: /(\[.+\]) (.+?) (reports HAIL).+\([E|M|U](.+) INCH\)/i,
  TornadoEmergency: /TORNADO EMERGENCY/i,
  TornadoWatchStates: /(\[..\])/g,
  TornadoWarningSource: /\[tornado: ([A-Z|\s]+)[\]|,|\s]/i,
};

export const metaCode = {
  TornadoEmergency: 'tornado-emergency' as 'tornado-emergency',
  MesoscaleDiscussion: 'mesoscale-discussion' as 'mesoscale-discussion',
  TornadoReport: 'tornado-report' as 'tornado-report',
  HailReport: 'hail-report' as 'hail-report',
  TornadoWatch: 'tornado-watch' as 'tornado-watch',
  SevereThunderstormWatch: 'severe-watch' as 'severe-watch',
};

export const convectiveRisk = {
  None: 'None' as 'None',
  Marginal: 'Marginal' as 'Marginal',
  Slight: 'Slight' as 'Slight',
  Enhanced: 'Enhanced' as 'Enhanced',
  Moderate: 'Moderate' as 'Moderate',
  High: 'High' as 'High',
};

export interface IIEMMessageData {
  message: string;
  product_id: string;
  ts: string;
  seqnum: number;
}

const source = 'iem';
const tmpElement = document.createElement('tmp');

function parseHTML(html: string): any {
  tmpElement.innerHTML = html;

  return {
    text: tmpElement.textContent,
    link: tmpElement.getElementsByTagName('a')[0],
  };
}

/**
 * IEM will send a PTS message for each CWA in a risk area, this function will
 * condense multiple messages into a single message indicating the highest risk.
 */
function condenseSPCOutlooks(incomingEvents: any[]): any[] {
  const dayRegex = /The Storm Prediction Center issues Day (.)/i;
  const riskRegex = / (.+) Convective Risk (.+?) for portions of (.+)'s area/i;

  // Levels of SPC convective risk. Must be ranked from lowest to highest risk.
  const ptsSummary = [
    { risk: convectiveRisk.None, cwas: [] },
    { risk: convectiveRisk.Marginal, cwas: [] },
    { risk: convectiveRisk.Slight, cwas: [] },
    { risk: convectiveRisk.Enhanced, cwas: [] },
    { risk: convectiveRisk.Moderate, cwas: [] },
    { risk: convectiveRisk.High, cwas: [] },
  ];

  let condensedEvents = clone(incomingEvents);
  let firstIndex;
  let dayText;

  condensedEvents.forEach((x, index) => {
    if (x.details.code !== 'pts') { return; }
    const dayMatch = dayRegex.exec(x.details.text);
    dayText = dayMatch && dayMatch[1] ? `Day ${dayMatch[1]}` : '';
    firstIndex = typeof firstIndex === 'undefined' ? index : firstIndex;
    const result = riskRegex.exec(x.details.text.replace(dayMatch[0], ''));

    if (!result || result.length !== 4) { return; }
    const riskKey = textHelper.capitalize(result[1]);
    const summaryItem = ptsSummary.find(x => x.risk === riskKey);
    if (summaryItem && Array.isArray(summaryItem.cwas)) {
      summaryItem.cwas.push(result[3]);
    }
  });

  if (typeof firstIndex !== 'undefined') {
    // Not reversing ptsSummary in place to preserve the ranking
    const reversePTSSummary = clone(ptsSummary).reverse();
    const highestRisk = reversePTSSummary.find(x => x.cwas.length > 0) || ptsSummary[0];
    const condensedEvent = clone(condensedEvents[firstIndex]);
    condensedEvent.details.important = true;
    /* Due to bugs in Chrome's speech synth, we need to split this message when creating
      the alert. Make sure your string has a ':' character so we can split on it */
    condensedEvent.details.text = highestRisk.risk === convectiveRisk.None
      ? `The SPC issues ${dayText} Convective Risk: No thunderstorm areas forecast`
      : `The SPC issues ${dayText} ${highestRisk.risk} Convective Risk for portions of: ${highestRisk.cwas.join(', ')}`;
    condensedEvents = condensedEvents.filter(x => x.details.code !== 'pts');
    condensedEvents.splice(firstIndex, 0, condensedEvent);
  }

  return condensedEvents;
}

function getProductFromProductID(productID: string): any {
  const product: any = {};

  if (productID) {
    const splitID = productID.split('-');

    if (splitID[3] !== null && splitID[3].length >= 3) {
      product.code = splitID[3].substring(0, 3).toLowerCase();
      product.wfo = splitID[3].substring(3).toLowerCase();
    }
  }

  return product;
}

// TODO all this meta code/alert stuff really should be broken out into a separate module
// TODO should split this into separate functions for each thing
function addMetaCodes(details, userConfig) {
  function decorateTornadoLSRAlert(details: any): any {
    const regex = new RegExp(regexPatterns.LSRTorReport);
    const matches = details.text.match(regex);

    if (matches && matches.length === 6) {
      const firstText = `${textHelper.getLocationSpeech(matches[1])}, ${textHelper.getTextSpeech(matches[2].concat(' ', matches[3]))},`;
      const secondText = ` at ${matches[4]}`;
      const finalText = textHelper.breakUpText(matches[5]);
      details.alertTextValues = [ firstText, secondText ].concat(finalText);
      details.important = true;
      details.metaCode = metaCode.TornadoReport;
    }

    return details;
  }

  function decorateTornadoWatch(details: any): any {
    const regex = new RegExp(regexPatterns.TornadoWatchStates);
    const matches = details.text.match(regex);

    details.metaCode = metaCode.TornadoWatch;
    details.important = true;
    details.alertTextValues = [ 'The Storm Prediction Center has issued a tornado watch' ];

    if (matches) {
      if (matches.length > 1) {
        matches.splice(matches.length - 1, 0, ', and ');
      }
      const states = textHelper.getLocationSpeech(matches.join(', '));
      details.alertTextValues.push(` for portions of ${states}`);
    }

    return details;
  }

  function decorateLSRAlert(details: any, matchPattern: RegExp): any {
    try {
      const regex = new RegExp(matchPattern);
      const matches = details.text.match(regex);
      if (matches && matches.length > 2) {
        const textValues = [
          textHelper.getLocationSpeech(matches[1]),
          textHelper.getTextSpeech(matches[2].concat(' ', matches[3]).toLowerCase()),
        ];

        if (matches.length > 4) {
          if (matchPattern === regexPatterns.LSRHailReport) {
            const magnitude = parseFloat(matches[4]);
            if (magnitude >= userConfig.alerts.children.hailSize.value) {
              details.alertTextValues = [ textValues[0], textValues[1].replace('reports', `reports ${magnitude} inch`) ];
              details.important = true;
              details.metaCode = metaCode.HailReport;
            }
          }
        } else {
          details.alertTextValues = textValues;
        }
      }
    } catch (ex) {
      console.error(ex);
    }

    return details;
  }

  function decorateTornadoWarning(details: any): any {
    details.important = true;
    details.alertTextValues = [ `${details.wfo} issues tornado warning` ];

    const regex = new RegExp(regexPatterns.TornadoWarningSource);
    const matches = details.text.match(regex);

    if (matches && matches[1]) {
      details.alertTextValues.push(`source: ${matches[1].toLowerCase()}`);
    }

    return details;
  }

  const lsrTorMatch = 'reports TORNADO';
  const lsrHailMatch = 'reports HAIL';
  const shouldCheckLSRs = userConfig.alerts.children.hailSize.value > 0 &&
    userConfig.alerts.children.tornadoReports.value;

  switch (details.code) {
    case NWSProducts.LocalStormReport: {
      if (!shouldCheckLSRs) { break; }
      if (details.text.indexOf(lsrTorMatch) > -1) {
        details = decorateTornadoLSRAlert(details);
      } else if (details.text.indexOf(lsrHailMatch) > -1) {
        details = decorateLSRAlert(details, regexPatterns.LSRHailReport);
      }
      break;
    }
    case NWSProducts.TornadoWarning: {
      details = decorateTornadoWarning(details);
      // fall through to SVS to check for tor emergency
    }
    case NWSProducts.SevereWeatherStatement: {
      const regex = new RegExp(regexPatterns.TornadoEmergency);

      if (regex.test(details.text)) {
        details.metaCode = metaCode.TornadoEmergency;
        details.important = true;
      }
      break;
    }
    case NWSProducts.SevereStormOutlookNarrative: {
      if (details.wfo !== 'mcd') { break; }
      details.metaCode = metaCode.MesoscaleDiscussion;
      details.important = true;
      break;
    }
    case NWSProducts.WeatherWatchClearanceNotification: {
      if (details.text.indexOf('issues Tornado Watch') > -1) {
        details = decorateTornadoWatch(details);
      } else if (details.text.indexOf('issues Severe Thunderstorm Watch') > -1) {
        details.metaCode = metaCode.SevereThunderstormWatch;
        details.important = true;
      }
      break;
    }
    default: break;
  }

  return details;
}

function getDetails(productID: string, message: string): any {
  const details: any = {};
  const product = getProductFromProductID(productID);

  details.code = product.code;
  details.wfo = product.wfo;

  if (details.code === 'lsr' && message.indexOf('Summary Local Storm Report') > -1) {
    return null;
  }

  return details;
}

function formatEvent(evt: any, userConfig: any): IWxEvent {
  if (evt.author === 'iembot') {
    return formatIEMMessage(evt, userConfig);
  } else if (evt.source === EventSource.SpotterNetwork) {
    return formatSNEvent(evt, userConfig);
  }
}

function formatSNEvent(evt: any, userConfig: any): IWxEvent {
  if (!evt || !userConfig.showSpotterNetworkReports.value) { return; }

  try {
    evt.details.code = 'sn';
    evt.details.important = true;
    evt.timeAgo = datetimeHelper.getTimeAgo(evt.tsUTC);
    evt.timeLabel = `${moment(evt.tsUTC).format('HH:mm')}Z`;

    let report = snTypeMap[evt.details.type].toUpperCase();
    // Hail sizes are optional, with inches as units when present
    if (evt.details.type === 4 && evt.details.size) {
      report = `${evt.details.size}" ${report}`;
    }

    evt.details.text = `${report} reported at ${evt.timeLabel} by ${evt.details.user}`;

    if (evt.details.notes && evt.details.notes !== 'None') {
      evt.details.text += `: ${evt.details.notes}`;
    }

    return evt;
  } catch (ex) {
    console.error(ex, evt);
    return null;
  }
}

function formatIEMMessage(data: IIEMMessageData, userConfig: any): IWxEvent {
  if (!data || !data.message || !data.ts) { return null; }

  try {
    const { message, product_id, ts, seqnum } = data;
    const tsUTC = `${ts.replace(' ', 'T')}Z`;
    let details: any = {};
    const parsedHTML = parseHTML(message);

    if (!product_id) {
      if (message.indexOf('pilot report') > -1) { return null; } // Ignore pilot reports
      if (message.indexOf('Climate Report') > -1) { return null; } // Ignore climate reports
      if (message.indexOf('issues SIGMET') > -1) { return null; } // Ignore issues SIGMET
      if (message.indexOf('Space Weather Prediction Center') > -1) { return null; } // Ignore SWPC messages
      if (message.indexOf('The Storm Prediction Center issues Day 1 Fire') > -1) { return null; } // Ignore PWF messages

      // Create a fake WCN
      if (message.indexOf('SPC cancels WW') > -1) {
        details.code = 'wcn';
        details.wfo = '---';
      }

      // ASOS reports have extra whitespace and sometimes have status messages so we need a regex
      if (/ASOS.+reports/.test(message)) { return null; }
    } else {
      details = getDetails(product_id, message);

      // Details will be null for any hard filtered events like Summary LSRs - exit early
      if (details === null) { return null; }
    }

    details.text = parsedHTML.text
      .replace(`(${details.code})`, '')
      .replace(' (View text)', '')
      .replace(' --', '')
      .trim();

    details.link = parsedHTML.link;
    details = addMetaCodes(details, userConfig);

    return {
      details,
      source,
      tsUTC,
      time: new Date(tsUTC).getTime(),
      timeAgo: datetimeHelper.getTimeAgo(tsUTC),
      timeLabel: `${moment(tsUTC).format('HH:mm')}Z`,
      coords: undefined,
      message,
    };
  } catch (ex) {
    console.error(ex, data);
    return null;
  }
}

export default {
  formatEvent,
  condenseSPCOutlooks,
};
