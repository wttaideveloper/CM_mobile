import type {
  NotificationHistoryQuery,
  NotificationHistoryResponse,
  NotificationUnreadCountResponse,
} from '@/types/notification.types';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export async function fetchNotificationHistory(
  query: NotificationHistoryQuery = {},
): Promise<NotificationHistoryResponse> {
  const response = await apiClient.get<NotificationHistoryResponse>(
    ENDPOINTS.NOTIFICATIONS.HISTORY,
    {
      params: {
        page: query.page ?? 1,
        page_size: query.page_size ?? 20,
      },
    },
  );

  if (__DEV__) {
    console.log('[NOTIFICATIONS] History API ← success', {
      status: response.status,
      count: response.data.items.length,
      pagination: response.data.pagination,
      items: response.data.items,
    });
  }

  return response.data;
}

export async function fetchNotificationUnreadCount(): Promise<NotificationUnreadCountResponse> {
  const response = await apiClient.get<NotificationUnreadCountResponse>(
    ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
  );

  if (__DEV__) {
    console.log('[NOTIFICATIONS] Unread count API ← success', {
      status: response.status,
      ...response.data,
    });
  }

  return response.data;
}
