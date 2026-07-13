export type NotificationHistoryItem = {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

export type NotificationHistoryQuery = {
  page?: number;
  page_size?: number;
};

export type NotificationHistoryResponse = {
  items: NotificationHistoryItem[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
};

export type NotificationUnreadCountResponse = {
  unread_messages: number;
  unread_notifications: number;
  total_unread: number;
};
