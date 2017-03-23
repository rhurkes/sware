import * as moment from 'moment';
import { clone } from 'ramda';
import userConfig from '../config/userConfig';
import datetimeHelper from './datetimeHelper';
import textHelper from './textHelper';
import { WxEvent } from '../pages/events/eventsModels';

// TODO product code strongly typed map in separate file
export const NWSProduct = {
  LocalStormReport: 'lsr' as 'lsr',
  ProbabilisticOutlookPoints: 'pts' as 'pts',
  SevereStormOutlookNarrative: 'swo' as 'swo',
  SevereWeatherStatement: 'svs' as 'svs',
  TornadoWarning: 'tor' as 'tor',
  SevereLocalStormWatch: 'sls' as 'sls',
}

const regexPatterns = {
  LSRTorReport: /(\[.+?\]) (.+?) reports TORNADO/,
  LSRHailReport: /(\[.+\]) (.+) (reports HAIL).+\([E|M](.+) INCH\)/,
};

export const metaCode = {
  TornadoEmergency: 'tornado_emergency' as 'tornado_emergency',
  MesoscaleDiscussion: 'mesoscale_discussion' as 'mesoscale_discussion',
  TornadoReport: 'tornado_report' as 'tornado_report',
  HailReport: 'hail_report' as 'hail_report',
  Watch: 'watch' as 'watch',
}

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
const tornadoEmergencyRegex = new RegExp('TORNADO EMERGENCY', 'i');

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
  const riskRegex = /Convective (.+) Risk for portions of (.+)'s area/i;

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
    const result = riskRegex.exec(x.details.text);

    if (!result || result.length !== 3) { return; }
    const riskKey = textHelper.capitalize(result[1]);
    const summaryItem = ptsSummary.find(x => x.risk === riskKey);
    if (summaryItem && Array.isArray(summaryItem.cwas)) {
      summaryItem.cwas.push(result[2]);
    }
  });

  if (typeof firstIndex !== 'undefined') {
    // Not reversing ptsSummary in place to preserve the ranking
    const reversePTSSummary = clone(ptsSummary).reverse();
    const highestRisk = reversePTSSummary.find(x => x.cwas.length > 0) || ptsSummary[0];
    const condensedEvent = clone(condensedEvents[firstIndex]);
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
function addMetaCodes(details) {
  function decorateLSRAlert(details: any, matchPattern: RegExp): string[] {
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
          if (magnitude >= userConfig.events.alerts.children.hailSize.value) {
            details.alertTextValues = [textValues[0], textValues[1].replace('reports', `reports ${magnitude} inch`)];
            details.important = true;
          }
        }
      } else {
        details.alertTextValues = textValues;
      }
    }

    return details;
  }

  const lsrTorMatch = 'reports TORNADO';
  const lsrHailMatch = 'reports HAIL';
  const shouldCheckLSRs = userConfig.events.alerts.children.hailSize.value > 0 &&
    userConfig.events.alerts.children.tornadoReports.value;

  // Check LSR for alert meta codes
  if (details.code === NWSProduct.LocalStormReport && shouldCheckLSRs) {
    if (details.text.indexOf(lsrTorMatch) > -1) {
      details = decorateLSRAlert(details, regexPatterns.LSRTorReport);
      details.important = true;
      details.metaCode = metaCode.TornadoReport;
    } else if (details.text.indexOf(lsrHailMatch) > -1) {
      details.metaCode = metaCode.HailReport;
      details = decorateLSRAlert(details, regexPatterns.LSRHailReport);
    }
  }

  if (details.code === NWSProduct.TornadoWarning) {
    details.important = true;
  }

  // Check TOR and SVS for tor emergency wording to append special meta code
  if ([NWSProduct.TornadoWarning, NWSProduct.SevereWeatherStatement].includes(details.code) &&
    tornadoEmergencyRegex.test(details.text)) {
      details.metaCode = metaCode.TornadoEmergency;
      details.important = true;
  }

  // Handle MDs
  if (details.code === NWSProduct.SevereStormOutlookNarrative && details.wfo === 'mcd') {
    details.metaCode = metaCode.MesoscaleDiscussion;
    details.important = true;
  }

  // Handle Watches
  if (details.code === NWSProduct.SevereLocalStormWatch && userConfig.events.alerts.children.watches.value) {
    details.metaCode = metaCode.Watch;
    details.important = true;
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

function formatMessage(data: IIEMMessageData): WxEvent {
  if (!data || !data.message || !data.ts) { return null; }

  // TODO this big try catch is a temporary defensive measure to ensure nothing breaks
  try {
    const { message, product_id, ts } = data;
    const tsUTC = `${ts.replace(' ', 'T')}Z`;
    let details: any = {};

    if (!product_id) {
      if (message.indexOf('pilot report') > -1) { return null; } // Ignore pilot reports
      if (message.indexOf('Climate Report') > -1) { return null; } // Ignore climate reports
      if (message.indexOf('issues SIGMET') > -1) { return null; } // Ignore issues SIGMET
      if (message.indexOf('Space Weather Prediction Center') > -1) { return null; } // Ignore SWPC messages

      // ASOS reports have extra whitespace and sometimes have status messages so we need a regex
      if (/ASOS.+reports/.test(message)) { return null; }
    } else {
      const parsedHTML = parseHTML(message);
      details = getDetails(product_id, message);

      // Details will be null for any hard filtered events like Summary LSRs - exit early
      if (details === null) { return null; }

      details.text = parsedHTML.text
        .replace(`(${details.code})`, '')
        .replace(' (View text)', '')
        .replace(' -- .', '')
        .trim();

      details.link = parsedHTML.link;
      details = addMetaCodes(details);
    }

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
    console.error('formatMessage', ex, data);
    return null;
  }
}

export default {
  formatMessage,
  condenseSPCOutlooks,
};
