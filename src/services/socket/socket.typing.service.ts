import { API_CONFIG } from '@/config';
import { SOCKET_CLIENT_EVENTS, SOCKET_SERVER_EVENTS } from '@/constants/socket.events';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { getSocket, isSocketConnected, watchSocket } from '@/services/socket/socket.client';
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

function emitClientEvent(event: string, payload: Record<string, unknown>): void {
  const socket = getSocket();
  if (!socket || !isSocketConnected()) {
    if (__DEV__) {
      console.warn(`[Socket ${event}] Socket not connected — skip emit`);
    }
    return;
  }

  if (__DEV__) {
    console.log(`[Socket ${event}] Emit:`, event, payload);
  }

  socket.emit(event, payload);
}

export async function typingStartViaSocket(conversationId: string): Promise<void> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return;
  }

  const payload: SocketTypingRequest = { conversation_id: conversationId };
  if (isSocketConnected()) {
    emitClientEvent(SOCKET_CLIENT_EVENTS.TYPING_START, payload);
    return;
  }

  await postSocketAction('TYPING START', ENDPOINTS.SOCKET_IO.TYPING_START, payload);
}

export async function typingStopViaSocket(conversationId: string): Promise<void> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return;
  }

  const payload: SocketTypingRequest = { conversation_id: conversationId };
  if (isSocketConnected()) {
    emitClientEvent(SOCKET_CLIENT_EVENTS.TYPING_STOP, payload);
    return;
  }

  await postSocketAction('TYPING STOP', ENDPOINTS.SOCKET_IO.TYPING_STOP, payload);
}

export async function markMessageReadViaSocket(
  messageId: string,
  conversationId?: string,
): Promise<void> {
  const payload: MarkReadSocketRequest & { conversation_id?: string } = {
    message_id: messageId,
    ...(conversationId ? { conversation_id: conversationId } : {}),
  };

  if (API_CONFIG.SOCKET_ENABLED && isSocketConnected()) {
    emitClientEvent(SOCKET_CLIENT_EVENTS.MARK_READ, payload);
  }

  await postSocketAction('MARK READ', ENDPOINTS.SOCKET_IO.MARK_READ, payload);
}

export async function markMessageReadViaRest(
  messageId: string,
  conversationId?: string,
): Promise<void> {
  await markMessageReadViaSocket(messageId, conversationId);
}

export type SocketTypingEvent = {
  conversation_id?: string;
  user_id?: string;
  is_typing?: boolean;
};

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function parseSocketTypingEvent(payload: unknown): SocketTypingEvent | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  const nested =
    raw.data && typeof raw.data === 'object'
      ? (raw.data as Record<string, unknown>)
      : raw;

  const conversation_id =
    readString(nested.conversation_id) ??
    readString(nested.conversationId) ??
    readString(raw.conversation_id);
  const user_id =
    readString(nested.user_id) ??
    readString(nested.userId) ??
    readString(raw.user_id);

  const typingFlag = nested.is_typing ?? nested.isTyping ?? raw.is_typing ?? raw.isTyping;
  const is_typing = typeof typingFlag === 'boolean' ? typingFlag : undefined;

  return { conversation_id, user_id, is_typing };
}

export function subscribeToTypingEvents(
  handler: (payload: SocketTypingEvent) => void,
): () => void {
  let bound: ReturnType<typeof getSocket> = null;

  const emitParsed = (eventName: string, payload: unknown, isTypingFallback?: boolean) => {
    if (__DEV__) {
      console.log(`[Socket TYPING] raw ${eventName}:`, payload);
    }

    const parsed = parseSocketTypingEvent(payload);
    if (!parsed) return;

    const event: SocketTypingEvent = {
      ...parsed,
      is_typing: parsed.is_typing ?? isTypingFallback,
    };

    if (__DEV__) {
      console.log(`[Socket TYPING] Event (${eventName}):`, event);
    }

    handler(event);
  };

  const onTyping = (payload: unknown) => emitParsed('typing', payload);
  const onTypingStart = (payload: unknown) => emitParsed('typing_start', payload, true);
  const onTypingStop = (payload: unknown) => emitParsed('typing_stop', payload, false);

  const detach = (socket: NonNullable<ReturnType<typeof getSocket>>) => {
    socket.off(SOCKET_SERVER_EVENTS.TYPING, onTyping);
    socket.off(SOCKET_SERVER_EVENTS.TYPING_START, onTypingStart);
    socket.off(SOCKET_SERVER_EVENTS.TYPING_STOP, onTypingStop);
  };

  const attach = (socket: NonNullable<ReturnType<typeof getSocket>>) => {
    if (bound === socket) return;
    if (bound) detach(bound);
    bound = socket;
    socket.on(SOCKET_SERVER_EVENTS.TYPING, onTyping);
    socket.on(SOCKET_SERVER_EVENTS.TYPING_START, onTypingStart);
    socket.on(SOCKET_SERVER_EVENTS.TYPING_STOP, onTypingStop);
    if (__DEV__) {
      console.log('[Socket TYPING] subscribed', {
        id: socket.id,
        connected: socket.connected,
      });
    }
  };

  const unwatch = watchSocket(attach);

  return () => {
    unwatch();
    if (bound) detach(bound);
    bound = null;
  };
}
