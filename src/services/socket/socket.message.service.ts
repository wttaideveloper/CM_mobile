import { API_CONFIG } from '@/config';
import { DEV_USER } from '@/constants/devUser';
import { SOCKET_CLIENT_EVENTS, SOCKET_SERVER_EVENTS } from '@/constants/socket.events';
import { sendMessage } from '@/services/message.service';
import { useAuthStore } from '@/stores/auth.store';
import { getSocket, isSocketConnected } from '@/services/socket/socket.client';
import type { ApiMessage, SendMessageRequest } from '@/types/message.types';
import type { SendMessageSocketRequest } from '@/types/socket.types';

function isApiMessage(value: unknown): value is ApiMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiMessage>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.conversation_id === 'string' &&
    typeof candidate.sender_id === 'string' &&
    (typeof candidate.content === 'string' || candidate.content == null)
  );
}

function findApiMessageInPayload(data: unknown): ApiMessage | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  if (isApiMessage(data)) {
    return data;
  }

  for (const value of Object.values(data as Record<string, unknown>)) {
    if (isApiMessage(value)) {
      return value;
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

function buildMessageFromRequest(payload: SendMessageRequest): ApiMessage {
  const senderId = useAuthStore.getState().user?.id ?? DEV_USER.user_id;

  return {
    id: `socket-${Date.now()}`,
    conversation_id: payload.conversation_id,
    sender_id: senderId,
    content: payload.content,
    message_type: payload.message_type,
    attachment_id: payload.attachment_id ?? null,
    is_deleted: false,
    created_at: new Date().toISOString(),
    read_by: [],
  };
}

function toSocketPayload(payload: SendMessageRequest): SendMessageSocketRequest {
  return {
    content: payload.content,
    conversation_id: payload.conversation_id,
    message_type: payload.message_type,
    ...(payload.attachment_id ? { attachment_id: payload.attachment_id } : {}),
  };
}

function emitSendMessage(payload: SendMessageSocketRequest): void {
  const socket = getSocket();

  if (!socket || !isSocketConnected()) {
    if (__DEV__) {
      console.warn('[Socket SEND] Socket not connected — skip emit send_message');
    }
    return;
  }

  if (__DEV__) {
    console.log('[Socket SEND] Emit:', SOCKET_CLIENT_EVENTS.SEND_MESSAGE, payload);
  }

  socket.emit(SOCKET_CLIENT_EVENTS.SEND_MESSAGE, payload);
}

export async function sendMessageViaSocket(payload: SendMessageRequest): Promise<ApiMessage> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return sendMessage(payload);
  }

  const socketPayload = toSocketPayload(payload);

  // Live chat: emit only. REST /socket-io/send-message is a Swagger mirror and must not
  // be combined with emit — that creates duplicate messages on the server.
  if (isSocketConnected()) {
    emitSendMessage(socketPayload);
    return buildMessageFromRequest(payload);
  }

  if (__DEV__) {
    console.warn('[Socket SEND] Socket not connected — fallback to REST /messages');
  }

  return sendMessage(payload);
}

export function subscribeToNewMessageEvents(
  handler: (message: ApiMessage) => void,
): () => void {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return () => undefined;
  }

  const activeSocket = getSocket();
  if (!activeSocket) {
    return () => undefined;
  }

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

  activeSocket.on(SOCKET_SERVER_EVENTS.NEW_MESSAGE, onNewMessage);

  return () => {
    activeSocket.off(SOCKET_SERVER_EVENTS.NEW_MESSAGE, onNewMessage);
  };
}
