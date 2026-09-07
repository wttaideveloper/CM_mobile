import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ANDROID_NOTIFICATION_CHANNEL_ID } from '@/constants/push';
import { registerDevice, unregisterDevice } from '@/services/device.service';
import type { PushPlatform } from '@/types/push.types';
import { pushError, pushLog, pushWarn } from '@/utils/pushLog';

let registeredToken: string | null = null;

export function getRegisteredPushToken(): string | null {
  return registeredToken;
}

async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
    name: 'InvigorateHealth',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1F5D4E',
  });

  pushLog('Android notification channel ready', { channelId: ANDROID_NOTIFICATION_CHANNEL_ID });
}

async function requestPushPermissions(): Promise<Notifications.PermissionStatus> {
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

async function getNativePushToken(): Promise<string | null> {
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
    await ensureAndroidNotificationChannel();

    const status = await requestPushPermissions();

    if (status !== Notifications.PermissionStatus.GRANTED) {
      pushWarn('Push registration stopped — permission not granted', { status });
      return null;
    }

    const pushToken = existingToken ?? (await getNativePushToken());

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
