import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { ChatEmojiPanel } from '@/components/chat/ChatEmojiPanel';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import type { VoiceRecordingState } from '@/hooks/useVoiceRecorder';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const TEXT_MUTED = '#9CA3AF';
const TEXT_BLACK = '#111111';
const PILL_BORDER = '#E0E7E1';
const RECORD_RED = '#EF4444';

export type RecordingState = VoiceRecordingState;

type VoiceControls = {
  state: VoiceRecordingState;
  startRecording: () => void;
  togglePauseResume: () => void;
  togglePreviewPlayback: () => void;
  cancelRecording: () => void;
  finishRecording: () => void | Promise<void>;
  formatTime: (seconds: number) => string;
};

type ChatComposerProps = {
  draft: string;
  onChangeDraft: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  voice: VoiceControls;
  onInputFocus?: () => void;
  onAttach?: () => void;
  onCameraPress?: () => void;
  /** Increment to focus the input and open the keyboard (e.g. when starting an edit). */
  focusRequestKey?: number;
  /** Remounts the TextInput when switching between compose and edit sessions. */
  inputSessionKey?: string;
  /** Links this input to KeyboardGestureArea for interactive keyboard dismiss. */
  inputNativeID?: string;
  /** Reports the top composer row height (input pill), excluding the emoji panel. */
  onComposerRowLayout?: (event: LayoutChangeEvent) => void;
  onInputLayout?: (event: LayoutChangeEvent) => void;
  /** WhatsApp-style edit composer: dark pill, checkmark confirm. */
  editMode?: boolean;
};

const ACTION_SIZE = 48;

function ActionButton({
  icon,
  onPress,
  filled,
  iconColor,
  backgroundColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  filled?: boolean;
  iconColor?: string;
  backgroundColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        filled && styles.actionBtnFilled,
        backgroundColor ? { backgroundColor } : null,
        pressed && styles.pressed,
      ]}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={
        icon === 'send'
          ? 'Send message'
          : icon === 'mic'
            ? 'Record voice message'
            : icon === 'checkmark'
              ? 'Save edit'
              : icon
      }
    >
      <Ionicons
        name={icon}
        size={filled ? 20 : 22}
        color={iconColor ?? (filled ? PAGE_BG : TEXT_MUTED)}
      />
    </Pressable>
  );
}

function VoiceWaveform({
  levels,
  frozen = false,
  progress = 0,
}: {
  levels: number[];
  frozen?: boolean;
  progress?: number;
}) {
  const progressIndex = frozen ? Math.floor(progress * levels.length) : levels.length - 1;

  return (
    <View style={styles.waveform}>
      {levels.map((height, index) => (
        <View
          key={`${index}-${height}`}
          style={[
            styles.waveBar,
            {
              height: Math.max(4, height),
              backgroundColor: frozen
                ? index <= progressIndex
                  ? PRIMARY
                  : '#D7E3DD'
                : index > levels.length - 6
                  ? PRIMARY
                  : '#D7E3DD',
              opacity: frozen && index > progressIndex ? 0.55 : 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

function SpeechMicButton({
  isListening,
  onPress,
  idleColor,
}: {
  isListening: boolean;
  onPress: () => void;
  idleColor: string;
}) {
  const blinkOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isListening) {
      blinkOpacity.setValue(1);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkOpacity, {
          toValue: 0.2,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(blinkOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [blinkOpacity, isListening]);

  return (
    <Pressable
      onPress={onPress}
      style={styles.pillIconBtn}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={isListening ? 'Stop voice typing' : 'Start voice typing'}
      accessibilityState={{ selected: isListening }}
    >
      <Animated.View style={isListening ? { opacity: blinkOpacity } : undefined}>
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={18}
          color={isListening ? RECORD_RED : idleColor}
        />
      </Animated.View>
    </Pressable>
  );
}

function EmojiButton({
  isOpen,
  onPress,
  idleColor,
}: {
  isOpen: boolean;
  onPress: () => void;
  idleColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.pillIconBtn}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={isOpen ? 'Close emoji picker' : 'Open emoji picker'}
      accessibilityState={{ expanded: isOpen }}
    >
      <Ionicons
        name={isOpen ? 'happy' : 'happy-outline'}
        size={24}
        color={isOpen ? PRIMARY : idleColor}
      />
    </Pressable>
  );
}

export function ChatComposer({
  draft,
  onChangeDraft,
  onSend,
  disabled,
  voice,
  onInputFocus,
  onAttach,
  onCameraPress,
  focusRequestKey = 0,
  inputSessionKey = 'compose',
  inputNativeID,
  onComposerRowLayout,
  onInputLayout,
  editMode = false,
}: ChatComposerProps) {
  const inputRef = useRef<TextInput>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const hasText = draft.trim().length > 0;
  const { state, formatTime } = voice;
  const speechToText = useSpeechToText({ onTranscript: onChangeDraft });
  const { isListening, toggleListening, stopListening } = speechToText;

  useEffect(() => {
    if (state.phase !== 'idle') {
      setEmojiOpen(false);
      inputRef.current?.blur();
      stopListening();
    }
  }, [state.phase, stopListening]);

  useEffect(() => () => stopListening(), [stopListening]);

  const handleComposerSend = () => {
    setEmojiOpen(false);
    stopListening();
    onSend();
  };

  const handleEmojiSelect = (emoji: string) => {
    onChangeDraft(`${draft}${emoji}`);
  };

  const toggleEmojiPanel = () => {
    if (emojiOpen) {
      setEmojiOpen(false);
      inputRef.current?.focus();
      return;
    }

    stopListening();
    inputRef.current?.blur();
    Keyboard.dismiss();
    setEmojiOpen(true);
  };

  const handleInputFocus = () => {
    setEmojiOpen(false);
    onInputFocus?.();
  };

  useEffect(() => {
    if (!focusRequestKey) return undefined;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, Platform.OS === 'android' ? 120 : 60);

    return () => clearTimeout(timer);
  }, [focusRequestKey]);

  if (disabled) {
    return (
      <View style={styles.disabledBox}>
        <Text style={styles.disabledText}>Chat input disabled</Text>
      </View>
    );
  }

  if (state.phase === 'recording' && !editMode) {
    return (
      <View style={styles.recordingPanel}>
        <View style={styles.row} onLayout={onComposerRowLayout}>
          <View style={styles.inputPill}>
            <Pressable
              onPress={voice.cancelRecording}
              style={styles.pillIconBtn}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Cancel voice recording"
            >
              <Ionicons name="trash-outline" size={22} color={RECORD_RED} />
            </Pressable>

            {state.isPaused ? (
              <Pressable
                onPress={voice.togglePreviewPlayback}
                disabled={!state.canPreview}
                style={[styles.pillIconBtn, !state.canPreview && styles.previewDisabled]}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={
                  state.isPlayingPreview ? 'Pause voice preview' : 'Play voice preview'
                }
                accessibilityState={{ disabled: !state.canPreview }}
              >
                <Ionicons
                  name={state.isPlayingPreview ? 'pause' : 'play'}
                  size={22}
                  color={PRIMARY}
                />
              </Pressable>
            ) : null}

            <View style={styles.recordingCenter}>
              {!state.isPaused ? <View style={styles.recordingDot} /> : null}
              <VoiceWaveform
                levels={state.waveformLevels}
                frozen={state.isPaused}
                progress={state.playbackProgress}
              />
              <Text style={styles.recordingTime}>{formatTime(state.seconds)}</Text>
            </View>
          </View>

          <Pressable
            onPress={voice.togglePauseResume}
            style={({ pressed }) => [styles.pauseBtn, pressed && styles.pressed]}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={state.isPaused ? 'Resume recording' : 'Pause recording'}
          >
            <Ionicons
              name={state.isPaused ? 'mic' : 'pause'}
              size={22}
              color={RECORD_RED}
            />
          </Pressable>

          <ActionButton icon="send" onPress={voice.finishRecording} filled />
        </View>
      </View>
    );
  }

  if (editMode) {
    return (
      <View style={styles.composerStack}>
        <View style={styles.row} onLayout={onComposerRowLayout}>
          <View style={[styles.inputPill, styles.editInputPill]}>
            <EmojiButton
              isOpen={emojiOpen}
              idleColor="rgba(255,255,255,0.72)"
              onPress={toggleEmojiPanel}
            />

            <TextInput
              key={inputSessionKey}
              ref={inputRef}
              nativeID={inputNativeID}
              style={[styles.input, styles.editInput]}
              placeholder="Message"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={draft}
              onChangeText={onChangeDraft}
              onFocus={handleInputFocus}
              onLayout={onInputLayout}
              multiline
              maxLength={2000}
              accessibilityLabel="Edit message"
            />

            <SpeechMicButton
              isListening={isListening}
              idleColor="rgba(255,255,255,0.72)"
              onPress={() => {
                setEmojiOpen(false);
                void toggleListening(draft);
              }}
            />
          </View>

          {hasText ? (
            <ActionButton icon="checkmark" onPress={handleComposerSend} filled />
          ) : null}
        </View>

        {emojiOpen ? (
          <ChatEmojiPanel variant="dark" onEmojiPress={handleEmojiSelect} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.composerStack}>
      <View style={styles.row} onLayout={onComposerRowLayout}>
        <View style={styles.inputPill}>
          <EmojiButton isOpen={emojiOpen} idleColor={TEXT_MUTED} onPress={toggleEmojiPanel} />

          <TextInput
            key={inputSessionKey}
            ref={inputRef}
            nativeID={inputNativeID}
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={TEXT_MUTED}
            value={draft}
            onChangeText={onChangeDraft}
            onFocus={handleInputFocus}
            onLayout={onInputLayout}
            multiline
            maxLength={2000}
            accessibilityLabel="Message"
          />

          <SpeechMicButton
            isListening={isListening}
            idleColor={TEXT_MUTED}
            onPress={() => {
              setEmojiOpen(false);
              void toggleListening(draft);
            }}
          />
          <Pressable
            onPress={onAttach}
            style={styles.pillIconBtn}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Attach file"
          >
            <Ionicons name="attach" size={22} color={TEXT_MUTED} />
          </Pressable>
          <Pressable
            onPress={onCameraPress}
            style={styles.pillIconBtn}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Open camera"
          >
            <Ionicons name="camera-outline" size={22} color={TEXT_MUTED} />
          </Pressable>
        </View>

        {hasText ? (
          <ActionButton icon="send" onPress={handleComposerSend} filled />
        ) : (
          <ActionButton icon="mic" onPress={voice.startRecording} filled />
        )}
      </View>

      {emojiOpen ? <ChatEmojiPanel onEmojiPress={handleEmojiSelect} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  composerStack: {
    width: '100%',
    backgroundColor: '#ECF4F6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    minHeight: ACTION_SIZE,
  },
  recordingPanel: {
    paddingTop: 2,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ACTION_SIZE,
    maxHeight: 120,
    borderRadius: ACTION_SIZE / 2,
    backgroundColor: PAGE_BG,
    borderWidth: 0.5,
    borderColor: '#085C4C',
    paddingLeft: 2,
    paddingRight: 4,
  },
  pillIconBtn: {
    width: 36,
    height: ACTION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDisabled: {
    opacity: 0.4,
  },
  input: {
    flex: 1,
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    color: TEXT_BLACK,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 14 : 12,
    paddingBottom: Platform.OS === 'ios' ? 14 : 12,
    paddingHorizontal: 2,
    textAlignVertical: 'center',
  },
  actionBtn: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnFilled: {
    backgroundColor: PRIMARY,
  },
  pauseBtn: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAGE_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PILL_BORDER,
  },
  recordingCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
    minWidth: 0,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RECORD_RED,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 28,
    minWidth: 0,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  recordingTime: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_BLACK,
    minWidth: 40,
    textAlign: 'right',
  },
  disabledBox: {
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    padding: 12,
    alignItems: 'center',
  },
  disabledText: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED },
  editInputPill: {
    backgroundColor: '#1A3D34',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  editInput: {
    color: '#FFFFFF',
  },
  pressed: { opacity: 0.85 },
});
