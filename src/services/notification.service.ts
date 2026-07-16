import type {
  NotificationHistoryQuery,
  NotificationHistoryResponse,
  NotificationPreferences,
  NotificationUnreadCountResponse,
  UpdateNotificationPreferencesRequest,
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

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await apiClient.get<NotificationPreferences>(
    ENDPOINTS.NOTIFICATIONS.PREFERENCES,
  );

  if (__DEV__) {
    console.log('[NOTIFICATIONS] Preferences GET ← success', response.data);
  }

  return response.data;
}

export async function updateNotificationPreferences(
  payload: UpdateNotificationPreferencesRequest,
): Promise<NotificationPreferences> {
  const response = await apiClient.put<NotificationPreferences>(
    ENDPOINTS.NOTIFICATIONS.PREFERENCES,
    payload,
  );

  if (__DEV__) {
    console.log('[NOTIFICATIONS] Preferences PUT ← success', response.data);
  }

  return response.data;
}
