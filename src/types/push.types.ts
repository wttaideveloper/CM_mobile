import type { PUSH_NOTIFICATION_TYPES } from '@/constants/push';

export type PushPlatform = 'ios' | 'android';

export type PushNotificationType =
  (typeof PUSH_NOTIFICATION_TYPES)[keyof typeof PUSH_NOTIFICATION_TYPES];

export type PushNotificationData = {
  type?: PushNotificationType | string;
  conversationId?: string;
};

export type RegisterDeviceRequest = {
  token: string;
  platform: PushPlatform;
};

export type RegisterDeviceResponse = {
  id: string;
  token: string;
  platform: PushPlatform;
  is_active: boolean;
  created_at: string;
};
