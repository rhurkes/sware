import stateMappings from '../mappings/states';

const readableTextMappings = [
  [' MNGR', ' manager'],
  [' Co,', ' county '],
];

const fromCamelToRegularCase = (text: string): string => {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toLocaleUpperCase());
};

const getLocationSpeech = (text: string): string => {
  let speech = text.slice(1);
  Object.keys(stateMappings).forEach(x => {
    speech = speech.replace(new RegExp(` ${x}]`), stateMappings[x]);
  });
  return getTextSpeech(speech);
};

const getTextSpeech = (text: string): string => {
  let speech = text;
  readableTextMappings.forEach(x => {
    speech = speech.replace(new RegExp(x[0], 'g'), x[1]);
  });
  return speech;
};

const text = 'AT 6:57 PM CDT...A LARGE TORNADO WAS MOVING ALONG INTERSTATE 44 WEST OF NEWCASTLE. ON ITS PRESENT PATH...THIS LARGE DAMAGING TORNADO WILL ENTER SOUTHWEST SECTIONS OF THE OKLAHOMA CITY METRO AREA BETWEEN 7:15 AND 7:30 PM. PERSONS IN MOORE AND SOUTH OKLAHOMA CITY SHOULD TAKE IMMEDIATE TORNADO PRECAUTIONS!';

const maxSpaceSplits = 10;

const handleSpaceSplits = (spaceSplits) => {
  let result = [];
  for (let i = 0; i < spaceSplits.length / maxSpaceSplits; i++) {
    result = result.concat(spaceSplits.slice(i * maxSpaceSplits, (i + 1) * maxSpaceSplits).join(' '));
  }
  return result;
};

const breakUpText = (text) => {
  const maxSpaceSplits = 15;

  const handleSpaceSplits = (spaceSplits) => {
    let result = [];
    for (let i = 0; i < spaceSplits.length / maxSpaceSplits; i++) {
      result = result.concat(spaceSplits.slice(i * maxSpaceSplits, (i + 1) * maxSpaceSplits).join(' '));
    }
    return result;
  };

  const ellipsesSplits = text.split('...');
  const sentenceSplits = ellipsesSplits.map(x => x.split('. '));
  const flattenedSentenceSplits = [].concat.apply([], sentenceSplits);

  const longSentenceSplits = flattenedSentenceSplits.map(x => {
    const spaceSplits = x.split(' ');
    return spaceSplits.length > 15 ? handleSpaceSplits(spaceSplits) : x;
  });
  
  return [].concat.apply([], longSentenceSplits);
};

const capitalize = (text: string): string => {
  return text && text.length ? `${text[0].toUpperCase()}${text.slice(1).toLowerCase()}` : '';
};

const getHashCode = (input: any): number => {
  const stringifiedInput = typeof input === 'string' ? input : JSON.stringify(input);
  var hash = 0, i, chr, len;
  if (stringifiedInput.length === 0) { return hash; }
  for (i = 0, len = stringifiedInput.length; i < len; i++) {
    chr = stringifiedInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export default {
  capitalize,
  breakUpText,
  fromCamelToRegularCase,
  getTextSpeech,
  getLocationSpeech,
  getHashCode,
};
