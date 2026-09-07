import * as Linking from 'expo-linking';
import { Alert, StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { normalizeChatLink, splitTextWithLinks } from '@/utils/chatLinks';

type ChatLinkTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  isUser?: boolean;
};

async function openChatLink(url: string): Promise<void> {
  const target = normalizeChatLink(url);
  if (!target) {
    Alert.alert('Unable to open link', 'This link type is not allowed.');
    return;
  }

  try {
    await Linking.openURL(target);
  } catch {
    Alert.alert('Unable to open link', 'Please check the URL and try again.');
  }
}

export function ChatLinkText({ text, style, isUser = false }: ChatLinkTextProps) {
  const parts = splitTextWithLinks(text);
  const hasLinks = parts.some((part) => part.type === 'link');

  if (!hasLinks) {
    return <Text style={style}>{parts[0]?.value ?? ''}</Text>;
  }

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        part.type === 'link' ? (
          <Text
            key={`${part.value}-${index}`}
            style={[styles.link, isUser ? styles.linkUser : styles.linkProvider]}
            onPress={() => void openChatLink(part.value)}
          >
            {part.value}
          </Text>
        ) : (
          part.value
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  linkUser: {
    color: '#B8E6FF',
  },
  linkProvider: {
    color: '#2563EB',
  },
});
