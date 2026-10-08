import { Platform } from 'react-native';

import { ANDROID_NOTIFICATION_CHANNEL_ID, PUSH_NOTIFICATION_TYPES } from '@/constants/push';
import { getActiveChatConversationId } from '@/services/chatRead.service';
import type { PushNotificationData } from '@/types/push.types';
import { isRemotePushSupported } from '@/utils/isRemotePushSupported';
import { pushLog } from '@/utils/pushLog';

/** Marks locally stacked chat notifications so the handler doesn't re-stack them. */
export const CHAT_STACKED_PUSH_FLAG = '_chatStacked';

const MAX_STACKED_LINES = 5;

type StackEntry = {
  title: string;
  lines: string[];
  data: Record<string, unknown>;
};

const stackedByConversation = new Map<string, StackEntry>();

export function chatConversationNotificationId(conversationId: string): string {
  return `chat-conversation-${conversationId}`;
}

export function isChatMessagePush(data: PushNotificationData): boolean {
  return Boolean(data.conversationId?.trim());
}

/** Hide banners when this conversation is already open on ChatScreen. */
export function shouldSuppressChatPush(data: PushNotificationData): boolean {
  const conversationId = data.conversationId?.trim();
  if (!conversationId) return false;
  return getActiveChatConversationId() === conversationId;
}

/**
 * Whether the OS should present this notification as-is.
 * Remote chat pushes are suppressed so we can show one stacked local notification.
 * Already-stacked locals are allowed (unless that chat is open).
 */
export function shouldPresentChatPushSystemUI(
  data: PushNotificationData,
  rawData?: Record<string, unknown>,
): boolean {
  if (!isChatMessagePush(data)) return true;
  if (shouldSuppressChatPush(data)) return false;
  if (rawData?.[CHAT_STACKED_PUSH_FLAG] === true) return true;
  return false;
}

export async function dismissChatNotificationsForConversation(
  conversationId: string,
): Promise<void> {
  const id = conversationId.trim();
  if (!id) return;

  stackedByConversation.delete(id);

  if (!isRemotePushSupported()) return;

  try {
    const Notifications = await import('expo-notifications');
    const presented = await Notifications.getPresentedNotificationsAsync();
    const targetIdentifier = chatConversationNotificationId(id);

    await Promise.all(
      presented.map(async (notification) => {
        const raw = notification.request.content.data as Record<string, unknown> | undefined;
        const dataConversationId = readConversationIdFromRaw(raw);
        if (
          notification.request.identifier === targetIdentifier ||
          dataConversationId === id
        ) {
          await Notifications.dismissNotificationAsync(notification.request.identifier);
        }
      }),
    );

    pushLog('Dismissed chat notifications for conversation', { conversationId: id });
  } catch (error) {
    if (__DEV__) {
      console.warn('[chatPush] dismiss failed', error);
    }
  }
}

/**
 * Merge this chat push into one notification per conversation (WhatsApp-style stack).
 * Call after suppressing the remote presentation in the notification handler.
 */
export async function stackIncomingChatPush(args: {
  title?: string | null;
  body?: string | null;
  data: PushNotificationData;
  rawData?: Record<string, unknown>;
}): Promise<void> {
  const conversationId = args.data.conversationId?.trim();
  if (!conversationId || !isChatMessagePush(args.data)) return;

  if (getActiveChatConversationId() === conversationId) {
    await dismissChatNotificationsForConversation(conversationId);
    return;
  }

  if (args.rawData?.[CHAT_STACKED_PUSH_FLAG] === true) {
    return;
  }

  if (!isRemotePushSupported()) return;

  const title = (args.title ?? '').trim() || 'New message';
  const bodyLine = (args.body ?? '').trim();

  const existing = stackedByConversation.get(conversationId) ?? {
    title,
    lines: [],
    data: {},
  };

  existing.title = title;
  if (bodyLine) {
    existing.lines.push(bodyLine);
    if (existing.lines.length > MAX_STACKED_LINES) {
      existing.lines = existing.lines.slice(-MAX_STACKED_LINES);
    }
  }
  existing.data = {
    ...existing.data,
    ...(args.rawData ?? {}),
    conversationId,
    conversation_id: conversationId,
    type: args.data.type ?? PUSH_NOTIFICATION_TYPES.CHAT_MESSAGE,
    category: args.data.category ?? PUSH_NOTIFICATION_TYPES.CHAT_MESSAGE,
    [CHAT_STACKED_PUSH_FLAG]: true,
  };
  stackedByConversation.set(conversationId, existing);

  try {
    const Notifications = await import('expo-notifications');
    const presented = await Notifications.getPresentedNotificationsAsync();
    const targetIdentifier = chatConversationNotificationId(conversationId);

    await Promise.all(
      presented.map(async (notification) => {
        const raw = notification.request.content.data as Record<string, unknown> | undefined;
        const dataConversationId = readConversationIdFromRaw(raw);
        if (
          notification.request.identifier === targetIdentifier ||
          dataConversationId === conversationId
        ) {
          await Notifications.dismissNotificationAsync(notification.request.identifier);
        }
      }),
    );

    const stackedBody = existing.lines.length > 0 ? existing.lines.join('\n') : title;

    await Notifications.scheduleNotificationAsync({
      identifier: targetIdentifier,
      content: {
        title: existing.title,
        body: stackedBody,
        data: existing.data,
        sound: true,
      },
      trigger:
        Platform.OS === 'android'
          ? { channelId: ANDROID_NOTIFICATION_CHANNEL_ID }
          : null,
    });

    pushLog('Stacked chat notification', {
      conversationId,
      lineCount: existing.lines.length,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[chatPush] stack failed', error);
    }
  }
}

/**
 * When returning to foreground, collapse leftover separate chat banners
 * into one notification per conversation.
 */
export async function consolidatePresentedChatNotifications(): Promise<void> {
  if (!isRemotePushSupported()) return;

  try {
    const Notifications = await import('expo-notifications');
    const presented = await Notifications.getPresentedNotificationsAsync();

    const byConversation = new Map<
      string,
      { title: string; lines: string[]; data: Record<string, unknown>; identifiers: string[] }
    >();

    for (const notification of presented) {
      const raw = (notification.request.content.data ?? {}) as Record<string, unknown>;
      const conversationId = readConversationIdFromRaw(raw);
      if (!conversationId) continue;

      if (getActiveChatConversationId() === conversationId) {
        await Notifications.dismissNotificationAsync(notification.request.identifier);
        continue;
      }

      const entry = byConversation.get(conversationId) ?? {
        title: '',
        lines: [],
        data: {
          [CHAT_STACKED_PUSH_FLAG]: true,
          conversationId,
          conversation_id: conversationId,
        },
        identifiers: [],
      };

      entry.title =
        (notification.request.content.title ?? '').trim() || entry.title || 'New message';
      const body = (notification.request.content.body ?? '').trim();
      if (body) {
        for (const line of body.split('\n')) {
          const trimmed = line.trim();
          if (trimmed) entry.lines.push(trimmed);
        }
      }
      entry.data = {
        ...entry.data,
        ...raw,
        conversationId,
        conversation_id: conversationId,
        [CHAT_STACKED_PUSH_FLAG]: true,
      };
      entry.identifiers.push(notification.request.identifier);
      byConversation.set(conversationId, entry);
    }

    for (const [conversationId, entry] of byConversation) {
      if (entry.identifiers.length <= 1 && entry.lines.length <= 1) {
        if (entry.lines.length > 0) {
          stackedByConversation.set(conversationId, {
            title: entry.title,
            lines: entry.lines.slice(-MAX_STACKED_LINES),
            data: entry.data,
          });
        }
        continue;
      }

      await Promise.all(
        entry.identifiers.map((identifier) =>
          Notifications.dismissNotificationAsync(identifier),
        ),
      );

      const lines = entry.lines.slice(-MAX_STACKED_LINES);
      stackedByConversation.set(conversationId, {
        title: entry.title,
        lines,
        data: entry.data,
      });

      await Notifications.scheduleNotificationAsync({
        identifier: chatConversationNotificationId(conversationId),
        content: {
          title: entry.title,
          body: lines.join('\n') || entry.title,
          data: entry.data,
          sound: false,
        },
        trigger:
          Platform.OS === 'android'
            ? { channelId: ANDROID_NOTIFICATION_CHANNEL_ID }
            : null,
      });
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[chatPush] consolidate failed', error);
    }
  }
}

function readConversationIdFromRaw(raw: Record<string, unknown> | undefined): string | undefined {
  if (!raw) return undefined;
  for (const key of ['conversationId', 'conversation_id', 'conversationID']) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  const nested = raw.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return readConversationIdFromRaw(nested as Record<string, unknown>);
  }
  return undefined;
}
