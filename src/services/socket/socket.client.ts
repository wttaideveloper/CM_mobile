import { Platform } from 'react-native';
import { io, type Socket } from 'socket.io-client';

import { API_CONFIG } from '@/config';
import { SOCKET_PATH, SOCKET_SERVER_EVENTS } from '@/constants/socket.events';

let socket: Socket | null = null;
let listenersAttached = false;
let handshakeToken: string | null = null;
let statusCheckTimer: ReturnType<typeof setTimeout> | null = null;
const socketWatchers = new Set<(activeSocket: Socket) => void>();

function notifySocketWatchers(activeSocket: Socket) {
  socketWatchers.forEach((watcher) => watcher(activeSocket));
}

/** Runs now if a socket exists, and again whenever a socket is created. */
export function watchSocket(watcher: (activeSocket: Socket) => void): () => void {
  socketWatchers.add(watcher);
  if (socket) watcher(socket);
  return () => {
    socketWatchers.delete(watcher);
  };
}

function logSocketStatus(reason: string) {
  if (!__DEV__) return;

  const connected = Boolean(socket?.connected);
  console.log('[Socket STATUS]', {
    reason,
    connected,
    enabled: API_CONFIG.SOCKET_ENABLED,
    id: socket?.id ?? null,
    url: API_CONFIG.SOCKET_URL,
    path: SOCKET_PATH,
  });
  console.log(
    connected
      ? `[Socket STATUS] ✅ CONNECTED (${reason}) id=${socket?.id ?? 'n/a'}`
      : `[Socket STATUS] ❌ NOT CONNECTED (${reason})`,
  );
}

function scheduleStatusCheck(reason: string) {
  if (!__DEV__) return;
  if (statusCheckTimer) clearTimeout(statusCheckTimer);
  // Give the handshake a moment after reload / session restore.
  statusCheckTimer = setTimeout(() => {
    logSocketStatus(reason);
  }, 2000);
}

function attachDevListeners(activeSocket: Socket) {
  if (!__DEV__ || listenersAttached) return;

  listenersAttached = true;

  activeSocket.on('connect', () => {
    console.log('[Socket STATUS] ✅ CONNECTED (event: connect)', {
      id: activeSocket.id,
    });
    notifySocketWatchers(activeSocket);
  });

  activeSocket.on('disconnect', (reason) => {
    console.log('[Socket STATUS] ❌ NOT CONNECTED (event: disconnect)', {
      reason,
    });
  });

  activeSocket.on('connect_error', (error) => {
    console.log('[Socket STATUS] ❌ NOT CONNECTED (event: connect_error)', {
      message: error.message,
    });
  });

  activeSocket.io.on('reconnect', (attempt) => {
    console.log('[Socket STATUS] ✅ CONNECTED (event: reconnect)', {
      attempt,
      id: activeSocket.id,
    });
  });

  activeSocket.on(SOCKET_SERVER_EVENTS.ERROR, (payload) => {
    console.log('[Socket STATUS] ❌ socket error event:', payload);
  });
}

export function connectSocket(accessToken: string): Socket | null {
  if (__DEV__) {
    console.log('[Socket STATUS] connectSocket() called', {
      enabled: API_CONFIG.SOCKET_ENABLED,
      url: API_CONFIG.SOCKET_URL,
      path: SOCKET_PATH,
      hasToken: Boolean(accessToken?.trim()),
      alreadyConnected: Boolean(socket?.connected),
    });
  }

  if (!API_CONFIG.SOCKET_ENABLED) {
    if (__DEV__) {
      console.log(
        '[Socket STATUS] ❌ NOT CONNECTED (SOCKET_ENABLED=false)',
      );
    }
    return null;
  }

  const token = accessToken.trim();
  const tokenChanged = handshakeToken !== token;

  if (socket?.connected && !tokenChanged) {
    if (__DEV__) {
      logSocketStatus('already connected — reuse');
    }
    notifySocketWatchers(socket);
    return socket;
  }

  if (socket) {
    socket.auth = { token };
    handshakeToken = token;

    if (socket.connected && tokenChanged) {
      if (__DEV__) {
        console.log('[Socket STATUS] token changed — reconnecting handshake');
      }
      socket.disconnect();
    }

    if (__DEV__) {
      console.log('[Socket STATUS] existing socket — calling connect()…');
    }
    socket.connect();
    attachDevListeners(socket);
    scheduleStatusCheck('2s after reconnect attempt');
    return socket;
  }

  handshakeToken = token;
  socket = io(API_CONFIG.SOCKET_URL, {
    path: SOCKET_PATH,
    auth: { token },
    transports: Platform.OS === 'web' ? ['websocket', 'polling'] : ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    timeout: 20_000,
  });

  attachDevListeners(socket);
  notifySocketWatchers(socket);

  if (__DEV__) {
    console.log('[Socket STATUS] new socket — connecting…', {
      url: API_CONFIG.SOCKET_URL,
      path: SOCKET_PATH,
    });
  }

  scheduleStatusCheck('2s after new connect');
  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;

  socket.disconnect();
  socket = null;
  listenersAttached = false;
  handshakeToken = null;
  if (statusCheckTimer) {
    clearTimeout(statusCheckTimer);
    statusCheckTimer = null;
  }

  if (__DEV__) {
    console.log('[Socket STATUS] ❌ NOT CONNECTED (client cleared / logout)');
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function isSocketConnected(): boolean {
  return Boolean(socket?.connected);
}

/** Dev helper — call anytime to print current socket state. */
export function logCurrentSocketStatus(reason = 'manual check') {
  logSocketStatus(reason);
}
