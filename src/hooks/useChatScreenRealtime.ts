import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { API_CONFIG } from '@/config';
import { SOCKET_SERVER_EVENTS } from '@/constants/socket.events';
import type { ChatMessage } from '@/constants/chat';
import { getSocket } from '@/services/socket/socket.client';
import {
  subscribeToMessageDeletedEvents,
  subscribeToMessageUpdatedEvents,
  subscribeToNewMessageEvents,
} from '@/services/socket/socket.message.service';
import { markMessageReadViaSocket, subscribeToTypingEvents } from '@/services/socket/socket.typing.service';
import type { Conversation } from '@/types/conversation.types';
import { mapApiMessageToChatMessage } from '@/utils/message.mapper';
import { hydrateSingleChatMessageFromApi } from '@/utils/attachment.hydration';

type UseChatScreenRealtimeArgs = {
  conversationId: string;
  currentUserId: string;
  isLiveConversation: boolean;
  otherUserId: string | null;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setApiConversation: Dispatch<SetStateAction<Conversation | null>>;
  setIsOtherUserOnline: (online: boolean) => void;
  refreshOtherPresence: () => void;
};

/**
 * Socket subscriptions for the open chat screen.
 * Use mount/unmount — not focus — so iOS document/image pickers do not
 * unsubscribe and drop the `new_message` event while a file is selected.
 */
export function useChatScreenRealtime({
  conversationId,
  currentUserId,
  isLiveConversation,
  otherUserId,
  setMessages,
  setApiConversation,
  setIsOtherUserOnline,
  refreshOtherPresence,
}: UseChatScreenRealtimeArgs) {
  const [isAnyoneTyping, setIsAnyoneTyping] = useState(false);

  useEffect(() => {
    if (!isLiveConversation || !API_CONFIG.SOCKET_ENABLED) {
      setIsAnyoneTyping(false);
      return undefined;
    }

    const unsubscribeTyping = subscribeToTypingEvents((event) => {
      if (event.conversation_id !== conversationId) return;
      if (event.user_id && event.user_id === currentUserId) return;
      setIsAnyoneTyping(Boolean(event.is_typing));
    });

    return () => {
      unsubscribeTyping();
      setIsAnyoneTyping(false);
    };
  }, [conversationId, currentUserId, isLiveConversation]);

  useEffect(() => {
      if (!isLiveConversation) return undefined;
      if (!API_CONFIG.SOCKET_ENABLED) return undefined;

      const unsubscribeNewMessage = subscribeToNewMessageEvents((apiMessage) => {
        if (apiMessage.conversation_id !== conversationId) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === apiMessage.id)) return prev;
          if (
            apiMessage.attachment_id &&
            prev.some((m) => m.attachmentId === apiMessage.attachment_id)
          ) {
            return prev;
          }

          const mapped = mapApiMessageToChatMessage(apiMessage, currentUserId);
          const withoutPendingOptimistic =
            apiMessage.sender_id === currentUserId
              ? prev.filter(
                  (m) =>
                    !m.id.startsWith('socket-') ||
                    (m.text ?? '').trim() !== (apiMessage.content ?? '').trim(),
                )
              : prev;

          return [...withoutPendingOptimistic, mapped];
        });

        if (apiMessage.attachment_id && !apiMessage.is_deleted) {
          void hydrateSingleChatMessageFromApi(apiMessage, currentUserId)
            .then((hydrated) => {
              setMessages((prev) => prev.map((m) => (m.id === hydrated.id ? hydrated : m)));
            })
            .catch((error) => {
              if (__DEV__) {
                console.warn('[Attachment hydrate] Failed:', error);
              }
            });
        }

        // Mark received messages as read so the other party sees read status quickly.
        if (apiMessage.sender_id !== currentUserId && !apiMessage.is_deleted) {
          void markMessageReadViaSocket(apiMessage.id, conversationId);
        }
      });

      const unsubscribeMessageUpdated = subscribeToMessageUpdatedEvents((apiMessage) => {
        if (apiMessage.conversation_id !== conversationId) return;

        setMessages((prev) => {
          const index = prev.findIndex((m) => m.id === apiMessage.id);
          if (index < 0) return prev;

          const existing = prev[index];
          const mapped = mapApiMessageToChatMessage(apiMessage, currentUserId);
          const next = {
            ...mapped,
            attachment: mapped.attachment ?? existing.attachment,
            voice: mapped.voice ?? existing.voice,
            attachmentId: mapped.attachmentId ?? existing.attachmentId,
            status: mapped.status ?? existing.status,
          };

          if (
            next.text === existing.text &&
            next.messageType === existing.messageType &&
            next.isEdited === existing.isEdited &&
            next.status === existing.status
          ) {
            return prev;
          }

          const copy = [...prev];
          copy[index] = next;
          return copy;
        });
      });

      const unsubscribeMessageDeleted = subscribeToMessageDeletedEvents((event) => {
        if (event.conversationId !== conversationId) return;

        setMessages((prev) => {
          let changed = false;
          const next = prev.map((message) => {
            if (message.id !== event.messageId || message.messageType === 'deleted') {
              return message;
            }
            changed = true;
            return {
              ...message,
              messageType: 'deleted' as const,
              text: 'This message was deleted',
              attachment: undefined,
              voice: undefined,
            };
          });
          return changed ? next : prev;
        });
      });

      const onMessageRead = (payload: unknown) => {
        if (__DEV__) {
          console.log('[mobile] message_read raw', payload);
        }

        if (!payload || typeof payload !== 'object') return;

        const obj = payload as Record<string, unknown>;
        const messageId =
          typeof obj.message_id === 'string'
            ? obj.message_id
            : typeof (obj as { message?: { id?: unknown } }).message?.id === 'string'
              ? (obj as { message?: { id?: unknown } }).message?.id
              : null;
        const userId = typeof obj.user_id === 'string' ? obj.user_id : null;

        if (!messageId || !userId) return;

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;

            // Only update read receipts for messages you sent (outgoing).
            // message_read payload user_id = who read the message.
            if (m.sender !== 'user') return m;
            if (userId === currentUserId) return m; // I'm the reader => don't affect my outgoing bubble.

            return { ...m, status: 'read' };
          }),
        );
      };

      const onConversationUpdated = (payload: unknown) => {
        if (!payload || typeof payload !== 'object') return;

        const obj = payload as Record<string, unknown>;
        const maybeConversation =
          obj.conversation ?? (obj as { data?: { conversation?: unknown } }).data?.conversation ?? obj;

        if (
          maybeConversation &&
          typeof maybeConversation === 'object' &&
          typeof (maybeConversation as { id?: unknown }).id === 'string'
        ) {
          // Socket payload may be partial (e.g. missing `participants`).
          // Keep existing `participants`/known fields when missing.
          setApiConversation((prev) => {
            if (!prev) return maybeConversation as Conversation;
            const partial = maybeConversation as Partial<Conversation>;
            return {
              ...prev,
              ...partial,
              participants: partial.participants ?? prev.participants,
            };
          });
        }
      };

      const onUserOnline = (payload: unknown) => {
        if (!payload || typeof payload !== 'object') return;
        const obj = payload as Record<string, unknown>;
        const userId = typeof obj.user_id === 'string' ? obj.user_id : null;
        if (!userId || userId !== otherUserId) return;
        setIsOtherUserOnline(true);
      };

      const onUserOffline = (payload: unknown) => {
        if (!payload || typeof payload !== 'object') return;
        const obj = payload as Record<string, unknown>;
        const userId = typeof obj.user_id === 'string' ? obj.user_id : null;
        if (!userId || userId !== otherUserId) return;
        setIsOtherUserOnline(false);
        void refreshOtherPresence();
      };

      const onSocketError = (payload: unknown) => {
        // Keep UI stable; just log socket validation/auth errors.
        if (__DEV__) {
          console.warn('[Socket ERROR event]', payload);
        }
      };

      const socket = getSocket();
      if (!socket) {
        return () => {
          unsubscribeNewMessage();
          unsubscribeMessageUpdated();
          unsubscribeMessageDeleted();
        };
      }

      socket.on(SOCKET_SERVER_EVENTS.MESSAGE_READ, onMessageRead);
      socket.on(SOCKET_SERVER_EVENTS.CONVERSATION_UPDATED, onConversationUpdated);
      socket.on(SOCKET_SERVER_EVENTS.USER_ONLINE, onUserOnline);
      socket.on(SOCKET_SERVER_EVENTS.USER_OFFLINE, onUserOffline);
      socket.on(SOCKET_SERVER_EVENTS.ERROR, onSocketError);

      return () => {
        unsubscribeNewMessage();
        unsubscribeMessageUpdated();
        unsubscribeMessageDeleted();
        socket.off(SOCKET_SERVER_EVENTS.MESSAGE_READ, onMessageRead);
        socket.off(SOCKET_SERVER_EVENTS.CONVERSATION_UPDATED, onConversationUpdated);
        socket.off(SOCKET_SERVER_EVENTS.USER_ONLINE, onUserOnline);
        socket.off(SOCKET_SERVER_EVENTS.USER_OFFLINE, onUserOffline);
        socket.off(SOCKET_SERVER_EVENTS.ERROR, onSocketError);
      };
    }, [
      conversationId,
      currentUserId,
      isLiveConversation,
      otherUserId,
      refreshOtherPresence,
      setApiConversation,
      setIsOtherUserOnline,
      setMessages,
    ]);

  return { isAnyoneTyping };
}
