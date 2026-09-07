import { useCallback } from 'react';

import type { ChatInboxItem } from '@/constants/chatInbox';
import {
  fetchArchivedConversations,
  fetchConversations,
  searchConversations,
} from '@/services/conversation.service';
import { mapConversationListItemToInbox } from '@/utils/conversation.mapper';

type UseChatInboxLoadersParams = {
  currentUserId: string;
  isArchivedView: boolean;
  setInboxItems: React.Dispatch<React.SetStateAction<ChatInboxItem[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<ChatInboxItem[]>>;
  setArchivedTotal: React.Dispatch<React.SetStateAction<number>>;
  setSearchResults: React.Dispatch<React.SetStateAction<ChatInboxItem[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoadingArchived: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useChatInboxLoaders({
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
}: UseChatInboxLoadersParams) {
  const loadArchivedCount = useCallback(async () => {
    try {
      const response = await fetchArchivedConversations({ page: 1, page_size: 1 });
      setArchivedTotal(response.pagination.total);
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ Archived count failed:', error);
      }
    }
  }, [setArchivedTotal]);

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
  }, [currentUserId, setInboxItems, setIsLoading, setIsRefreshing]);

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
  }, [currentUserId, setArchivedItems, setArchivedTotal, setIsLoadingArchived, setIsRefreshing]);

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
  }, [currentUserId, isArchivedView, setIsSearching, setSearchResults]);

  const handleRefresh = useCallback(async (debouncedSearch: string) => {
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
  }, [
    currentUserId,
    isArchivedView,
    loadArchivedConversations,
    loadArchivedCount,
    runSearch,
    setInboxItems,
    setIsRefreshing,
  ]);

  return {
    loadArchivedCount,
    loadConversations,
    loadArchivedConversations,
    runSearch,
    handleRefresh,
  };
}
