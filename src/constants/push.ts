export const ANDROID_NOTIFICATION_CHANNEL_ID = 'invigorate-health-default';

export const PUSH_NOTIFICATION_TYPES = {
  CHAT_MESSAGE: 'chat_message',
} as const;

export const PUSH_DATA_KEYS = {
  TYPE: 'type',
  CATEGORY: 'category',
  /** Preferred key from backend FCM data payload. */
  CONVERSATION_ID: 'conversationId',
  TRAINING_ID: 'training_id',
  ENROLMENT_ID: 'enrolment_id',
  STATUS: 'status',
  ANNOUNCEMENT_ID: 'announcement_id',
  DISCUSSION_ID: 'discussion_id',
  CERTIFICATE_URL: 'certificate_url',
} as const;
