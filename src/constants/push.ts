export const ANDROID_NOTIFICATION_CHANNEL_ID = 'invigorate-health-default';

export const PUSH_NOTIFICATION_TYPES = {
  CHAT_MESSAGE: 'chat_message',
} as const;

export const PUSH_DATA_KEYS = {
  TYPE: 'type',
  /** Preferred key from backend FCM data payload. */
  CONVERSATION_ID: 'conversationId',
} as const;
