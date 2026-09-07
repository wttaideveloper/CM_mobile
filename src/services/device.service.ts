import type { RegisterDeviceRequest, RegisterDeviceResponse } from '@/types/push.types';
import { pushError, pushLog } from '@/utils/pushLog';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export async function registerDevice(
  payload: RegisterDeviceRequest,
): Promise<RegisterDeviceResponse> {
  pushLog('Register API → POST /api/v1/devices/register', payload);

  try {
    const response = await apiClient.post<RegisterDeviceResponse>(
      ENDPOINTS.DEVICES.REGISTER,
      payload,
    );

    pushLog('Register API ← success', {
      status: response.status,
      id: response.data.id,
      platform: response.data.platform,
      is_active: response.data.is_active,
      created_at: response.data.created_at,
      tokenPreview: previewToken(response.data.token),
    });

    return response.data;
  } catch (error) {
    pushError('Register API ← failed', error);
    throw error;
  }
}

export async function unregisterDevice(token: string): Promise<void> {
  const path = ENDPOINTS.DEVICES.UNREGISTER(token);

  pushLog('Unregister API → DELETE /api/v1/devices/{token}', {
    path,
    tokenPreview: previewToken(token),
  });

  try {
    const response = await apiClient.delete<string>(path);

    pushLog('Unregister API ← success', {
      status: response.status,
      data: response.data,
    });
  } catch (error) {
    pushError('Unregister API ← failed', error);
    throw error;
  }
}

function previewToken(token: string): string {
  if (token.length <= 16) return token;
  return `${token.slice(0, 8)}…${token.slice(-8)}`;
}
