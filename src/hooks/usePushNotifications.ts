import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import {
  PUSH_DATA_KEYS,
  PUSH_NOTIFICATION_TYPES,
} from '@/constants/push';
import { registerDevicePushToken } from '@/services/pushRegistration.service';
import type { PushNotificationData } from '@/types/push.types';
import { chatHref } from '@/utils/chatNavigation';
import { pushLog, pushWarn } from '@/utils/pushLog';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function readString(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

/** Parse FCM/Expo notification data (supports camelCase + snake_case). */
export function parsePushNotificationData(
  raw: Record<string, unknown> | undefined,
): PushNotificationData {
  if (!raw) return {};

  // Some Android FCM deliveries nest payload under `data` or stringify JSON.
  let data = raw;
  const nested = asRecord(raw.data);
  if (nested) {
    data = { ...raw, ...nested };
  }

  const bodyJson = raw.body;
  if (typeof bodyJson === 'string' && bodyJson.trim().startsWith('{')) {
    try {
      const parsed = asRecord(JSON.parse(bodyJson));
      if (parsed) {
        data = { ...data, ...parsed };
      }
    } catch {
      // ignore invalid JSON body
    }
  }

  return {
    conversationId: readString(
      data,
      PUSH_DATA_KEYS.CONVERSATION_ID,
      'conversation_id',
      'conversationID',
    ),
    type: readString(data, PUSH_DATA_KEYS.TYPE, 'notification_type', 'notificationType'),
  };
}

function getResponseKey(response: Notifications.NotificationResponse): string {
  return [
    response.notification.request.identifier,
    response.actionIdentifier,
    String(response.notification.date ?? ''),
  ].join(':');
}

export function usePushNotifications(isAuthenticated: boolean) {
  const router = useRouter();
  const pendingConversationIdRef = useRef<string | null>(null);
  const lastHandledResponseKeyRef = useRef<string | null>(null);

  const openChatFromPush = useCallback(
    (conversationId: string, source: string) => {
      if (!isAuthenticated) {
        pendingConversationIdRef.current = conversationId;
        pushLog('Queued chat deep link until authenticated', { conversationId, source });
        return;
      }

      pushLog('Opening chat from push', { conversationId, source });

      // Open the conversation directly (do not hop through inbox / notifications first).
      setTimeout(() => {
        router.push(chatHref(conversationId));
      }, 100);
    },
    [isAuthenticated, router],
  );

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse, source: string) => {
      const responseKey = getResponseKey(response);
      if (lastHandledResponseKeyRef.current === responseKey) {
        return;
      }
      lastHandledResponseKeyRef.current = responseKey;

      const data = parsePushNotificationData(
        response.notification.request.content.data as Record<string, unknown> | undefined,
      );

      pushLog('Notification tapped', {
        source,
        title: response.notification.request.content.title,
        body: response.notification.request.content.body,
        data,
      });

      if (
        data.type === PUSH_NOTIFICATION_TYPES.CHAT_MESSAGE &&
        data.conversationId
      ) {
        openChatFromPush(data.conversationId, source);
        return;
      }

      // Fallback: conversationId alone is enough to open chat.
      if (data.conversationId) {
        openChatFromPush(data.conversationId, `${source}-conversationId-only`);
        return;
      }

      pushWarn('Notification tapped — no chat navigation (missing conversationId)', data);
    },
    [openChatFromPush],
  );

  // Flush queued deep link after login / auth becomes ready.
  useEffect(() => {
    if (!isAuthenticated || !pendingConversationIdRef.current) return;

    const conversationId = pendingConversationIdRef.current;
    pendingConversationIdRef.current = null;
    openChatFromPush(conversationId, 'pending-after-auth');
  }, [isAuthenticated, openChatFromPush]);

  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = parsePushNotificationData(
        notification.request.content.data as Record<string, unknown> | undefined,
      );

      pushLog('Notification received (foreground/background)', {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data,
      });
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response, 'tap-listener');
      },
    );

    const pushTokenSubscription = Notifications.addPushTokenListener((token) => {
      if (!isAuthenticated) return;

      pushLog('Push token refreshed by OS', { token: token.data });
      void registerDevicePushToken(token.data);
    });

    // Cold start / killed app: user opened app by tapping a notification.
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response, 'cold-start');
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      pushTokenSubscription.remove();
    };
  }, [handleNotificationResponse, isAuthenticated]);
}
