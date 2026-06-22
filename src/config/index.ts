export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://13.234.20.243:8000',
  TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30_000,
} as const;
