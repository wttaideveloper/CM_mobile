import { DEV_PROVIDER, DEV_USER } from '@/constants/devUser';
import { API_CONFIG } from '@/config';
import { useAuthStore } from '@/stores/auth.store';
import type {
  ArchiveConversationRequest,
  ArchiveConversationResponse,
  Conversation,
  ConversationListQuery,
  ConversationListResponse,
  ConversationSearchQuery,
  ConversationStatusResponse,
  CreateConversationRequest,
} from '@/types/conversation.types';
import type { TypingIndicatorResponse, TypingUsersResponse } from '@/types/typing.types';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export type OpenServiceConversationInput = {
  serviceName: string;
  providerId?: string;
  conversationType?: string;
};

export async function createOrOpenConversation(
  payload: CreateConversationRequest,
): Promise<Conversation> {
  const response = await apiClient.post<Conversation>(ENDPOINTS.CONVERSATIONS.CREATE, payload);
  return response.data;
}

export async function openServiceConversation({
  serviceName,
  providerId = DEV_PROVIDER.user_id,
  conversationType = 'standard',
}: OpenServiceConversationInput): Promise<Conversation> {
  const customerId = useAuthStore.getState().user?.id ?? DEV_USER.user_id;

  const payload: CreateConversationRequest = {
    context_id: customerId,
    context_type: 'service',
    conversation_type: conversationType,
    participant_ids: [
      {
        role: DEV_PROVIDER.role,
        user_id: providerId,
      },
    ],
    subject: `Question about ${serviceName}`,
  };

  if (__DEV__) {
    console.log('📤 Create conversation payload:', payload);
  }

  const conversation = await createOrOpenConversation(payload);

  if (__DEV__) {
    console.log('✅ Conversation created/opened:', {
      id: conversation.id,
      status: conversation.status,
      subject: conversation.subject,
      context_id: conversation.context_id,
      is_read_only: conversation.is_read_only,
      participants: conversation.participants.map((p) => `${p.role}:${p.user_id}`),
    });
  }

  return conversation;
}

export async function fetchConversationById(conversationId: string): Promise<Conversation> {
  const response = await apiClient.get<Conversation>(
    ENDPOINTS.CONVERSATIONS.GET_BY_ID(conversationId),
  );

  if (__DEV__) {
    console.log('✅ Conversation details:', {
      id: response.data.id,
      status: response.data.status,
      subject: response.data.subject,
      context_type: response.data.context_type,
      context_id: response.data.context_id,
      is_read_only: response.data.is_read_only,
      unread_count: response.data.unread_count,
      participants: response.data.participants.map((p) => `${p.role}:${p.user_id}`),
    });
  }

  return response.data;
}

export async function fetchConversations(
  query: ConversationListQuery = {},
): Promise<ConversationListResponse> {
  const response = await apiClient.get<ConversationListResponse>(ENDPOINTS.CONVERSATIONS.LIST, {
    params: {
      page: query.page ?? 1,
      page_size: query.page_size ?? 20,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { search: query.search } : {}),
    },
  });

  if (__DEV__) {
    console.log('✅ Conversations list:', {
      count: response.data.items.length,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      items: response.data.items.map((item) => ({
        id: item.id,
        subject: item.subject,
        status: item.status,
        unread_count: item.unread_count,
        last_message_preview: item.last_message_preview,
      })),
    });
  }

  return response.data;
}

export async function searchConversations(
  query: ConversationSearchQuery,
): Promise<ConversationListResponse> {
  const q = query.q.trim();
  if (!q) {
    return {
      items: [],
      pagination: { total: 0, page: 1, page_size: query.page_size ?? 20, total_pages: 0 },
    };
  }

  const path = ENDPOINTS.CONVERSATIONS.SEARCH;
  const params = {
    q,
    page: query.page ?? 1,
    page_size: query.page_size ?? 20,
    ...(query.provider_id ? { provider_id: query.provider_id } : {}),
  };
  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  const url = `${API_CONFIG.BASE_URL}${path}?${queryString}`;

  if (__DEV__) {
    console.log('[Conversations SEARCH] URL:', url);
  }

  const response = await apiClient.get<ConversationListResponse>(path, { params });

  if (__DEV__) {
    console.log('[Conversations SEARCH] Results:', {
      count: response.data.items.length,
      total: response.data.pagination.total,
      query: q,
    });
  }

  return response.data;
}

export async function fetchArchivedConversations(
  query: ConversationListQuery = {},
): Promise<ConversationListResponse> {
  const response = await apiClient.get<ConversationListResponse>(
    ENDPOINTS.CONVERSATIONS.ARCHIVED_LIST,
    {
      params: {
        page: query.page ?? 1,
        page_size: query.page_size ?? 20,
        ...(query.search ? { search: query.search } : {}),
      },
    },
  );

  if (__DEV__) {
    console.log('✅ Archived conversations list:', {
      count: response.data.items.length,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
    });
  }

  return response.data;
}

export async function setConversationArchived(
  conversationId: string,
  archived: boolean,
): Promise<ArchiveConversationResponse> {
  const payload: ArchiveConversationRequest = { archived };
  const response = await apiClient.patch<ArchiveConversationResponse>(
    ENDPOINTS.CONVERSATIONS.ARCHIVE(conversationId),
    payload,
  );

  if (__DEV__) {
    console.log('✅ Conversation archive updated:', {
      conversation_id: conversationId,
      archived: response.data.is_archived,
    });
  }

  return response.data;
}

export async function closeConversation(conversationId: string): Promise<ConversationStatusResponse> {
  const response = await apiClient.patch<ConversationStatusResponse>(
    ENDPOINTS.CONVERSATIONS.CLOSE(conversationId),
  );

  if (__DEV__) {
    console.log('✅ Conversation closed:', {
      conversation_id: conversationId,
      status: response.data.status,
    });
  }

  return response.data;
}

export async function reopenConversation(
  conversationId: string,
): Promise<ConversationStatusResponse> {
  const response = await apiClient.patch<ConversationStatusResponse>(
    ENDPOINTS.CONVERSATIONS.REOPEN(conversationId),
  );

  if (__DEV__) {
    console.log('✅ Conversation reopened:', {
      conversation_id: conversationId,
      status: response.data.status,
    });
  }

  return response.data;
}

export async function markConversationAsRead(conversationId: string): Promise<string> {
  const response = await apiClient.patch<string>(
    ENDPOINTS.CONVERSATIONS.MARK_READ(conversationId),
  );

  if (__DEV__) {
    console.log('✅ Conversation marked as read:', {
      conversation_id: conversationId,
      response: response.data,
    });
  }

  return response.data;
}

export async function updateTypingIndicator(
  conversationId: string,
  isTyping: boolean,
): Promise<TypingIndicatorResponse> {
  const path = ENDPOINTS.CONVERSATIONS.TYPING(conversationId);
  const url = `${API_CONFIG.BASE_URL}${path}`;
  const payload = { is_typing: isTyping };

  if (__DEV__) {
    console.log('[Typing PUT] URL:', url);
    if (isTyping) {
      console.log('[Typing PUT] Payload:', payload);
    }
  }

  const response = await apiClient.put<TypingIndicatorResponse>(path, payload);

  if (__DEV__ && isTyping) {
    console.log('[Typing PUT] Response:', response.data);
  }

  return response.data;
}

export async function fetchTypingUsers(conversationId: string): Promise<TypingUsersResponse> {
  const path = ENDPOINTS.CONVERSATIONS.TYPING(conversationId);
  const url = `${API_CONFIG.BASE_URL}${path}`;

  if (__DEV__) {
    console.log('[Typing GET] URL:', url);
  }

  const response = await apiClient.get<TypingUsersResponse>(path);

  if (__DEV__) {
    console.log('[Typing GET] Response:', response.data);
  }

  return response.data;
}
