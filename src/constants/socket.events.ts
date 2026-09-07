/** From GET /api/v1/socket-io/events — use these names only. */

/** Backend: Socket.IO at {BASE_URL}/api/socket.io (not /socket.io on port 80) */
export const SOCKET_PATH = '/api/socket.io';

export const SOCKET_CLIENT_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  MARK_READ: 'mark_read',
} as const;

export const SOCKET_SERVER_EVENTS = {
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  TYPING: 'typing',
  CONVERSATION_UPDATED: 'conversation_updated',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  NOTIFICATION: 'notification',
  ERROR: 'error',
} as const;
