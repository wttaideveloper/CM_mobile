import { DEV_USER } from '@/constants/devUser';
import type { DevTokenResponse } from '@/types/auth.types';

import { authDevClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export async function fetchDevToken(): Promise<DevTokenResponse> {
  const response = await authDevClient.post<DevTokenResponse>(ENDPOINTS.AUTH.DEV_TOKEN, {
    email: DEV_USER.email,
    role: DEV_USER.role,
    user_id: DEV_USER.user_id,
  });

  return response.data;
}
