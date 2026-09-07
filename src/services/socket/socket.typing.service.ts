import { API_CONFIG } from '@/config';
import { SOCKET_SERVER_EVENTS } from '@/constants/socket.events';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { getSocket } from '@/services/socket/socket.client';
import type {
  MarkReadSocketRequest,
  SocketActionResponse,
  SocketTypingRequest,
} from '@/types/socket.types';

async function postSocketAction(
  label: string,
  path: string,
  payload: Record<string, unknown>,
): Promise<SocketActionResponse | null> {
  const url = `${API_CONFIG.BASE_URL}${path}`;

  if (__DEV__) {
    console.log(`[Socket ${label}] REST URL:`, url);
    console.log(`[Socket ${label}] REST Payload:`, payload);
  }

  try {
    const response = await apiClient.post<SocketActionResponse>(path, payload);

    if (__DEV__) {
      console.log(`[Socket ${label}] REST Response:`, response.data);
    }

    return response.data;
  } catch (error) {
    if (__DEV__) {
      console.warn(`[Socket ${label}] REST failed:`, error);
    }
    return null;
  }
}

export async function typingStartViaSocket(conversationId: string): Promise<void> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return;
  }

  const payload: SocketTypingRequest = { conversation_id: conversationId };
  await postSocketAction('TYPING START', ENDPOINTS.SOCKET_IO.TYPING_START, payload);
}

export async function typingStopViaSocket(conversationId: string): Promise<void> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return;
  }

  const payload: SocketTypingRequest = { conversation_id: conversationId };
  await postSocketAction('TYPING STOP', ENDPOINTS.SOCKET_IO.TYPING_STOP, payload);
}

export async function markMessageReadViaSocket(messageId: string): Promise<void> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return;
  }

  await markMessageReadViaRest(messageId);
}

export async function markMessageReadViaRest(messageId: string): Promise<void> {
  const payload: MarkReadSocketRequest = { message_id: messageId };
  await postSocketAction('MARK READ', ENDPOINTS.SOCKET_IO.MARK_READ, payload);
}

export type SocketTypingEvent = {
  conversation_id?: string;
  user_id?: string;
  is_typing?: boolean;
};

export function parseSocketTypingEvent(payload: unknown): SocketTypingEvent | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload as SocketTypingEvent;
}

export function subscribeToTypingEvents(
  handler: (payload: SocketTypingEvent) => void,
): () => void {
  const socket = getSocket();

  if (!socket) {
    return () => undefined;
  }

  const onTyping = (payload: unknown) => {
    const parsed = parseSocketTypingEvent(payload);
    if (parsed) {
      if (__DEV__) {
        console.log('[Socket TYPING] Event:', parsed);
      }
      handler(parsed);
    }
  };

  socket.on(SOCKET_SERVER_EVENTS.TYPING, onTyping);

  return () => {
    socket.off(SOCKET_SERVER_EVENTS.TYPING, onTyping);
  };
}
