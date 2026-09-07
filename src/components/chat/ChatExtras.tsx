import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AI_CONVERSATION_SUMMARY, AI_MEETING_SUMMARY } from '@/constants/chat';
import { searchMessages } from '@/services/message.service';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const PAGE_BG = '#FFFFFF';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';

type ChatSearchPanelProps = {
  visible: boolean;
  conversationId?: string;
  enabled?: boolean;
  onClose?: () => void;
  onJumpToMessage?: (messageId: string) => void;
};

export function ChatSearchPanel({
  visible,
  conversationId,
  enabled = false,
  onClose,
  onJumpToMessage,
}: ChatSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setDebouncedQuery('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query, visible]);

  useEffect(() => {
    if (!visible || !enabled || !conversationId || !debouncedQuery) return;

    let cancelled = false;

    void searchMessages({
      q: debouncedQuery,
      conversation_id: conversationId,
      page: 1,
      page_size: 20,
    })
      .then((response) => {
        if (cancelled || response.items.length === 0) return;
        onJumpToMessage?.(response.items[0].id);
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn('[Messages SEARCH] Failed:', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, debouncedQuery, enabled, onJumpToMessage, visible]);

  if (!visible) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={TEXT_MUTED} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages"
          placeholderTextColor={TEXT_MUTED}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          autoFocus
          onSubmitEditing={() => setDebouncedQuery(query.trim())}
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => {
              setQuery('');
              setDebouncedQuery('');
            }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            style={styles.clearBtn}
          >
            <Ionicons name="close-circle" size={18} color={TEXT_MUTED} />
          </Pressable>
        ) : onClose ? (
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close search"
            hitSlop={8}
            style={styles.clearBtn}
          >
            <Ionicons name="close" size={20} color={TEXT_MUTED} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ChatAiSummaryCard({ expanded: initial = false }: { expanded?: boolean }) {
  const [expanded, setExpanded] = useState(initial);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      accessibilityRole="button"
      accessibilityLabel="AI Summary"
      accessibilityState={{ expanded }}
      style={styles.aiCard}
    >
      <View style={styles.aiHeader}>
        <Text style={styles.aiBadge}>✨ AI Summary</Text>
        <Text style={styles.aiToggle}>{expanded ? '▲' : '▼'}</Text>
      </View>
      {expanded ? (
        <View style={styles.aiBody}>
          <Text style={styles.aiSectionLabel}>Conversation</Text>
          <Text style={styles.aiText}>{AI_CONVERSATION_SUMMARY}</Text>
          <Text style={styles.aiSectionLabel}>Meeting</Text>
          <Text style={styles.aiText}>{AI_MEETING_SUMMARY}</Text>
        </View>
      ) : (
        <Text style={styles.aiPreview} numberOfLines={1}>{AI_CONVERSATION_SUMMARY}</Text>
      )}
    </Pressable>
  );
}

export function ChatGroupMembers({ members }: { members: string[] }) {
  return (
    <View style={styles.groupRow}>
      <Text style={styles.groupLabel}>Group · {members.length} members</Text>
      <View style={styles.memberAvatars}>
        {members.slice(0, 4).map((name) => (
          <View key={name} style={styles.memberChip}>
            <Text style={styles.memberInitial}>{name.charAt(0)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ChatLoadOlder({ onLoad }: { onLoad?: () => void }) {
  return (
    <Pressable
      onPress={onLoad}
      accessibilityRole="button"
      accessibilityLabel="Load older messages"
      style={styles.loadOlder}
    >
      <Text style={styles.loadOlderText}>↑ Load older messages</Text>
    </Pressable>
  );
}

type ChatLiveBadgeProps = {
  isOnline: boolean;
};

export function ChatLiveBadge({ isOnline }: ChatLiveBadgeProps) {
  return (
    <View style={[styles.presenceBadge, isOnline ? styles.presenceBadgeOnline : styles.presenceBadgeOffline]}>
      <View style={[styles.presenceDot, isOnline ? styles.presenceDotOnline : styles.presenceDotOffline]} />
      <Text style={[styles.presenceText, isOnline ? styles.presenceTextOnline : styles.presenceTextOffline]}>
        {isOnline ? 'Live' : 'Offline'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: PAGE_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F7F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { marginTop: 1 },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: TEXT_BLACK,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  clearBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCard: {
    marginHorizontal: isSmallDevice ? 16 : 20,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 10,
  },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiBadge: { fontSize: 12, fontWeight: '800', color: '#0369A1' },
  aiToggle: { fontSize: 10, color: '#0369A1' },
  aiBody: { marginTop: 8, gap: 6 },
  aiSectionLabel: { fontSize: 10, fontWeight: '700', color: '#0284C7', marginTop: 4 },
  aiText: { fontSize: 12, lineHeight: 18, color: TEXT_DESC },
  aiPreview: { fontSize: 11, color: TEXT_DESC, marginTop: 4 },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: 6,
    backgroundColor: MINT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  groupLabel: { fontSize: 11, fontWeight: '700', color: PRIMARY },
  memberAvatars: { flexDirection: 'row', gap: 4 },
  memberChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  loadOlder: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 4,
  },
  loadOlderText: { fontSize: 12, fontWeight: '700', color: PRIMARY },
  presenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  presenceBadgeOnline: { backgroundColor: '#FEF2F2' },
  presenceBadgeOffline: { backgroundColor: '#F3F4F6' },
  presenceDot: { width: 6, height: 6, borderRadius: 3 },
  presenceDotOnline: { backgroundColor: '#EF4444' },
  presenceDotOffline: { backgroundColor: '#9CA3AF' },
  presenceText: { fontSize: 10, fontWeight: '700' },
  presenceTextOnline: { color: '#B91C1C' },
  presenceTextOffline: { color: '#6B7280' },
});
