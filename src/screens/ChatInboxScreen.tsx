import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import type { ChatMessageStatus } from '@/constants/chat';
import {
  type ChatInboxItem,
} from '@/constants/chatInbox';
import { DEV_USER } from '@/constants/devUser';
import {
  closeConversation,
  fetchArchivedConversations,
  fetchConversations,
  reopenConversation,
  searchConversations,
  setConversationArchived,
} from '@/services/conversation.service';
import { chatHref, createGroupHref } from '@/utils/chatNavigation';
import { isConversationClosed } from '@/utils/conversation';
import { useAuthStore } from '@/stores/auth.store';
import { mapConversationListItemToInbox } from '@/utils/conversation.mapper';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const PAGE_BG = '#FFFFFF';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const CHIP_INACTIVE_BG = '#F3F4F6';
const SEARCH_BG = '#F3F4F6';
const SEARCH_BORDER = '#D1D5DB';
const H_PAD = isSmallDevice ? 16 : 20;

type InboxFilter = 'All' | 'Unread' | 'Favorites' | 'Groups';
type InboxView = 'active' | 'archived';

const INBOX_FILTERS: InboxFilter[] = ['All', 'Unread', 'Favorites', 'Groups'];

function Avatar({ item }: { item: ChatInboxItem }) {
  return (
    <View style={[styles.avatar, item.isGroup && styles.avatarGroup]}>
      {item.isGroup ? (
        <Ionicons name="people" size={22} color={PRIMARY} />
      ) : (
        <Text style={styles.avatarText}>{item.avatarInitial}</Text>
      )}
      {item.isOnline ? <View style={styles.onlineDot} /> : null}
    </View>
  );
}

function InboxReadReceipt({ status }: { status: ChatMessageStatus }) {
  if (status === 'sent') {
    return <Ionicons name="checkmark" size={15} color={TEXT_MUTED} />;
  }

  const tickColor = status === 'read' ? '#53BDEB' : TEXT_MUTED;
  return <Ionicons name="checkmark-done" size={16} color={tickColor} />;
}

function ChatRow({
  item,
  onPress,
  onLongPress,
  selected,
}: {
  item: ChatInboxItem;
  onPress: () => void;
  onLongPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.chatRow,
        selected && styles.chatRowSelected,
        pressed && styles.pressed,
      ]}
    >
      <Avatar item={item} />
      <View style={styles.chatBody}>
        <View style={styles.chatTop}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.chatTime, item.unreadCount > 0 && styles.chatTimeUnread]}>
            {item.timestamp}
          </Text>
        </View>
        <View style={styles.chatBottom}>
          <View style={styles.chatPreviewRow}>
            {item.lastMessageStatus ? (
              <InboxReadReceipt status={item.lastMessageStatus} />
            ) : null}
            <Text style={styles.chatPreview} numberOfLines={1}>
              {isConversationClosed(item.status) ? 'Closed · ' : ''}
              {item.lastMessage}
            </Text>
          </View>
          {isConversationClosed(item.status) ? (
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>Closed</Text>
            </View>
          ) : item.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function FilterChip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
}) {
  const displayLabel = count != null && count > 0 ? `${label} ${count}` : label;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {displayLabel}
      </Text>
    </Pressable>
  );
}

export function ChatInboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // const currentUserId = useAuthStore((state) => state.user?.id ?? DEV_USER.user_id);
  const currentUserId = DEV_USER.user_id;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<InboxFilter>('All');
  const [inboxView, setInboxView] = useState<InboxView>('active');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatInboxItem | null>(null);
  const [inboxItems, setInboxItems] = useState<ChatInboxItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<ChatInboxItem[]>([]);
  const [archivedTotal, setArchivedTotal] = useState(0);
  const [searchResults, setSearchResults] = useState<ChatInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingChatId, setIsUpdatingChatId] = useState<string | null>(null);

  const isArchivedView = inboxView === 'archived';

  const applyChatPatch = useCallback((chatId: string, patch: Partial<ChatInboxItem>) => {
    const merge = (prev: ChatInboxItem[]) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...patch } : chat));

    setInboxItems(merge);
    setArchivedItems(merge);
    setSearchResults(merge);
    setSelectedChat((prev) => (prev?.id === chatId ? { ...prev, ...patch } : prev));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadArchivedCount = useCallback(async () => {
    try {
      const response = await fetchArchivedConversations({ page: 1, page_size: 1 });
      setArchivedTotal(response.pagination.total);
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ Archived count failed:', error);
      }
    }
  }, []);

  const loadConversations = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetchConversations({ page: 1, page_size: 20 });
      setInboxItems(response.items.map((item) => mapConversationListItemToInbox(item, currentUserId)));
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ Conversations list failed:', error);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUserId]);

  const loadArchivedConversations = useCallback(async (refresh = false, searchQuery = '') => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingArchived(true);
    }

    try {
      const response = await fetchArchivedConversations({
        page: 1,
        page_size: 20,
        ...(searchQuery ? { search: searchQuery } : {}),
      });
      setArchivedItems(response.items.map((item) => mapConversationListItemToInbox(item, currentUserId)));
      setArchivedTotal(response.pagination.total);
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ Archived conversations failed:', error);
      }
    } finally {
      setIsLoadingArchived(false);
      setIsRefreshing(false);
    }
  }, [currentUserId]);

  const runSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const response = isArchivedView
        ? await fetchArchivedConversations({ page: 1, page_size: 20, search: q })
        : await searchConversations({ q, page: 1, page_size: 20 });
      setSearchResults(response.items.map((item) => mapConversationListItemToInbox(item, currentUserId)));
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ Conversation search failed:', error);
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentUserId, isArchivedView]);

  useEffect(() => {
    void runSearch(debouncedSearch);
  }, [debouncedSearch, runSearch]);

  useEffect(() => {
    if (isArchivedView && !debouncedSearch) {
      void loadArchivedConversations(false);
    }
  }, [debouncedSearch, isArchivedView, loadArchivedConversations]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (isArchivedView) {
        await loadArchivedConversations(true, debouncedSearch);
      } else if (debouncedSearch) {
        await runSearch(debouncedSearch);
      } else {
        const response = await fetchConversations({ page: 1, page_size: 20 });
        setInboxItems(response.items.map((item) => mapConversationListItemToInbox(item, currentUserId)));
        await loadArchivedCount();
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ Conversations refresh failed:', error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUserId, debouncedSearch, isArchivedView, loadArchivedConversations, loadArchivedCount, runSearch]);

  useFocusEffect(
    useCallback(() => {
      if (isArchivedView) {
        if (!debouncedSearch) {
          void loadArchivedConversations(false);
        }
      } else {
        void loadConversations();
        void loadArchivedCount();
      }
    }, [debouncedSearch, isArchivedView, loadArchivedConversations, loadArchivedCount, loadConversations]),
  );

  useEffect(() => {
    if (!isArchivedView) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setInboxView('active');
      setSearch('');
      setDebouncedSearch('');
      setSearchResults([]);
      return true;
    });

    return () => subscription.remove();
  }, [isArchivedView]);

  const unreadCount = useMemo(
    () => inboxItems.reduce((sum, chat) => sum + chat.unreadCount, 0),
    [inboxItems],
  );
  const groupCount = useMemo(
    () => inboxItems.filter((chat) => chat.isGroup).length,
    [inboxItems],
  );

  const chats = useMemo(() => {
    const list = debouncedSearch
      ? searchResults
      : isArchivedView
        ? archivedItems
        : inboxItems;

    if (isArchivedView || debouncedSearch) {
      return list;
    }

    if (activeFilter === 'Unread') {
      return list.filter((chat) => chat.unreadCount > 0);
    }
    if (activeFilter === 'Favorites') {
      return list.filter((chat) => chat.isFavorite);
    }
    if (activeFilter === 'Groups') {
      return list.filter((chat) => chat.isGroup);
    }

    return list;
  }, [activeFilter, archivedItems, debouncedSearch, inboxItems, isArchivedView, searchResults]);

  const isListLoading = debouncedSearch ? isSearching : isArchivedView ? isLoadingArchived : isLoading;

  const openChat = (item: ChatInboxItem) => {
    setSelectedChat(null);
    router.push(
      chatHref(item.id, {
        mode: item.mode,
        title: item.isGroup ? item.name.replace(' (Group)', '') : item.name,
        provider: item.provider,
        enterprise: item.enterprise,
      }),
    );
  };

  const performArchiveToggle = useCallback(
    async (item: ChatInboxItem) => {
      const archiving = !isArchivedView;

      setIsUpdatingChatId(item.id);
      try {
        await setConversationArchived(item.id, archiving);

        if (archiving) {
          setInboxItems((prev) => prev.filter((chat) => chat.id !== item.id));
          setSearchResults((prev) => prev.filter((chat) => chat.id !== item.id));
          setArchivedTotal((prev) => prev + 1);
        } else {
          setArchivedItems((prev) => prev.filter((chat) => chat.id !== item.id));
          setSearchResults((prev) => prev.filter((chat) => chat.id !== item.id));
          setArchivedTotal((prev) => Math.max(0, prev - 1));
          void loadConversations(true);
        }
        setSelectedChat(null);
      } catch (error) {
        if (__DEV__) {
          console.warn('⚠️ Archive toggle failed:', error);
        }
        Alert.alert(
          archiving ? 'Archive failed' : 'Unarchive failed',
          'Could not update this conversation. Please try again.',
        );
      } finally {
        setIsUpdatingChatId(null);
      }
    },
    [isArchivedView, loadConversations],
  );

  const performCloseToggle = useCallback(
    async (item: ChatInboxItem) => {
      const closing = !isConversationClosed(item.status);

      setIsUpdatingChatId(item.id);
      try {
        const result = closing
          ? await closeConversation(item.id)
          : await reopenConversation(item.id);

        applyChatPatch(item.id, { status: result.status });
        setSelectedChat(null);
      } catch (error) {
        if (__DEV__) {
          console.warn('⚠️ Close/reopen failed:', error);
        }
        Alert.alert(
          closing ? 'Close failed' : 'Reopen failed',
          'Could not update this conversation. Please try again.',
        );
      } finally {
        setIsUpdatingChatId(null);
      }
    },
    [applyChatPatch],
  );

  const requireSelectedChat = (actionLabel: string) => {
    if (!selectedChat) {
      Alert.alert('Select a chat', `Long press a chat to select it, then choose ${actionLabel}.`);
      setMenuVisible(false);
      return null;
    }
    return selectedChat;
  };

  const handleHeaderArchive = () => {
    const item = requireSelectedChat('Archive');
    if (!item) return;

    setMenuVisible(false);
    void performArchiveToggle(item);
  };

  const handleHeaderCloseToggle = () => {
    const item = requireSelectedChat(
      isConversationClosed(selectedChat?.status ?? 'open') ? 'Reopen' : 'Close',
    );
    if (!item) return;

    setMenuVisible(false);
    void performCloseToggle(item);
  };

  const selectedChatIsClosed = selectedChat ? isConversationClosed(selectedChat.status) : false;

  const handleBackPress = () => {
    if (isArchivedView) {
      setInboxView('active');
      setSearch('');
      setDebouncedSearch('');
      setSearchResults([]);
      setSelectedChat(null);
      return;
    }

    router.back();
  };

  const archivedRow = (
    <Pressable
      style={({ pressed }) => [styles.archivedRow, pressed && styles.pressed]}
      onPress={() => {
        setInboxView('archived');
        setActiveFilter('All');
        setSearch('');
        setDebouncedSearch('');
        setSearchResults([]);
        setSelectedChat(null);
      }}
    >
      <View style={styles.archivedIconWrap}>
        <Ionicons name="archive-outline" size={20} color={TEXT_DESC} />
      </View>
      <Text style={styles.archivedLabel}>Archived</Text>
      {archivedTotal > 0 ? <Text style={styles.archivedCount}>{archivedTotal}</Text> : null}
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={handleBackPress}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={TEXT_BLACK} />
          </Pressable>
          <Text style={styles.title}>{isArchivedView ? 'Archived' : 'Chats'}</Text>
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={TEXT_BLACK} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder={isArchivedView ? 'Search archived chats' : 'Search chats'}
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={() => setDebouncedSearch(search.trim())}
          />
        </View>

        {!isArchivedView ? (
          <>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScroll}
            >
              {INBOX_FILTERS.map((filter) => (
                <FilterChip
                  key={filter}
                  label={filter}
                  count={
                    filter === 'Unread'
                      ? unreadCount
                      : filter === 'Groups'
                        ? groupCount
                        : undefined
                  }
                  active={activeFilter === filter}
                  onPress={() => setActiveFilter(filter)}
                />
              ))}
            </ScrollView>
            <View style={styles.chipsDivider} />
          </>
        ) : (
          <View style={styles.chipsDivider} />
        )}
      </View>

      {!isArchivedView ? archivedRow : null}

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatRow
            item={item}
            selected={selectedChat?.id === item.id}
            onPress={() => openChat(item)}
            onLongPress={() => setSelectedChat(item)}
          />
        )}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 88 },
          chats.length === 0 && !isListLoading && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isListLoading ? (
            <ActivityIndicator color={PRIMARY} style={styles.loader} />
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                {isArchivedView ? 'No archived chats' : 'No chats found'}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
      />

      {/* New group FAB — not implemented yet
      {!isArchivedView ? (
        <Pressable
          onPress={() => router.push(createGroupHref())}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 20 },
            pressed && styles.pressed,
          ]}
          accessibilityLabel="New chat"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
      */}

      {isUpdatingChatId ? (
        <View style={styles.archivingOverlay} pointerEvents="none">
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : null}

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuCard, { top: insets.top + 52, right: H_PAD }]}>
            {!isArchivedView ? (
              <>
                <Pressable
                  style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push(createGroupHref());
                  }}
                >
                  <Ionicons name="people-outline" size={20} color={TEXT_BLACK} />
                  <Text style={styles.menuItemText}>New group</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                  onPress={() => setMenuVisible(false)}
                >
                  <Ionicons name="checkmark-done-outline" size={20} color={TEXT_BLACK} />
                  <Text style={styles.menuItemText}>Mark all as read</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                  onPress={() => setMenuVisible(false)}
                >
                  <Ionicons name="settings-outline" size={20} color={TEXT_BLACK} />
                  <Text style={styles.menuItemText}>Chat settings</Text>
                </Pressable>
              </>
            ) : null}
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={handleHeaderArchive}
            >
              <Ionicons
                name={isArchivedView ? 'arrow-undo-outline' : 'archive-outline'}
                size={20}
                color={TEXT_BLACK}
              />
              <Text style={styles.menuItemText}>{isArchivedView ? 'Unarchive' : 'Archive'}</Text>
            </Pressable>
            {selectedChat ? (
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
                onPress={handleHeaderCloseToggle}
              >
                <Ionicons
                  name={selectedChatIsClosed ? 'chatbubble-outline' : 'lock-closed-outline'}
                  size={20}
                  color={TEXT_BLACK}
                />
                <Text style={styles.menuItemText}>
                  {selectedChatIsClosed ? 'Reopen conversation' : 'Close conversation'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  topSection: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SEARCH_BG,
    borderRadius: isSmallDevice ? 8 : 8,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    height: isSmallDevice ? 44 : 48,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  filtersScroll: {
    gap: isSmallDevice ? 8 : 10,
    paddingBottom: isSmallDevice ? 16 : 18,
  },
  chipsDivider: {
    marginHorizontal: -H_PAD,
    borderBottomWidth: 2,
    borderBottomColor: BORDER,
    ...shadowSm,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 8 : 9,
    borderRadius: 20,
    backgroundColor: CHIP_INACTIVE_BG,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '600',
    color: TEXT_DESC,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  listContent: {
    flexGrow: 1,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loader: {
    marginTop: 40,
  },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingVertical: 10,
    backgroundColor: PAGE_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  archivedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CHIP_INACTIVE_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  archivedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
  },
  chatRowSelected: {
    backgroundColor: MINT,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGroup: {
    backgroundColor: '#F0FDF4',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY,
  },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: PAGE_BG,
  },
  chatBody: {
    flex: 1,
    minWidth: 0,
  },
  chatTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  chatTimeUnread: {
    color: PRIMARY,
    fontWeight: '700',
  },
  chatBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatPreviewRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  chatPreview: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DESC,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  closedBadge: {
    borderRadius: 10,
    backgroundColor: CHIP_INACTIVE_BG,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_DESC,
    textTransform: 'uppercase',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: H_PAD + 64,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: H_PAD,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSm,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuCard: {
    position: 'absolute',
    backgroundColor: PAGE_BG,
    borderRadius: 12,
    minWidth: 200,
    paddingVertical: 6,
    ...shadowSm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  pressed: {
    opacity: 0.85,
  },
  archivingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
});
