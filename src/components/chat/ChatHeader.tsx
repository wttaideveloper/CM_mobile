import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ChatLiveBadge } from '@/components/chat/ChatExtras';
import { ChatProviderAvatar } from '@/components/chat/ChatProviderAvatar';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const HEADER_BG = '#F6FAF9';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const H_PAD = isSmallDevice ? 16 : 20;

export type ChatHeaderProps = {
  title: string;
  subtitle: string;
  avatarInitial: string;
  isGroup?: boolean;
  isLoadingConversation?: boolean;
  isOnline?: boolean;
  showSearch: boolean;
  backAccessibilityLabel: string;
  showConversationMenu?: boolean;
  showMessageMenu?: boolean;
  /** Group preview: shows ⋮ with no action (matches prior behavior). */
  showInertMenu?: boolean;
  onBack: () => void;
  onToggleSearch: () => void;
  onOpenConversationMenu?: () => void;
  onOpenMessageMenu?: () => void;
  paddingTop?: number;
};

export function ChatHeader({
  title,
  subtitle,
  avatarInitial,
  isGroup,
  isLoadingConversation,
  isOnline,
  showSearch,
  backAccessibilityLabel,
  showConversationMenu,
  showMessageMenu,
  showInertMenu,
  onBack,
  onToggleSearch,
  onOpenConversationMenu,
  onOpenMessageMenu,
  paddingTop = 12,
}: ChatHeaderProps) {
  return (
    <View style={[styles.header, { paddingTop }]}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={backAccessibilityLabel}
      >
        <Ionicons name="arrow-back" size={24} color={TEXT_BLACK} />
      </Pressable>

      <ChatProviderAvatar initial={avatarInitial} isGroup={isGroup} />

      <View style={styles.headerInfo}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {isLoadingConversation ? (
            <ActivityIndicator size="small" color={PRIMARY} style={styles.headerLoader} />
          ) : !isGroup ? (
            <ChatLiveBadge isOnline={Boolean(isOnline)} />
          ) : null}
        </View>
        <Text style={styles.headerSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <Pressable
        onPress={onToggleSearch}
        style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={showSearch ? 'Close search' : 'Search messages'}
      >
        <Ionicons name="search-outline" size={22} color={TEXT_BLACK} />
      </Pressable>

      {showConversationMenu ? (
        <Pressable
          style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
          hitSlop={8}
          onPress={onOpenConversationMenu}
          accessibilityRole="button"
          accessibilityLabel="Conversation options"
        >
          <Ionicons name="ellipsis-vertical" size={22} color={TEXT_BLACK} />
        </Pressable>
      ) : showInertMenu ? (
        <Pressable
          style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Conversation options"
        >
          <Ionicons name="ellipsis-vertical" size={22} color={TEXT_BLACK} />
        </Pressable>
      ) : showMessageMenu ? (
        <Pressable
          style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
          hitSlop={8}
          onPress={onOpenMessageMenu}
          accessibilityRole="button"
          accessibilityLabel="Message options"
        >
          <Ionicons name="ellipsis-vertical" size={22} color={TEXT_BLACK} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 10 : 12,
    backgroundColor: HEADER_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    ...shadowSm,
  },
  backBtn: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, minWidth: 0 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerLoader: { marginLeft: 2 },
  headerTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '800',
    color: TEXT_BLACK,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '500',
    color: TEXT_DESC,
    marginTop: 1,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.9 },
});
