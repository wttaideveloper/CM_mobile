import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { ChatInboxItem } from '@/constants/chatInbox';
import {
  closeConversation,
  reopenConversation,
  setConversationArchived,
} from '@/services/conversation.service';
import { isConversationClosed } from '@/utils/conversation';

type UseChatInboxActionsParams = {
  isArchivedView: boolean;
  selectedChat: ChatInboxItem | null;
  setIsUpdatingChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setInboxItems: React.Dispatch<React.SetStateAction<ChatInboxItem[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<ChatInboxItem[]>>;
  setSearchResults: React.Dispatch<React.SetStateAction<ChatInboxItem[]>>;
  setArchivedTotal: React.Dispatch<React.SetStateAction<number>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatInboxItem | null>>;
  setMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
  loadConversations: (refresh?: boolean) => Promise<void>;
  applyChatPatch: (chatId: string, patch: Partial<ChatInboxItem>) => void;
};

export function useChatInboxActions({
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
}: UseChatInboxActionsParams) {
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
    [
      isArchivedView,
      loadConversations,
      setArchivedItems,
      setArchivedTotal,
      setInboxItems,
      setIsUpdatingChatId,
      setSearchResults,
      setSelectedChat,
    ],
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
    [applyChatPatch, setIsUpdatingChatId, setSelectedChat],
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

  return {
    performArchiveToggle,
    performCloseToggle,
    handleHeaderArchive,
    handleHeaderCloseToggle,
    selectedChatIsClosed,
  };
}
