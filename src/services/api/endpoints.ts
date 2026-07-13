export const ENDPOINTS = {
  AUTH: {
    DEV_TOKEN: '/api/v1/auth/dev-token',
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },

  ENTERPRISES: {
    GET_ALL: '/api/v1/enterprises/',
    GET_BY_ID: (id: string) => `/api/v1/enterprises/${id}`,
  },

  PRODUCTS: {
    GET_ALL: '/api/v1/products/',
    GET_BY_ID: (id: string) => `/api/v1/products/${id}`,
  },

  SERVICES: {
    GET_ALL: '/api/v1/services/',
    GET_BY_ID: (id: string) => `/api/v1/services/${id}`,
  },

  SEARCH: {
    ENTERPRISES: '/api/v1/search/enterprises',
    PRODUCTS: '/api/v1/search/products',
    SERVICES: '/api/v1/search/services',
  },

  SUBSCRIPTIONS: {
    CHAT_ELIGIBILITY: '/api/v1/subscriptions/chat-eligibility',
  },

  CONVERSATIONS: {
    LIST: '/api/v1/conversations/',
    SEARCH: '/api/v1/conversations/search',
    CREATE: '/api/v1/conversations/',
    GET_BY_ID: (id: string) => `/api/v1/conversations/${id}`,
    MESSAGES: (id: string) => `/api/v1/conversations/${id}/messages`,
    MARK_READ: (id: string) => `/api/v1/conversations/${id}/read`,
    TYPING: (id: string) => `/api/v1/conversations/${id}/typing`,
    ARCHIVE: (id: string) => `/api/v1/conversations/${id}/archive`,
    ARCHIVED_LIST: '/api/v1/conversations/archived',
    CLOSE: (id: string) => `/api/v1/conversations/${id}/close`,
    REOPEN: (id: string) => `/api/v1/conversations/${id}/reopen`,
  },

  MESSAGES: {
    SEND: '/api/v1/messages/',
    SEARCH: '/api/v1/messages/search',
    DELETE: (id: string) => `/api/v1/messages/${id}`,
    EDIT: (id: string) => `/api/v1/messages/${id}`,
  },

  SOCKET_IO: {
    JOIN_ROOM: '/api/v1/socket-io/join-room',
    LEAVE_ROOM: '/api/v1/socket-io/leave-room',
    SEND_MESSAGE: '/api/v1/socket-io/send-message',
    TYPING_START: '/api/v1/socket-io/typing-start',
    TYPING_STOP: '/api/v1/socket-io/typing-stop',
    MARK_READ: '/api/v1/socket-io/mark-read',
  },

  ATTACHMENTS: {
    UPLOAD: '/api/v1/attachments/upload',
    GET_BY_ID: (id: string) => `/api/v1/attachments/${id}`,
  },

  PRESENCE: {
    ONLINE: '/api/v1/presence/online',
    STATUS: '/api/v1/presence/status',
    LAST_SEEN: (userId: string) => `/api/v1/presence/${userId}/last-seen`,
  },

  DEVICES: {
    REGISTER: '/api/v1/devices/register',
    UNREGISTER: (token: string) => `/api/v1/devices/${encodeURIComponent(token)}`,
  },

  NOTIFICATIONS: {
    HISTORY: '/api/v1/notifications/history',
    UNREAD_COUNT: '/api/v1/notifications/unread-count',
  },
} as const;
