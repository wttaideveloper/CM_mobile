import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler } from 'react-native';

import type { ChatInboxItem } from '@/constants/chatInbox';
import { DEV_USER } from '@/constants/devUser';
import { chatHref } from '@/utils/chatNavigation';

import { useChatInboxActions } from '@/hooks/useChatInboxData.actions';
import { useChatInboxLoaders } from '@/hooks/useChatInboxData.loaders';
import {
  type InboxFilter,
  type InboxView,
  INBOX_FILTERS,
} from '@/hooks/useChatInboxData.types';

export type { InboxFilter, InboxView } from '@/hooks/useChatInboxData.types';
export { INBOX_FILTERS } from '@/hooks/useChatInboxData.types';

export function useChatInboxData() {
  const router = useRouter();
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

  const {
    loadArchivedCount,
    loadConversations,
    loadArchivedConversations,
    runSearch,
    handleRefresh: refreshInbox,
  } = useChatInboxLoaders({
    currentUserId,
    isArchivedView,
    setInboxItems,
    setArchivedItems,
    setArchivedTotal,
    setSearchResults,
    setIsLoading,
    setIsLoadingArchived,
    setIsSearching,
    setIsRefreshing,
  });

  const {
    handleHeaderArchive,
    handleHeaderCloseToggle,
    selectedChatIsClosed,
  } = useChatInboxActions({
    isArchivedView,
    selectedChat,
    setIsUpdatingChatId,
    setInboxItems,
    setArchivedItems,
    setSearchResults,
    setArchivedTotal,
    setSelectedChat,
    setMenuVisible,
    loadConversations,
    applyChatPatch,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void runSearch(debouncedSearch);
  }, [debouncedSearch, runSearch]);

  useEffect(() => {
    if (isArchivedView && !debouncedSearch) {
      void loadArchivedConversations(false);
    }
  }, [debouncedSearch, isArchivedView, loadArchivedConversations]);

  const handleRefresh = useCallback(async () => {
    await refreshInbox(debouncedSearch);
  }, [debouncedSearch, refreshInbox]);

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
    // Live conversations load subject/participants from API — params stay IDs/mode only (§6).
    router.push(
      chatHref(item.id, {
        mode: item.mode,
      }),
    );
  };

  const clearSearchState = () => {
    setSearch('');
    setDebouncedSearch('');
    setSearchResults([]);
  };

  const handleBackPress = () => {
    if (isArchivedView) {
      setInboxView('active');
      clearSearchState();
      setSelectedChat(null);
      return;
    }

    router.back();
  };

  const openArchivedView = () => {
    setInboxView('archived');
    setActiveFilter('All');
    clearSearchState();
    setSelectedChat(null);
  };

  return {
    search,
    setSearch,
    debouncedSearch,
    setDebouncedSearch,
    activeFilter,
    setActiveFilter,
    inboxView,
    isArchivedView,
    menuVisible,
    setMenuVisible,
    selectedChat,
    setSelectedChat,
    archivedTotal,
    chats,
    unreadCount,
    groupCount,
    isListLoading,
    isRefreshing,
    isUpdatingChatId,
    selectedChatIsClosed,
    handleRefresh,
    openChat,
    handleBackPress,
    openArchivedView,
    handleHeaderArchive,
    handleHeaderCloseToggle,
  };
}
