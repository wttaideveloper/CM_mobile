export type UserNotificationItem = {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: string | null;
  delivered_at?: string | null;
  title: string;
  message: string;
  notification_type: string;
  category?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

export type UserNotificationsQuery = {
  page?: number;
  page_size?: number;
};

export type UserNotificationsResponse = {
  items: UserNotificationItem[];
  pagination: {
    total?: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
    [key: string]: unknown;
  };
};

export type MarkNotificationReadResponse = {
  id: string;
  is_read: boolean;
  read_at?: string | null;
};

export type MarkAllNotificationsReadResponse = {
  marked_read: number;
};

export type NotificationUnreadCountResponse = {
  unread_count: number;
};

export type NotificationPreferences = {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  sms_phone_number?: string | null;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  updated_at?: string | null;
};

export type UpdateNotificationPreferencesRequest = Partial<{
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  sms_phone_number: string;
}>;
