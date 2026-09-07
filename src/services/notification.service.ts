import { useAuthStore } from '@/stores/auth.store';
import type {
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  NotificationPreferences,
  NotificationUnreadCountResponse,
  UpdateNotificationPreferencesRequest,
  UserNotificationsQuery,
  UserNotificationsResponse,
} from '@/types/notification.types';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

/**
 * User-inbox notification APIs expect both:
 * - Authorization: Bearer <marketplace destin-token>
 * - X-Access-Token: <login access token>
 */
function getUserNotificationHeaders(): Record<string, string> {
  const { accessToken, authAccessToken } = useAuthStore.getState();
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (authAccessToken) {
    headers['X-Access-Token'] = authAccessToken;
  }

  return headers;
}

export async function fetchMyNotifications(
  query: UserNotificationsQuery = {},
): Promise<UserNotificationsResponse> {
  const response = await apiClient.get<UserNotificationsResponse>(
    ENDPOINTS.NOTIFICATIONS.LIST,
    {
      headers: getUserNotificationHeaders(),
      params: {
        page: query.page ?? 1,
        page_size: query.page_size ?? 20,
      },
    },
  );

  if (__DEV__) {
    console.log('[NOTIFICATIONS] List API ← success', {
      status: response.status,
      count: response.data.items.length,
      pagination: response.data.pagination,
      items: response.data.items,
    });
  }

  return response.data;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<MarkNotificationReadResponse> {
  const response = await apiClient.put<MarkNotificationReadResponse>(
    ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId),
    undefined,
    { headers: getUserNotificationHeaders() },
  );

  if (__DEV__) {
    console.log('[NOTIFICATIONS] Mark read API ← success', response.data);
  }

  return response.data;
}

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResponse> {
  const response = await apiClient.put<MarkAllNotificationsReadResponse>(
    ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
    undefined,
    { headers: getUserNotificationHeaders() },
  );

  if (__DEV__) {
    console.log('[NOTIFICATIONS] Mark all read API ← success', response.data);
  }

  return response.data;
}

export async function fetchNotificationUnreadCount(): Promise<NotificationUnreadCountResponse> {
  const response = await apiClient.get<NotificationUnreadCountResponse>(
    ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
    { headers: getUserNotificationHeaders() },
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
