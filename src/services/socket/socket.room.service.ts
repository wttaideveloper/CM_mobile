import { API_CONFIG } from '@/config';
import { SOCKET_CLIENT_EVENTS } from '@/constants/socket.events';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { getSocket, isSocketConnected } from '@/services/socket/socket.client';
import type { JoinRoomRequest, JoinRoomResponse, LeaveRoomRequest, LeaveRoomResponse } from '@/types/socket.types';

function emitJoinRoom(payload: JoinRoomRequest): boolean {
  const socket = getSocket();

  if (!socket || !isSocketConnected()) {
    if (__DEV__) {
      console.warn('[Socket JOIN] Socket not connected — skip emit join_room');
    }
    return false;
  }

  if (__DEV__) {
    console.log('[Socket JOIN] Emit:', SOCKET_CLIENT_EVENTS.JOIN_ROOM, payload);
  }

  socket.emit(SOCKET_CLIENT_EVENTS.JOIN_ROOM, payload);
  return true;
}

function emitLeaveRoom(payload: LeaveRoomRequest): boolean {
  const socket = getSocket();

  if (!socket || !isSocketConnected()) {
    if (__DEV__) {
      console.warn('[Socket LEAVE] Socket not connected — skip emit leave_room');
    }
    return false;
  }

  if (__DEV__) {
    console.log('[Socket LEAVE] Emit:', SOCKET_CLIENT_EVENTS.LEAVE_ROOM, payload);
  }

  socket.emit(SOCKET_CLIENT_EVENTS.LEAVE_ROOM, payload);
  return true;
}

async function joinRoomViaRest(payload: JoinRoomRequest): Promise<JoinRoomResponse | null> {
  const path = ENDPOINTS.SOCKET_IO.JOIN_ROOM;

  if (__DEV__) {
    console.log('[Socket JOIN] REST fallback URL:', `${API_CONFIG.BASE_URL}${path}`);
  }

  try {
    const response = await apiClient.post<JoinRoomResponse>(path, payload);
    if (__DEV__) {
      console.log('[Socket JOIN] REST Response:', response.data);
    }
    return response.data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Socket JOIN] REST failed:', error);
    }
    return null;
  }
}

async function leaveRoomViaRest(payload: LeaveRoomRequest): Promise<LeaveRoomResponse | null> {
  const path = ENDPOINTS.SOCKET_IO.LEAVE_ROOM;

  if (__DEV__) {
    console.log('[Socket LEAVE] REST fallback URL:', `${API_CONFIG.BASE_URL}${path}`);
  }

  try {
    const response = await apiClient.post<LeaveRoomResponse>(path, payload);
    if (__DEV__) {
      console.log('[Socket LEAVE] REST Response:', response.data);
    }
    return response.data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Socket LEAVE] REST failed:', error);
    }
    return null;
  }
}

const pendingLeaves = new Map<string, ReturnType<typeof setTimeout>>();

function roomPayload(conversationId: string): JoinRoomRequest {
  return { conversation_id: conversationId };
}

function cancelPendingLeave(conversationId: string) {
  const pending = pendingLeaves.get(conversationId);
  if (!pending) return;
  clearTimeout(pending);
  pendingLeaves.delete(conversationId);
}

/** join_room with conversation_id (snake_case). Emit on this socket; REST if disconnected. */
export async function joinConversationRoom(conversationId: string): Promise<JoinRoomResponse | null> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return null;
  }

  cancelPendingLeave(conversationId);
  const payload = roomPayload(conversationId);
  const rest = await joinRoomViaRest(payload);
  emitJoinRoom(payload);
  return rest;
}

export async function leaveConversationRoom(conversationId: string): Promise<LeaveRoomResponse | null> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return null;
  }

  cancelPendingLeave(conversationId);

  return new Promise((resolve) => {
    pendingLeaves.set(
      conversationId,
      setTimeout(() => {
        pendingLeaves.delete(conversationId);
        const payload = roomPayload(conversationId);

        if (emitLeaveRoom(payload)) {
          resolve(null);
          return;
        }

        void leaveRoomViaRest(payload).then((rest) => {
          emitLeaveRoom(payload);
          resolve(rest);
        });
      }, 400),
    );
  });
}
