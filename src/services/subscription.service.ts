import type { ChatEligibility } from '@/types/subscription.types';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export async function fetchChatEligibility(): Promise<ChatEligibility> {
  const response = await apiClient.get<ChatEligibility>(ENDPOINTS.SUBSCRIPTIONS.CHAT_ELIGIBILITY);
  return response.data;
}
