import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const STT_TING_SOURCE = require('../../assets/sounds/stt-ting.wav');

let tingPlayer: AudioPlayer | null = null;

export function playSttTing() {
  try {
    if (!tingPlayer) {
      tingPlayer = createAudioPlayer(STT_TING_SOURCE);
    }

    tingPlayer.seekTo(0);
    tingPlayer.play();
  } catch (error) {
    if (__DEV__) {
      console.warn('[playSttTing] failed:', error);
    }
  }
}
