import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export type VoicePhase = 'idle' | 'recording';

export type VoiceRecordingState = {
  phase: VoicePhase;
  isPaused: boolean;
  seconds: number;
  waveformLevels: number[];
  isPlayingPreview: boolean;
  playbackProgress: number;
  canPreview: boolean;
};

export type VoiceRecordingResult = {
  uri: string;
  durationSeconds: number;
  durationLabel: string;
};

const BAR_COUNT = 28;
const DEFAULT_LEVELS = Array.from({ length: BAR_COUNT }, () => 4);

// AAC inside MPEG-4 (.m4a) — Chrome/web and provider playback compatible.
const VOICE_RECORDING_OPTIONS = RecordingPresets.HIGH_QUALITY;

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function normalizeMetering(metering?: number): number {
  if (metering == null || Number.isNaN(metering)) {
    return 4;
  }

  const clamped = Math.min(0, Math.max(-60, metering));
  return Math.round(((clamped + 60) / 60) * 18) + 4;
}

function showRecordingError(message: string) {
  Alert.alert('Voice recording', message);
}

function safePause(player: { pause: () => void }) {
  try {
    player.pause();
  } catch {
    // player may already be released
  }
}

export function useVoiceRecorder() {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState<number[]>(DEFAULT_LEVELS);
  const levelsRef = useRef<number[]>(DEFAULT_LEVELS);
  const phaseRef = useRef<VoicePhase>('idle');
  const isPausedRef = useRef(false);
  const previewUriRef = useRef<string | null>(null);

  const recorder = useAudioRecorder({
    ...VOICE_RECORDING_OPTIONS,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, 120);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    previewUriRef.current = previewUri;
  }, [previewUri]);

  const recordingSeconds = Math.max(0, Math.floor((recorderState.durationMillis ?? 0) / 1000));
  const seconds =
    phase === 'recording' ? (isPaused ? pausedSeconds : recordingSeconds) : 0;

  useEffect(() => {
    if (phase !== 'recording' || isPaused) {
      return;
    }

    const nextLevel = normalizeMetering(recorderState.metering);
    levelsRef.current = [...levelsRef.current.slice(1), nextLevel];
    setWaveformLevels(levelsRef.current);
  }, [isPaused, phase, recorderState.metering, recorderState.durationMillis]);

  const resetWaveform = useCallback(() => {
    levelsRef.current = DEFAULT_LEVELS;
    setWaveformLevels(DEFAULT_LEVELS);
  }, []);

  const resetSession = useCallback(() => {
    safePause(player);
    resetWaveform();
    setIsPaused(false);
    setPreviewUri(null);
    setPausedSeconds(0);
    previewUriRef.current = null;
    setPhase('idle');
  }, [player, resetWaveform]);

  const configureRecordingMode = useCallback(async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  const configurePlaybackMode = useCallback(async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      interruptionMode: 'doNotMix',
    });
  }, []);

  const pauseRecording = useCallback(async () => {
    safePause(player);

    try {
      const durationSeconds = Math.max(1, recordingSeconds);

      if (recorderState.isRecording) {
        await recorder.stop();
      }

      const uri = recorder.uri;
      if (!uri) {
        showRecordingError('Could not save the recording for preview. Please try again.');
        return;
      }

      setPreviewUri(uri);
      setPausedSeconds(durationSeconds);
      setIsPaused(true);
    } catch (error) {
      console.warn('[useVoiceRecorder] pauseRecording failed:', error);
      showRecordingError('Could not pause recording. Please try again.');
    }
  }, [player, recorder, recorderState.isRecording, recordingSeconds]);

  const startRecording = useCallback(async () => {
    if (phaseRef.current !== 'idle') {
      return;
    }

    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        showRecordingError(
          'Microphone permission is required to record voice messages. Enable it in your device settings.',
        );
        return;
      }

      resetWaveform();
      setIsPaused(false);
      setPreviewUri(null);
      setPausedSeconds(0);
      setPhase('recording');

      await configureRecordingMode();
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.warn('[useVoiceRecorder] startRecording failed:', error);
      resetSession();
      showRecordingError('Could not start recording. Please try again.');
    }
  }, [configureRecordingMode, recorder, resetSession, resetWaveform]);

  const togglePauseResume = useCallback(async () => {
    if (phaseRef.current !== 'recording') {
      return;
    }

    try {
      if (isPausedRef.current) {
        safePause(player);
        setPreviewUri(null);
        setPausedSeconds(0);
        setIsPaused(false);

        await configureRecordingMode();
        await recorder.prepareToRecordAsync();
        recorder.record();
        return;
      }

      await pauseRecording();
    } catch (error) {
      console.warn('[useVoiceRecorder] togglePauseResume failed:', error);
      showRecordingError('Could not pause or resume recording. Please try again.');
    }
  }, [configureRecordingMode, pauseRecording, player, recorder]);

  const togglePreviewPlayback = useCallback(async () => {
    if (phaseRef.current !== 'recording' || !isPausedRef.current) {
      return;
    }

    const uri = previewUriRef.current;
    if (!uri) {
      showRecordingError('Preview is not ready yet. Pause recording first.');
      return;
    }

    try {
      if (playerStatus.playing) {
        player.pause();
        return;
      }

      await configurePlaybackMode();
      player.replace(uri);
      player.play();
    } catch (error) {
      console.warn('[useVoiceRecorder] togglePreviewPlayback failed:', error);
      showRecordingError('Could not play preview. Please try again.');
    }
  }, [configurePlaybackMode, player, playerStatus.playing]);

  const cancelRecording = useCallback(async () => {
    try {
      if (phaseRef.current === 'recording' && recorderState.isRecording) {
        await recorder.stop();
      }
    } catch {
      // ignore cleanup errors
    }

    resetSession();
  }, [recorder, recorderState.isRecording, resetSession]);

  const finishRecording = useCallback(async (): Promise<VoiceRecordingResult | null> => {
    if (phaseRef.current !== 'recording') {
      return null;
    }

    try {
      safePause(player);

      let uri = previewUriRef.current;
      let durationSeconds = pausedSeconds;

      if (!isPausedRef.current && recorderState.isRecording) {
        await recorder.stop();
        uri = recorder.uri ?? undefined;
        durationSeconds = Math.max(1, recordingSeconds);
      }

      if (!uri) {
        resetSession();
        showRecordingError('Recording was empty. Please try again.');
        return null;
      }

      const result: VoiceRecordingResult = {
        uri,
        durationSeconds: Math.max(1, durationSeconds),
        durationLabel: formatTime(Math.max(1, durationSeconds)),
      };

      resetSession();
      return result;
    } catch (error) {
      console.warn('[useVoiceRecorder] finishRecording failed:', error);
      resetSession();
      showRecordingError('Could not send the recording. Please try again.');
      return null;
    }
  }, [pausedSeconds, player, recorder, recorderState.isRecording, recordingSeconds, resetSession]);

  const isPlayingPreview = playerStatus.playing;
  const playbackProgress =
    playerStatus.duration > 0 ? playerStatus.currentTime / playerStatus.duration : 0;
  const canPreview = phase === 'recording' && isPaused && Boolean(previewUri);

  const state: VoiceRecordingState = {
    phase,
    isPaused,
    seconds,
    waveformLevels,
    isPlayingPreview,
    playbackProgress,
    canPreview,
  };

  return {
    state,
    isActive: phase !== 'idle',
    startRecording,
    togglePauseResume,
    togglePreviewPlayback,
    cancelRecording,
    finishRecording,
    formatTime,
  };
}
