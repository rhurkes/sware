// Note: Only Chrome and Firefox support speech synthesis
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

import swareConfig from '../config/swareConfig';

export const AudioType = {
  Speech: 'speech' as 'speech',
  Sound: 'sound' as 'sound',
};

export const Sound = {
  EAS: 'assets/audio/eas.mp3',
  Chime: 'assets/audio/chime.mp3',
  Bamboo: 'assets/audio/bamboo.mp3',
};

const audioElement = document.createElement('audio');
const synth = window.speechSynthesis;
let audioQueue = [];
let processing = false;

function processQueue(): void {
  processing = true;
  const queueItem = audioQueue[0];

  const queueCleanup = () => {
    if (audioQueue.length <= 1) {
      audioQueue = [];
      processing = false;
    } else {
      audioQueue = audioQueue.slice(1);
      setTimeout(processQueue, swareConfig.audio.DELAY_BETWEEN_SOUNDS_MS);
    }
  };

  if (queueItem.type === AudioType.Sound) {
    audioElement.src = queueItem.soundPath;
    audioElement.onended = queueCleanup;
    audioElement.onerror = queueCleanup;
    audioElement.play();
  } else if (queueItem.type === AudioType.Speech) {
    const { utterances } = queueItem;
    const utter = (utterance) => {
      utterance.onend = utterances.length > 0
        ? utter(utterances.pop())
        : queueCleanup;
      synth.speak(utterance);
    };
    utter(utterances.pop());
  }
}

function playSound(soundPath: string): void {
  audioQueue.push({
    type: AudioType.Sound,
    soundPath,
  });

  if (!processing) {
    processQueue();
  }
}

function speak(textValues: string[]): void {
  if (!synth || !swareConfig.speech.ENABLED || !textValues.length) { return; }

  // Chrome speech synth stops working after 15 second utterances, so promote multiple utterances
  // https://bugs.chromium.org/p/chromium/issues/detail?id=335907
  const utterances = textValues.map(x => new SpeechSynthesisUtterance(x));

  audioQueue.push({
    type: AudioType.Speech,
    utterances,
  });

  if (!processing) {
    processQueue();
  }
}

export default {
  playSound,
  speak,
};
