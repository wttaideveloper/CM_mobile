import type {
  OnlineUsersResponse,
  PresenceStatus,
  PresenceStatusResponse,
  UpdatePresenceStatusRequest,
} from '@/types/presence.types';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export async function fetchOnlineUsers(): Promise<OnlineUsersResponse> {
  const response = await apiClient.get<OnlineUsersResponse>(ENDPOINTS.PRESENCE.ONLINE);

  if (__DEV__) {
    console.log('✅ Online users:', {
      total: response.data.total,
      count: response.data.users.length,
    });
  }

  return response.data;
}

export async function updatePresenceStatus(status: PresenceStatus): Promise<PresenceStatusResponse> {
  const payload: UpdatePresenceStatusRequest = { status };
  const response = await apiClient.put<PresenceStatusResponse>(ENDPOINTS.PRESENCE.STATUS, payload);

  if (__DEV__) {
    console.log('✅ Presence status updated:', {
      status: response.data.status,
      user_id: response.data.user_id,
    });
  }

  return response.data;
}

export async function fetchUserLastSeen(userId: string): Promise<PresenceStatusResponse> {
  const response = await apiClient.get<PresenceStatusResponse>(ENDPOINTS.PRESENCE.LAST_SEEN(userId));

  if (__DEV__) {
    console.log('✅ User last seen:', {
      user_id: response.data.user_id,
      status: response.data.status,
      last_seen_at: response.data.last_seen_at,
    });
  }

  return response.data;
}
