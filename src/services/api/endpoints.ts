export const ENDPOINTS = {
  AUTH: {
    DEV_TOKEN: '/api/v1/auth/dev-token',
    SIGNUP: '/api/v1/auth/signup',
    LOGIN: '/api/v1/auth/login',
    MOBILE_GOOGLE: '/api/v1/auth/mobile/google',
    MOBILE_FACEBOOK: '/api/v1/auth/mobile/facebook',
    COMPLETE_LOGIN: '/api/v1/auth/complete-login',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    RESEND_VERIFICATION: '/api/v1/auth/resend-verification',
    PASSWORD_REQUIREMENTS: '/api/v1/auth/password-requirements',
    // GET /auth/me — used when session validation is re-enabled (pending sign-out API).
    ME: '/api/v1/auth/me',
    ME_PROFILE: '/api/v1/auth/me/profile',
    REFRESH: '/api/v1/auth/refresh',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    VERIFY_RESET_CODE: '/api/v1/auth/verify-reset-code',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    LOGOUT: '/api/v1/auth/mobile/logout',
    TENANTS: '/api/v1/auth/tenants',
    JOIN_TENANT: '/api/v1/auth/join-tenant',
  },

  ENTERPRISES: {
    GET_ALL: '/api/v1/enterprises/',
    GET_BY_ID: (id: string) => `/api/v1/enterprises/${id}`,
  },

  PRODUCTS: {
    GET_ALL: '/api/v1/products/',
    GET_BY_ID: (id: string) => `/api/v1/products/${id}`,
  },

  CART: {
    GET: '/api/v1/cart/',
    ADD: '/api/v1/cart/',
    CLEAR: '/api/v1/cart/',
    CHECKOUT: '/api/v1/cart/checkout',
    UPDATE_ITEM: (itemId: string) => `/api/v1/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string) => `/api/v1/cart/items/${itemId}`,
  },

  ADDRESSES: {
    GET_ALL: '/api/v1/addresses/',
    CREATE: '/api/v1/addresses/',
  },

  SERVICES: {
    GET_ALL: '/api/v1/services/',
    GET_BY_ID: (id: string) => `/api/v1/services/${id}`,
  },

  TRAININGS: {
    GET_ALL: '/api/v1/trainings/',
    GET_BY_ID: (id: string) => `/api/v1/trainings/${id}`,
    ENROLL: (id: string) => `/api/v1/trainings/${id}/enroll`,
    ENROL: (id: string) => `/api/v1/trainings/${id}/enrol`,
    MY_ENROLMENTS: '/api/v1/trainings/my/enrolments',
    REVIEWS: (id: string) => `/api/v1/trainings/${id}/reviews`,
    MY_WISHLIST: '/api/v1/trainings/my/wishlist',
    ADD_WISHLIST: (id: string) => `/api/v1/trainings/${id}/wishlist`,
    REMOVE_WISHLIST: (id: string) => `/api/v1/trainings/${id}/wishlist`,
    DOWNLOADABLE_LESSONS: (id: string) =>
      `/api/v1/trainings/${id}/lessons/downloadable`,
    DOWNLOAD_LESSON: (id: string, lessonId: string) =>
      `/api/v1/trainings/${id}/lessons/${lessonId}/download`,
    NOTES_PDF: (id: string) => `/api/v1/trainings/${id}/notes.pdf`,
    CONTENT: (id: string) => `/api/v1/trainings/${id}/content`,
  },

  EVENTS: {
    GET_ALL: '/api/v1/events/',
    GET_BY_ID: (id: string) => `/api/v1/events/${id}`,
    REGISTER: (id: string) => `/api/v1/events/${id}/registrations`,
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
    LIST: '/api/v1/users/me/notifications',
    MARK_READ: (notificationId: string) =>
      `/api/v1/users/me/notifications/${encodeURIComponent(notificationId)}/read`,
    MARK_ALL_READ: '/api/v1/users/me/notifications/read-all',
    UNREAD_COUNT: '/api/v1/users/me/notifications/unread-count',
    PREFERENCES: '/api/v1/notifications/preferences',
  },

  WORKFLOWS: {
    LIST: '/api/v1/workflows',
    RESUME: (workflowId: string) => `/api/v1/workflows/${workflowId}/sessions/resume`,
    SAVE_STEP: (sessionId: string, stepId: string) =>
      `/api/v1/workflows/sessions/${sessionId}/steps/${stepId}`,
    COMPLETE: (sessionId: string) => `/api/v1/workflows/sessions/${sessionId}/complete`,
  },
} as const;
