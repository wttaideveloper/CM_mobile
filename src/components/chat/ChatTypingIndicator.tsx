import { StyleSheet, Text, View } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';

const PAGE_BG = '#FFFFFF';
const BORDER = '#E8EDEA';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';

export function ChatTypingIndicator({ name }: { name: string }) {
  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={styles.typingDot} />
          <View style={[styles.typingDot, styles.typingDotMid]} />
          <View style={styles.typingDot} />
        </View>
        <Text style={styles.typingText}>{name} is typing...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  typingRow: { alignItems: 'flex-start', marginTop: 4 },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PAGE_BG,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  typingDots: { flexDirection: 'row', gap: 3 },
  typingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: TEXT_MUTED, opacity: 0.5 },
  typingDotMid: { opacity: 0.85 },
  typingText: { fontSize: 11, fontWeight: '600', color: TEXT_DESC },
});
