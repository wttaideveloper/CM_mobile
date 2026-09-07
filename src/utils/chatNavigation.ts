import type { Href } from 'expo-router';

import type { ChatMode } from '@/constants/chat';

type ChatParams = {
  mode?: ChatMode;
  /** Display text — only for mock/preview routes that cannot load meta by ID yet. */
  title?: string;
  provider?: string;
  enterprise?: string;
  members?: string;
  /** Prefer IDs only for live conversations (§6). */
  serviceId?: string;
  appointmentId?: string;
};

export function chatHref(conversationId: string, params?: ChatParams): Href {
  const query: Record<string, string> = {};

  if (params?.mode) query.mode = params.mode;
  if (params?.title) query.title = params.title;
  if (params?.provider) query.provider = params.provider;
  if (params?.enterprise) query.enterprise = params.enterprise;
  if (params?.members) query.members = params.members;
  if (params?.serviceId) query.serviceId = params.serviceId;
  if (params?.appointmentId) query.appointmentId = params.appointmentId;

  return {
    pathname: '/(main)/chat/[id]',
    params: { id: conversationId, ...query },
  } as Href;
}

export function serviceChatHref(
  serviceId: string,
  meta?: Pick<ChatParams, 'title' | 'provider' | 'enterprise'>,
): Href {
  return chatHref(`service-${serviceId}`, {
    mode: 'preview',
    serviceId,
    ...meta,
  });
}

export function appointmentChatHref(
  appointmentId: string,
  meta?: Pick<ChatParams, 'title' | 'provider' | 'enterprise'>,
): Href {
  return chatHref(`appointment-${appointmentId}`, {
    mode: 'full',
    appointmentId,
    ...meta,
  });
}

export function chatInboxHref(): Href {
  return '/(main)/chat/inbox' as Href;
}

export function createGroupHref(): Href {
  return '/(main)/chat/create-group' as Href;
}

export function chatMediaHref(conversationId: string): Href {
  return {
    pathname: '/(main)/chat/[id]/media',
    params: { id: conversationId },
  } as Href;
}
