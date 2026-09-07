export const API_CONFIG = {
  /** Primary API host for all non-auth endpoints */
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://chat.wisdomtooth.tech',
  /** Signup, login, refresh — native/external-user auth */
  AUTH_BASE_URL:
    process.env.EXPO_PUBLIC_AUTH_BASE_URL ??
    'https://admin.apis.invigor8.app',
  /**
   * Deep link that receives he_session_code after Google/Facebook OAuth.
   * API docs default: com.mobile://oauth (must be in FRONTEND_ORIGINS).
   */
  OAUTH_FRONTEND_ORIGIN:
    process.env.EXPO_PUBLIC_OAUTH_FRONTEND_ORIGIN ?? 'invigoratehealth://oauth',
  /** Published workflow definitions for mobile checkout / forms */
  WORKFLOW_BASE_URL:
    process.env.EXPO_PUBLIC_WORKFLOW_BASE_URL ?? 'https://workflow.apis.invigor8.app',
  /** Same host as REST; path is /api/socket.io */
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'https://chat.wisdomtooth.tech',
  /**
   * Socket tries http://13.207.85.164/api/socket.io (backend-provided path).
   * Currently returns xhr poll error (path not live yet). Keep false until Shree confirms.
   */
  SOCKET_ENABLED: true,
  /** REST typing poll — only when SOCKET_ENABLED is false; set EXPO_PUBLIC_TYPING_GET_ENABLED=true */
  TYPING_GET_ENABLED: process.env.EXPO_PUBLIC_TYPING_GET_ENABLED === 'true',
  /** REST typing PUT — only when SOCKET_ENABLED is false; set EXPO_PUBLIC_TYPING_PUT_ENABLED=true */
  TYPING_PUT_ENABLED: process.env.EXPO_PUBLIC_TYPING_PUT_ENABLED === 'true',
  TYPING_POLL_INTERVAL_MS: 10_000,
  TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30_000,
} as const;
    