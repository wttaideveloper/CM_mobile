import { API_CONFIG } from '@/config';
import { SOCKET_SERVER_EVENTS } from '@/constants/socket.events';
import { sendMessage } from '@/services/message.service';
import { getSocket, isSocketConnected } from '@/services/socket/socket.client';
import type { ApiMessage, SendMessageRequest } from '@/types/message.types';

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

/**
 * Send a chat message via POST /api/v1/messages/.
 * Socket is receive-only (`new_message`) — emit-only send was dropping messages
 * when the socket looked connected but delivery failed.
 */
export async function sendMessageViaSocket(payload: SendMessageRequest): Promise<ApiMessage> {
  if (__DEV__) {
    const via =
      API_CONFIG.SOCKET_ENABLED && isSocketConnected()
        ? 'REST (socket up — receive only)'
        : 'REST (socket down / disabled)';
    console.log('[Messages SEND]', via, payload);
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
