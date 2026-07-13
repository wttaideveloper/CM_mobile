import { Platform } from 'react-native';
import { io, type Socket } from 'socket.io-client';

import { API_CONFIG } from '@/config';
import { SOCKET_PATH, SOCKET_SERVER_EVENTS } from '@/constants/socket.events';

let socket: Socket | null = null;
let listenersAttached = false;

function attachDevListeners(activeSocket: Socket) {
  if (!__DEV__ || listenersAttached) return;

  listenersAttached = true;

  activeSocket.on('connect', () => {
    console.log('✅ Socket connected:', activeSocket.id);
  });

  activeSocket.on('disconnect', (reason) => {
    console.log('⚠️ Socket disconnected:', reason);
  });

  activeSocket.on('connect_error', (error) => {
    console.log('❌ Socket connect_error:', error.message);
  });

  activeSocket.io.on('reconnect', (attempt) => {
    console.log('🔁 Socket reconnected after attempt:', attempt);
  });

  activeSocket.on(SOCKET_SERVER_EVENTS.ERROR, (payload) => {
    console.log('❌ Socket error event:', payload);
  });
}

export function connectSocket(accessToken: string): Socket | null {
  // Force bundle refresh marker: SOCKET_V2
  if (__DEV__) {
    console.log(
      '🔌 SOCKET_V2 config → enabled:',
      API_CONFIG.SOCKET_ENABLED,
      'url:',
      API_CONFIG.SOCKET_URL,
      'path:',
      SOCKET_PATH,
    );
  }

  if (!API_CONFIG.SOCKET_ENABLED) {
    if (__DEV__) {
      console.log('🔌 SOCKET_V2 disabled — set SOCKET_ENABLED: true in src/config/index.ts');
    }
    return null;
  }

  if (socket?.connected) {
    socket.auth = { token: accessToken };
    return socket;
  }

  if (socket) {
    socket.auth = { token: accessToken };
    socket.connect();
    attachDevListeners(socket);
    return socket;
  }

  socket = io(API_CONFIG.SOCKET_URL, {
    path: SOCKET_PATH,
    auth: { token: accessToken },
    transports: Platform.OS === 'web' ? ['websocket', 'polling'] : ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    timeout: 20_000,
  });

  attachDevListeners(socket);

  if (__DEV__) {
    console.log('🔌 Socket connecting to', API_CONFIG.SOCKET_URL, SOCKET_PATH);
  }

  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;

  socket.disconnect();
  socket = null;
  listenersAttached = false;

  if (__DEV__) {
    console.log('🔌 Socket disconnected (client cleared)');
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function isSocketConnected(): boolean {
  return Boolean(socket?.connected);
}
