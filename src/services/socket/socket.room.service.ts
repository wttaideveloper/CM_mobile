import { API_CONFIG } from '@/config';
import { SOCKET_CLIENT_EVENTS } from '@/constants/socket.events';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { getSocket, isSocketConnected } from '@/services/socket/socket.client';
import type { JoinRoomRequest, JoinRoomResponse, LeaveRoomRequest, LeaveRoomResponse } from '@/types/socket.types';

function emitJoinRoom(payload: JoinRoomRequest): void {
  const socket = getSocket();

  if (!socket || !isSocketConnected()) {
    if (__DEV__) {
      console.warn('[Socket JOIN] Socket not connected — skip emit join_room');
    }
    return;
  }

  if (__DEV__) {
    console.log('[Socket JOIN] Emit:', SOCKET_CLIENT_EVENTS.JOIN_ROOM, payload);
  }

  socket.emit(SOCKET_CLIENT_EVENTS.JOIN_ROOM, payload);
}

function emitLeaveRoom(payload: LeaveRoomRequest): void {
  const socket = getSocket();

  if (!socket || !isSocketConnected()) {
    if (__DEV__) {
      console.warn('[Socket LEAVE] Socket not connected — skip emit leave_room');
    }
    return;
  }

  if (__DEV__) {
    console.log('[Socket LEAVE] Emit:', SOCKET_CLIENT_EVENTS.LEAVE_ROOM, payload);
  }

  socket.emit(SOCKET_CLIENT_EVENTS.LEAVE_ROOM, payload);
}

export async function joinConversationRoom(conversationId: string): Promise<JoinRoomResponse | null> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return null;
  }

  const payload: JoinRoomRequest = { conversation_id: conversationId };
  const path = ENDPOINTS.SOCKET_IO.JOIN_ROOM;
  const url = `${API_CONFIG.BASE_URL}${path}`;

  if (__DEV__) {
    console.log('[Socket JOIN] REST URL:', url);
    console.log('[Socket JOIN] REST Payload:', payload);
  }

  try {
    const response = await apiClient.post<JoinRoomResponse>(path, payload);

    if (__DEV__) {
      console.log('[Socket JOIN] REST Response:', response.data);
    }

    if (!response.data.authorized) {
      if (__DEV__) {
        console.warn('[Socket JOIN] Not authorized for room:', response.data);
      }
      return response.data;
    }

    emitJoinRoom(payload);
    return response.data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Socket JOIN] REST failed:', error);
    }

    emitJoinRoom(payload);
    return null;
  }
}

export async function leaveConversationRoom(conversationId: string): Promise<LeaveRoomResponse | null> {
  if (!API_CONFIG.SOCKET_ENABLED) {
    return null;
  }

  const payload: LeaveRoomRequest = { conversation_id: conversationId };
  const path = ENDPOINTS.SOCKET_IO.LEAVE_ROOM;
  const url = `${API_CONFIG.BASE_URL}${path}`;

  if (__DEV__) {
    console.log('[Socket LEAVE] REST URL:', url);
    console.log('[Socket LEAVE] REST Payload:', payload);
  }

  try {
    const response = await apiClient.post<LeaveRoomResponse>(path, payload);

    if (__DEV__) {
      console.log('[Socket LEAVE] REST Response:', response.data);
    }

    emitLeaveRoom(payload);
    return response.data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Socket LEAVE] REST failed:', error);
    }

    emitLeaveRoom(payload);
    return null;
  }
}
 