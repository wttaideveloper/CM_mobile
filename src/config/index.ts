export const API_CONFIG = {
  /** Primary API host for all non-auth endpoints */
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://13.207.85.164',
  /** Signup, login, refresh — native/external-user auth */
  AUTH_BASE_URL:
    process.env.EXPO_PUBLIC_AUTH_BASE_URL ??
    'https://p6wvqog202.execute-api.us-east-1.amazonaws.com',
  /** Same host as REST; path is /api/socket.io */
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://13.207.85.164',
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
    