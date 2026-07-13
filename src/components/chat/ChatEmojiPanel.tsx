import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { CHAT_EMOJI_CATEGORIES } from '@/constants/chatEmojis';

const PANEL_BG = '#F7F8F7';
const BORDER = '#E5E7EB';
const EMOJI_COLUMNS = 8;
const PANEL_HEIGHT = 280;

type ChatEmojiPanelProps = {
  onEmojiPress: (emoji: string) => void;
  variant?: 'light' | 'dark';
};

export function ChatEmojiPanel({ onEmojiPress, variant = 'light' }: ChatEmojiPanelProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(CHAT_EMOJI_CATEGORIES[0]?.id ?? 'smileys');
  const { width } = useWindowDimensions();
  const isDark = variant === 'dark';

  const activeCategory = useMemo(
    () => CHAT_EMOJI_CATEGORIES.find((category) => category.id === activeCategoryId) ?? CHAT_EMOJI_CATEGORIES[0],
    [activeCategoryId],
  );

  const emojiSize = Math.floor((width - 24) / EMOJI_COLUMNS);

  return (
    <View style={[styles.panel, isDark && styles.panelDark]}>
      <FlatList
        data={activeCategory.emojis}
        keyExtractor={(emoji, index) => `${activeCategory.id}-${emoji}-${index}`}
        numColumns={EMOJI_COLUMNS}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.emojiGrid}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onEmojiPress(item)}
            style={({ pressed }) => [
              styles.emojiCell,
              { width: emojiSize, height: emojiSize },
              pressed && styles.emojiCellPressed,
            ]}
            hitSlop={2}
          >
            <Text style={styles.emoji}>{item}</Text>
          </Pressable>
        )}
      />

      <View style={[styles.tabs, isDark && styles.tabsDark]}>
        {CHAT_EMOJI_CATEGORIES.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <Pressable
              key={category.id}
              onPress={() => setActiveCategoryId(category.id)}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              hitSlop={4}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{category.icon}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const CHAT_EMOJI_PANEL_HEIGHT = PANEL_HEIGHT;

const styles = StyleSheet.create({
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: PANEL_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  panelDark: {
    backgroundColor: '#132A24',
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  emojiGrid: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },
  emojiCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  emojiCellPressed: {
    backgroundColor: 'rgba(31, 93, 78, 0.12)',
  },
  emoji: {
    fontSize: 26,
    lineHeight: 30,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    paddingHorizontal: 4,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  tabsDark: {
    backgroundColor: '#1A3D34',
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tabBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(31, 93, 78, 0.12)',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.72,
  },
  tabIconActive: {
    opacity: 1,
  },
});
