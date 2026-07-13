import type {
  ApiMessage,
  DeleteMessageResponse,
  MessageListQuery,
  MessageListResponse,
  MessageSearchQuery,
  MessageSearchResponse,
  SendMessageRequest,
} from '@/types/message.types';

import { API_CONFIG } from '@/config';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export async function fetchConversationMessages(
  conversationId: string,
  query: MessageListQuery = {},
): Promise<MessageListResponse> {
  const path = ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId);
  const params = {
    limit: query.limit ?? 50,
    ...(query.cursor ? { cursor: query.cursor } : {}),
  };
  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  const url = `${API_CONFIG.BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

  if (__DEV__) {
    console.log('[Messages GET] URL:', url);
  }

  const response = await apiClient.get<MessageListResponse>(path, { params });

  if (__DEV__) {
    console.log('[Messages GET] Response:', response.data);
  }

  return response.data;
}

export async function sendMessage(payload: SendMessageRequest): Promise<ApiMessage> {
  const path = ENDPOINTS.MESSAGES.SEND;
  const url = `${API_CONFIG.BASE_URL}${path}`;

  if (__DEV__) {
    console.log('[Messages POST] URL:', url);
    console.log('[Messages POST] Payload:', payload);
  }

  const response = await apiClient.post<ApiMessage>(path, payload);

  if (__DEV__) {
    console.log('[Messages POST] Response:', response.data);
  }

  return response.data;
}

export async function searchMessages(query: MessageSearchQuery): Promise<MessageSearchResponse> {
  const q = query.q.trim();
  if (!q) {
    return {
      items: [],
      pagination: { total: 0, page: 1, page_size: query.page_size ?? 20, total_pages: 0 },
    };
  }

  const path = ENDPOINTS.MESSAGES.SEARCH;
  const params = {
    q,
    page: query.page ?? 1,
    page_size: query.page_size ?? 20,
    ...(query.conversation_id ? { conversation_id: query.conversation_id } : {}),
    ...(query.provider_id ? { provider_id: query.provider_id } : {}),
  };
  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  const url = `${API_CONFIG.BASE_URL}${path}?${queryString}`;

  if (__DEV__) {
    console.log('[Messages SEARCH] URL:', url);
  }

  const response = await apiClient.get<MessageSearchResponse>(path, { params });

  if (__DEV__) {
    console.log('[Messages SEARCH] Results:', {
      count: response.data.items.length,
      total: response.data.pagination.total,
      query: q,
    });
  }

  return response.data;
}

export async function deleteMessage(messageId: string): Promise<DeleteMessageResponse> {
  if (__DEV__) {
    console.log('📤 Delete message:', { message_id: messageId });
  }

  const response = await apiClient.delete<DeleteMessageResponse>(
    ENDPOINTS.MESSAGES.DELETE(messageId),
  );

  if (__DEV__) {
    console.log('✅ Message deleted:', {
      id: response.data.id,
      is_deleted: response.data.is_deleted,
      deleted_at: response.data.deleted_at,
    });
  }

  return response.data;
}

export async function editMessage(
  messageId: string,
  content: string,
): Promise<ApiMessage> {
  const path = ENDPOINTS.MESSAGES.EDIT(messageId);
  const url = `${API_CONFIG.BASE_URL}${path}`;

  if (__DEV__) {
    console.log('[Messages PATCH] URL:', url);
    console.log('[Messages PATCH] Payload:', { content });
  }

  const response = await apiClient.patch<ApiMessage>(path, { content });
  return response.data;
}
