import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CoachPlusIcon, CoachSendIcon } from '@/components/coach/CoachIcons';
import {
  COACH_CHAT_BORDER,
  COACH_CHAT_CHIP,
  COACH_CHAT_CHIP_BG,
  COACH_CHAT_INPUT_BORDER,
  COACH_CHAT_PAGE,
  COACH_CHAT_QUICK_REPLIES,
  COACH_CHAT_TEAL,
} from '@/components/coach/coachChatData';
import { c, NU } from '@/utils/newUiCompact';

type CoachChatComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onQuickReply: (text: string) => void;
};

export function CoachChatComposer({
  value,
  onChangeText,
  onSend,
  onQuickReply,
}: CoachChatComposerProps) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {COACH_CHAT_QUICK_REPLIES.map((reply) => (
          <Pressable
            key={reply}
            style={styles.chip}
            onPress={() => onQuickReply(reply)}
            accessibilityRole="button"
          >
            <Text style={styles.chipText}>{reply}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.bar}>
        <Pressable style={styles.plusBtn} accessibilityRole="button">
          <CoachPlusIcon />
        </Pressable>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Write a message…"
          placeholderTextColor="#9db3a4"
          returnKeyType="send"
          onSubmitEditing={onSend}
        />
        <Pressable
          style={styles.sendBtn}
          onPress={onSend}
          accessibilityRole="button"
          accessibilityLabel="Send"
        >
          <CoachSendIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    paddingHorizontal: NU.hPad,
    paddingTop: c(10, 8),
    paddingBottom: c(6, 4),
    gap: c(8, 6),
  },
  chip: {
    paddingVertical: NU.chipPadV,
    paddingHorizontal: c(15, 12),
    borderRadius: 99,
    backgroundColor: COACH_CHAT_CHIP_BG,
  },
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: COACH_CHAT_CHIP,
  },
  bar: {
    paddingHorizontal: NU.cardPad,
    paddingTop: c(10, 8),
    paddingBottom: c(22, 18),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COACH_CHAT_INPUT_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  plusBtn: {
    width: c(42, 38),
    height: c(42, 38),
    borderRadius: c(21, 19),
    backgroundColor: COACH_CHAT_PAGE,
    borderWidth: 1,
    borderColor: COACH_CHAT_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: NU.searchH,
    borderRadius: 99,
    backgroundColor: COACH_CHAT_PAGE,
    borderWidth: 1,
    borderColor: COACH_CHAT_BORDER,
    paddingHorizontal: c(18, 14),
    fontSize: NU.link,
    color: COACH_CHAT_TEAL,
  },
  sendBtn: {
    width: c(46, 42),
    height: c(46, 42),
    borderRadius: c(23, 21),
    backgroundColor: COACH_CHAT_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
