import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  PUSH_DATA_KEYS,
  PUSH_NOTIFICATION_TYPES,
} from '@/constants/push';
import { registerDevicePushToken } from '@/services/pushRegistration.service';
import type { PushNotificationData } from '@/types/push.types';
import { chatHref } from '@/utils/chatNavigation';
import {
  consolidatePresentedChatNotifications,
  dismissChatNotificationsForConversation,
  isChatMessagePush,
  shouldPresentChatPushSystemUI,
  stackIncomingChatPush,
} from '@/utils/chatPushNotifications';
import { isRemotePushSupported } from '@/utils/isRemotePushSupported';
import {
  notificationFieldsFromRecord,
  resolveNotificationHref,
} from '@/utils/notificationNavigation';
import { pushLog, pushWarn } from '@/utils/pushLog';

type NotificationResponse = import('expo-notifications').NotificationResponse;

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

  // If backend stringifies metadata as JSON, merge it.
  const metadataRaw = data.metadata;
  if (typeof metadataRaw === 'string' && metadataRaw.trim().startsWith('{')) {
    try {
      const parsed = asRecord(JSON.parse(metadataRaw));
      if (parsed) {
        data = { ...data, ...parsed };
      }
    } catch {
      // ignore
    }
  } else {
    const metadataObj = asRecord(metadataRaw);
    if (metadataObj) {
      data = { ...data, ...metadataObj };
    }
  }

  const fields = notificationFieldsFromRecord(
    readString(data, PUSH_DATA_KEYS.CATEGORY, 'notification_category'),
    data,
  );

  return {
    conversationId:
      fields.conversationId ||
      readString(
        data,
        PUSH_DATA_KEYS.CONVERSATION_ID,
        'conversation_id',
        'conversationID',
      ),
    type: readString(data, PUSH_DATA_KEYS.TYPE, 'notification_type', 'notificationType'),
    category: fields.category,
    trainingId: fields.trainingId,
    enrolmentId: fields.enrolmentId,
    status: fields.status,
    announcementId: fields.announcementId,
    discussionId: fields.discussionId,
    certificateUrl: fields.certificateUrl,
  };
}

function getResponseKey(response: NotificationResponse): string {
  return [
    response.notification.request.identifier,
    response.actionIdentifier,
    String(response.notification.date ?? ''),
  ].join(':');
}

/** Full payload dump for backend verification (tag / collapseKey / thread-id / data). */
function logIncomingPushPayload(
  notification: import('expo-notifications').Notification,
  source: string,
): void {
  const content = notification.request.content;
  const trigger = notification.request.trigger as
    | {
        type?: string;
        remoteMessage?: {
          collapseKey?: string | null;
          messageId?: string | null;
          data?: Record<string, string>;
          notification?: {
            tag?: string | null;
            channelId?: string | null;
            title?: string | null;
            body?: string | null;
          } | null;
        };
      }
    | null
    | undefined;

  const remote = trigger && typeof trigger === 'object' ? trigger.remoteMessage : undefined;

  // Flat fields so Metro shows them without expanding nested objects.
  pushLog(`Push payload (${source})`, {
    appState: AppState.currentState,
    identifier: notification.request.identifier,
    title: content.title,
    body: content.body,
    conversationId:
      (content.data as Record<string, unknown> | undefined)?.conversationId ??
      (content.data as Record<string, unknown> | undefined)?.conversation_id ??
      null,
    triggerType: trigger && typeof trigger === 'object' ? trigger.type : trigger,
    fcmMessageId: remote?.messageId ?? null,
    fcmCollapseKey: remote?.collapseKey ?? null,
    fcmNotificationTag: remote?.notification?.tag ?? null,
    fcmChannelId: remote?.notification?.channelId ?? null,
    fcmData: remote?.data ?? null,
    contentData: content.data ?? null,
  });
}

export function usePushNotifications(isAuthenticated: boolean) {
  const router = useRouter();
  const pendingHrefRef = useRef<Href | null>(null);
  const lastHandledResponseKeyRef = useRef<string | null>(null);

  const openHrefFromPush = useCallback(
    (href: Href, source: string) => {
      if (!isAuthenticated) {
        pendingHrefRef.current = href;
        pushLog('Queued notification deep link until authenticated', { href, source });
        return;
      }

      pushLog('Opening screen from push', { href, source });

      setTimeout(() => {
        router.push(href);
      }, 100);
    },
    [isAuthenticated, router],
  );

  const handleNotificationResponse = useCallback(
    (response: NotificationResponse, source: string) => {
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

      const href = resolveNotificationHref({
        category: data.category || data.type,
        trainingId: data.trainingId,
        enrolmentId: data.enrolmentId,
        status: data.status,
        announcementId: data.announcementId,
        discussionId: data.discussionId,
        certificateUrl: data.certificateUrl,
        conversationId: data.conversationId,
      });

      if (data.conversationId && isChatMessagePush(data)) {
        void dismissChatNotificationsForConversation(data.conversationId);
      }

      if (href) {
        openHrefFromPush(href, source);
        return;
      }

      // Legacy chat fallbacks.
      if (
        data.type === PUSH_NOTIFICATION_TYPES.CHAT_MESSAGE &&
        data.conversationId
      ) {
        openHrefFromPush(chatHref(data.conversationId), source);
        return;
      }

      if (data.conversationId) {
        openHrefFromPush(
          chatHref(data.conversationId),
          `${source}-conversationId-only`,
        );
        return;
      }

      pushWarn('Notification tapped — no navigation target', data);
    },
    [openHrefFromPush],
  );

  // Flush queued deep link after login / auth becomes ready.
  useEffect(() => {
    if (!isAuthenticated || !pendingHrefRef.current) return;

    const href = pendingHrefRef.current;
    pendingHrefRef.current = null;
    openHrefFromPush(href, 'pending-after-auth');
  }, [isAuthenticated, openHrefFromPush]);

  useEffect(() => {
    if (!isRemotePushSupported()) {
      pushWarn('Push listeners skipped — remote push unavailable in Expo Go on Android');
      return;
    }

    let cancelled = false;
    const subscriptions: { remove: () => void }[] = [];

    void (async () => {
      const Notifications = await import('expo-notifications');
      if (cancelled) return;

      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          logIncomingPushPayload(notification, 'handler');
          const raw = notification.request.content.data as
            | Record<string, unknown>
            | undefined;
          const data = parsePushNotificationData(raw);
          const present = shouldPresentChatPushSystemUI(data, raw);

          return {
            shouldShowBanner: present,
            shouldShowList: present,
            shouldPlaySound: present,
            shouldSetBadge: true,
          };
        },
      });

      subscriptions.push(
        Notifications.addNotificationReceivedListener((notification) => {
          logIncomingPushPayload(notification, 'received-listener');
          const raw = notification.request.content.data as
            | Record<string, unknown>
            | undefined;
          const data = parsePushNotificationData(raw);

          if (isChatMessagePush(data)) {
            void stackIncomingChatPush({
              title: notification.request.content.title,
              body: notification.request.content.body,
              data,
              rawData: raw,
            });
          }
        }),
      );

      const onAppStateChange = (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          void consolidatePresentedChatNotifications();
        }
      };
      const appStateSub = AppState.addEventListener('change', onAppStateChange);
      subscriptions.push({ remove: () => appStateSub.remove() });
      void consolidatePresentedChatNotifications();

      subscriptions.push(
        Notifications.addNotificationResponseReceivedListener((response) => {
          handleNotificationResponse(response, 'tap-listener');
        }),
      );

      subscriptions.push(
        Notifications.addPushTokenListener((token) => {
          if (!isAuthenticated) return;

          pushLog('Push token refreshed by OS', { token: token.data });
          void registerDevicePushToken(token.data);
        }),
      );

      // Cold start / killed app: user opened app by tapping a notification.
      const response = await Notifications.getLastNotificationResponseAsync();
      if (!cancelled && response) {
        handleNotificationResponse(response, 'cold-start');
      }
    })();

    return () => {
      cancelled = true;
      for (const subscription of subscriptions) {
        subscription.remove();
      }
    };
  }, [handleNotificationResponse, isAuthenticated]);
}
