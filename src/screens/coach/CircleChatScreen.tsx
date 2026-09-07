import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { CircleChatMessages } from '@/components/coach/CircleChatMessages';
import { CoachChatComposer } from '@/components/coach/CoachChatComposer';
import { CoachChatHeader } from '@/components/coach/CoachChatHeader';
import {
  CIRCLE_CHAT_CONTACT,
  CIRCLE_CHAT_MESSAGES,
  type CircleChatMessage,
} from '@/components/coach/circleChatData';
import {
  COACH_CHAT_GREEN,
  COACH_CHAT_PAGE,
} from '@/components/coach/coachChatData';

function nowLabel() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function CircleChatScreen() {
  const listRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] =
    useState<CircleChatMessage[]>(CIRCLE_CHAT_MESSAGES);

  const sendText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        from: 'me',
        text: trimmed,
        time: nowLabel(),
      },
    ]);
    setDraft('');
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={COACH_CHAT_GREEN} />
      <StatusBarFill lightColor={COACH_CHAT_GREEN} darkColor={COACH_CHAT_GREEN} />
      <CoachChatHeader
        initials={CIRCLE_CHAT_CONTACT.initials}
        name={CIRCLE_CHAT_CONTACT.name}
        status={CIRCLE_CHAT_CONTACT.status}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <CircleChatMessages messages={messages} listRef={listRef} />
        <CoachChatComposer
          value={draft}
          onChangeText={setDraft}
          onSend={() => sendText(draft)}
          onQuickReply={sendText}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COACH_CHAT_PAGE,
  },
  flex: {
    flex: 1,
  },
});
