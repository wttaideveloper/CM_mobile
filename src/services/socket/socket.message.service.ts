import { API_CONFIG } from '@/config';
import { SOCKET_SERVER_EVENTS } from '@/constants/socket.events';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { getSocket, watchSocket } from '@/services/socket/socket.client';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiMessage, SendMessageRequest } from '@/types/message.types';
import type { SendMessageSocketRequest, SocketActionResponse } from '@/types/socket.types';

function readConversationId(value: object): string | undefined {
  const raw = value as Record<string, unknown>;
  const id = raw.conversation_id ?? raw.conversationId;
  return typeof id === 'string' && id.trim() ? id : undefined;
}

function isApiMessage(value: unknown): value is ApiMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiMessage>;
  return (
    typeof candidate.id === 'string' &&
    Boolean(readConversationId(candidate)) &&
    typeof candidate.sender_id === 'string' &&
    (typeof candidate.content === 'string' || candidate.content == null)
  );
}

function findApiMessageInPayload(data: unknown): ApiMessage | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (isApiMessage(data)) {
    return { ...data, conversation_id: readConversationId(data) ?? data.conversation_id };
  }

  for (const value of Object.values(data as Record<string, unknown>)) {
    if (isApiMessage(value)) {
      return { ...value, conversation_id: readConversationId(value) ?? value.conversation_id };
    }

    if (value && typeof value === 'object') {
      const nested = findApiMessageInPayload(value);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

/**
 * Live send: REST POST /api/v1/socket-io/send-message.
 * Backend broadcasts new_message to conversation:{id} from this route.
 * Do not use POST /api/v1/messages/ (persist only, no live emit).
 * Do not rely on socket.emit('send_message') — it is not reaching the room.
 */
export async function sendMessageViaSocket(payload: SendMessageRequest): Promise<ApiMessage> {
  const socketPayload: SendMessageSocketRequest = {
    conversation_id: payload.conversation_id,
    content: payload.content,
    message_type: payload.message_type,
    ...(payload.attachment_id ? { attachment_id: payload.attachment_id } : {}),
  };

  await useAuthStore.getState().ensureAccessToken(false);
  return sendMessageViaSocketRest(socketPayload);
}

function buildOptimisticMessage(payload: SendMessageSocketRequest): ApiMessage {
  return {
    id: `socket-${Date.now()}`,
    conversation_id: payload.conversation_id,
    sender_id: useAuthStore.getState().user?.id ?? '',
    content: payload.content,
    message_type: payload.message_type,
    attachment_id: payload.attachment_id ?? null,
    is_deleted: false,
    created_at: new Date().toISOString(),
    read_by: [],
  };
}

async function sendMessageViaSocketRest(payload: SendMessageSocketRequest): Promise<ApiMessage> {
  const path = ENDPOINTS.SOCKET_IO.SEND_MESSAGE;

  if (__DEV__) {
    console.log('[Messages SEND] REST socket-io/send-message', payload);
  }

  const response = await apiClient.post<SocketActionResponse | ApiMessage>(path, payload);

  if (__DEV__) {
    console.log('[Messages SEND] REST socket-io/send-message response', response.data);
  }

  const message = findApiMessageInPayload(response.data);

  if (message) {
    return message;
  }

  return buildOptimisticMessage(payload);
}

export function subscribeToNewMessageEvents(
  handler: (message: ApiMessage) => void,
): () => void {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return () => undefined;
  }

  let bound: ReturnType<typeof getSocket> = null;

  const onNewMessage = (payload: unknown) => {
    if (__DEV__) {
      console.log('[mobile] new_message raw', payload);
    }

    const message = findApiMessageInPayload(payload);
    if (!message) {
      if (__DEV__) {
        console.log('[Socket NEW_MESSAGE] Unhandled payload shape');
      }
      return;
    }

    handler(message);
  };

  const attach = (socket: NonNullable<ReturnType<typeof getSocket>>) => {
    if (bound === socket) return;
    bound?.off(SOCKET_SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
    bound = socket;
    socket.on(SOCKET_SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
    if (__DEV__) {
      console.log('[Socket NEW_MESSAGE] subscribed', {
        id: socket.id,
        connected: socket.connected,
      });
    }
  };

  const unwatch = watchSocket(attach);

  return () => {
    unwatch();
    bound?.off(SOCKET_SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
    bound = null;
  };
}

export type MessageDeletedSocketEvent = {
  conversationId: string;
  messageId: string;
};

function readMessageDeletedEvent(data: unknown): MessageDeletedSocketEvent | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const raw = data as Record<string, unknown>;
  const conversationId = readConversationId(raw);
  const nestedMessage = raw.message && typeof raw.message === 'object'
    ? (raw.message as Record<string, unknown>)
    : null;
  const messageIdRaw = raw.message_id ?? raw.messageId ?? nestedMessage?.id;
  const messageId = typeof messageIdRaw === 'string' && messageIdRaw.trim() ? messageIdRaw : null;
  const nestedConversationId = nestedMessage ? readConversationId(nestedMessage) : undefined;

  if (!messageId) {
    return null;
  }

  const resolvedConversationId = conversationId ?? nestedConversationId;
  if (!resolvedConversationId) {
    return null;
  }

  return { conversationId: resolvedConversationId, messageId };
}

export function subscribeToMessageUpdatedEvents(
  handler: (message: ApiMessage) => void,
): () => void {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return () => undefined;
  }

  let bound: ReturnType<typeof getSocket> = null;

  const onMessageUpdated = (payload: unknown) => {
    if (__DEV__) {
      console.log('[mobile] message_updated raw', payload);
    }

    const message = findApiMessageInPayload(payload);
    if (!message) {
      if (__DEV__) {
        console.log('[Socket MESSAGE_UPDATED] Unhandled payload shape');
      }
      return;
    }

    const envelopeId =
      payload && typeof payload === 'object' ? readConversationId(payload as object) : undefined;
    handler({
      ...message,
      conversation_id: envelopeId ?? message.conversation_id,
    });
  };

  const attach = (socket: NonNullable<ReturnType<typeof getSocket>>) => {
    if (bound === socket) return;
    bound?.off(SOCKET_SERVER_EVENTS.MESSAGE_UPDATED, onMessageUpdated);
    bound = socket;
    socket.on(SOCKET_SERVER_EVENTS.MESSAGE_UPDATED, onMessageUpdated);
    if (__DEV__) {
      console.log('[Socket MESSAGE_UPDATED] subscribed', {
        id: socket.id,
        connected: socket.connected,
      });
    }
  };

  const unwatch = watchSocket(attach);

  return () => {
    unwatch();
    bound?.off(SOCKET_SERVER_EVENTS.MESSAGE_UPDATED, onMessageUpdated);
    bound = null;
  };
}

export function subscribeToMessageDeletedEvents(
  handler: (event: MessageDeletedSocketEvent) => void,
): () => void {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return () => undefined;
  }

  let bound: ReturnType<typeof getSocket> = null;

  const onMessageDeleted = (payload: unknown) => {
    if (__DEV__) {
      console.log('[mobile] message_deleted raw', payload);
    }

    const event = readMessageDeletedEvent(payload);
    if (!event) {
      if (__DEV__) {
        console.log('[Socket MESSAGE_DELETED] Unhandled payload shape');
      }
      return;
    }

    handler(event);
  };

  const attach = (socket: NonNullable<ReturnType<typeof getSocket>>) => {
    if (bound === socket) return;
    bound?.off(SOCKET_SERVER_EVENTS.MESSAGE_DELETED, onMessageDeleted);
    bound = socket;
    socket.on(SOCKET_SERVER_EVENTS.MESSAGE_DELETED, onMessageDeleted);
    if (__DEV__) {
      console.log('[Socket MESSAGE_DELETED] subscribed', {
        id: socket.id,
        connected: socket.connected,
      });
    }
  };

  const unwatch = watchSocket(attach);

  return () => {
    unwatch();
    bound?.off(SOCKET_SERVER_EVENTS.MESSAGE_DELETED, onMessageDeleted);
    bound = null;
  };
}
