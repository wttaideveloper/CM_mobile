import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { ANDROID_NOTIFICATION_CHANNEL_ID } from '@/constants/push';
import { registerDevice, unregisterDevice } from '@/services/device.service';
import type { PushPlatform } from '@/types/push.types';
import { isRemotePushSupported } from '@/utils/isRemotePushSupported';
import { pushError, pushLog, pushWarn } from '@/utils/pushLog';

type NotificationsModule = typeof import('expo-notifications');

let registeredToken: string | null = null;
let notificationsModule: NotificationsModule | null = null;

export function getRegisteredPushToken(): string | null {
  return registeredToken;
}

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!isRemotePushSupported()) {
    return null;
  }

  if (notificationsModule) {
    return notificationsModule;
  }

  notificationsModule = await import('expo-notifications');
  return notificationsModule;
}

async function ensureAndroidNotificationChannel(
  Notifications: NotificationsModule,
): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
    name: 'InvigorateHealth',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1F5D4E',
  });

  pushLog('Android notification channel ready', { channelId: ANDROID_NOTIFICATION_CHANNEL_ID });
}

async function requestPushPermissions(
  Notifications: NotificationsModule,
): Promise<string> {
  const current = await Notifications.getPermissionsAsync();
  pushLog('Push permission status (current)', { status: current.status });

  if (current.status === Notifications.PermissionStatus.GRANTED) {
    return current.status;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  pushLog('Push permission status (requested)', { status: requested.status });
  return requested.status;
}

async function getNativePushToken(
  Notifications: NotificationsModule,
): Promise<string | null> {
  pushLog('Fetching native push token', {
    platform: Platform.OS,
    isDevice: Device.isDevice,
    deviceName: Device.deviceName,
  });

  if (!Device.isDevice) {
    pushWarn('Skipped native token fetch — not a physical device (simulator/emulator without FCM)');
    return null;
  }

  const deviceToken = await Notifications.getDevicePushTokenAsync();

  pushLog('Native push token obtained', {
    tokenType: deviceToken.type,
    token: deviceToken.data,
  });

  return deviceToken.data;
}

async function registerTokenWithBackend(pushToken: string): Promise<void> {
  if (registeredToken === pushToken) {
    pushLog('Register skipped — token unchanged', { token: pushToken });
    return;
  }

  pushLog('Sending token to backend register API', {
    platform: Platform.OS,
    token: pushToken,
  });

  await registerDevice({
    token: pushToken,
    platform: Platform.OS as PushPlatform,
  });

  registeredToken = pushToken;

  pushLog(`${Platform.OS === 'android' ? 'FCM' : 'APNs'} token registered locally`, {
    token: pushToken,
  });
}

export async function registerDevicePushToken(existingToken?: string): Promise<string | null> {
  pushLog('Starting push registration flow', {
    platform: Platform.OS,
    source: existingToken ? 'token-refresh-listener' : 'initial-login',
  });

  try {
    const Notifications = await loadNotifications();
    if (!Notifications) {
      pushWarn('Push registration skipped — remote push unavailable in Expo Go on Android');
      return null;
    }

    await ensureAndroidNotificationChannel(Notifications);

    const status = await requestPushPermissions(Notifications);

    if (status !== Notifications.PermissionStatus.GRANTED) {
      pushWarn('Push registration stopped — permission not granted', { status });
      return null;
    }

    const pushToken = existingToken ?? (await getNativePushToken(Notifications));

    if (!pushToken) {
      pushWarn('Push registration stopped — no native token returned');
      return null;
    }

    await registerTokenWithBackend(pushToken);
    pushLog('Push registration flow complete', { token: pushToken });
    return pushToken;
  } catch (error) {
    pushError('Push registration flow failed', error);
    return null;
  }
}

export async function unregisterDevicePushToken(): Promise<void> {
  if (!registeredToken) {
    pushLog('Unregister skipped — no locally stored token');
    return;
  }

  const token = registeredToken;
  pushLog('Starting push unregister flow', { token });

  try {
    await unregisterDevice(token);
    pushLog('Push unregister flow complete');
  } catch (error) {
    pushError('Push unregister flow failed', error);
  } finally {
    registeredToken = null;
  }
}
