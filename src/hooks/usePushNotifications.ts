import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

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

function parsePushNotificationData(
  data: Record<string, unknown> | undefined,
): PushNotificationData {
  if (!data) return {};

  const conversationId = data[PUSH_DATA_KEYS.CONVERSATION_ID];
  const type = data[PUSH_DATA_KEYS.TYPE];

  return {
    conversationId: typeof conversationId === 'string' ? conversationId : undefined,
    type: typeof type === 'string' ? type : undefined,
  };
}

export function usePushNotifications(isAuthenticated: boolean) {
  const router = useRouter();

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = parsePushNotificationData(
        response.notification.request.content.data as Record<string, unknown> | undefined,
      );

      if (
        data.type === PUSH_NOTIFICATION_TYPES.CHAT_MESSAGE &&
        data.conversationId
      ) {
        pushLog('Notification tapped — opening chat', { conversationId: data.conversationId });
        router.push(chatHref(data.conversationId));
        return;
      }

      pushWarn('Notification tapped — no chat navigation (missing type/conversationId)', data);
    },
    [router],
  );

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
      handleNotificationResponse,
    );

    const pushTokenSubscription = Notifications.addPushTokenListener((token) => {
      if (!isAuthenticated) return;

      pushLog('Push token refreshed by OS', { token: token.data });

      void registerDevicePushToken(token.data);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      pushTokenSubscription.remove();
    };
  }, [handleNotificationResponse, isAuthenticated]);
}
