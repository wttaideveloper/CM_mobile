import { requireOptionalNativeModule } from 'expo';
import type * as SpeechRecognition from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { playSttTing } from '@/utils/playSttTing';

/**
 * expo-speech-recognition is a custom native module that Expo Go doesn't ship.
 * Importing the package there throws at module load — only require it when the native side exists.
 */
const speech: typeof SpeechRecognition | null = requireOptionalNativeModule('ExpoSpeechRecognition')
  ? require('expo-speech-recognition')
  : null;

export const isSpeechToTextSupported = speech !== null;

// Availability is fixed for the app's lifetime, so hook call order stays stable.
const useSpeechRecognitionEvent: typeof SpeechRecognition.useSpeechRecognitionEvent =
  speech?.useSpeechRecognitionEvent ?? (() => {});

const SILENCE_AUTO_STOP_MS = 4000;

type UseSpeechToTextOptions = {
  onTranscript: (text: string) => void;
  lang?: string;
};

type StopListeningOptions = {
  playTing?: boolean;
};

export function useSpeechToText({ onTranscript, lang = 'en-US' }: UseSpeechToTextOptions) {
  const [isListening, setIsListening] = useState(false);
  const baseDraftRef = useRef('');
  const hasReceivedSpeechRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isListeningRef = useRef(false);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(
    (options?: StopListeningOptions) => {
      clearSilenceTimer();
      hasReceivedSpeechRef.current = false;
      baseDraftRef.current = '';

      try {
        speech?.ExpoSpeechRecognitionModule.stop();
      } catch {
        // already stopped
      }

      isListeningRef.current = false;
      setIsListening(false);

      if (options?.playTing) {
        playSttTing();
      }
    },
    [clearSilenceTimer],
  );

  const scheduleSilenceAutoStop = useCallback(() => {
    clearSilenceTimer();
    hasReceivedSpeechRef.current = false;

    silenceTimerRef.current = setTimeout(() => {
      if (!hasReceivedSpeechRef.current && isListeningRef.current) {
        stopListening({ playTing: true });
      }
    }, SILENCE_AUTO_STOP_MS);
  }, [clearSilenceTimer, stopListening]);

  useSpeechRecognitionEvent('start', () => {
    isListeningRef.current = true;
    setIsListening(true);
    playSttTing();
    scheduleSilenceAutoStop();
  });

  useSpeechRecognitionEvent('end', () => {
    clearSilenceTimer();
    isListeningRef.current = false;
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript?.trim();
    if (!transcript) return;

    hasReceivedSpeechRef.current = true;
    clearSilenceTimer();

    const prefix = baseDraftRef.current;
    const next = prefix ? `${prefix} ${transcript}` : transcript;
    onTranscript(next);

    if (event.isFinal) {
      baseDraftRef.current = next;
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    clearSilenceTimer();
    isListeningRef.current = false;
    setIsListening(false);

    if (event.error === 'aborted') return;

    if (event.error === 'no-speech') {
      playSttTing();
      return;
    }

    Alert.alert('Speech recognition', 'Could not recognize speech. Please try again.');
  });

  const startListening = useCallback(
    async (currentDraft: string) => {
      if (!speech) {
        Alert.alert(
          'Speech recognition unavailable',
          'Voice typing requires a development build.',
        );
        return;
      }

      const { ExpoSpeechRecognitionModule } = speech;

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        Alert.alert(
          'Speech recognition unavailable',
          'Enable speech recognition in your device settings and try again.',
        );
        return;
      }

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Microphone permission needed',
          'Allow microphone and speech recognition to dictate messages.',
        );
        return;
      }

      baseDraftRef.current = currentDraft.trim();
      hasReceivedSpeechRef.current = false;

      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        continuous: true,
      });
    },
    [lang],
  );

  const toggleListening = useCallback(
    async (currentDraft: string) => {
      if (isListeningRef.current) {
        stopListening();
        return;
      }
      await startListening(currentDraft);
    },
    [startListening, stopListening],
  );

  useEffect(() => () => stopListening(), [stopListening]);

  return {
    isSupported: isSpeechToTextSupported,
    isListening,
    startListening,
    stopListening,
    toggleListening,
  };
}
