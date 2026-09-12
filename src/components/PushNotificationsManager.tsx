import { useEffect } from 'react';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { registerDevicePushToken } from '@/services/pushRegistration.service';
import { useAuthStore } from '@/stores/auth.store';
import { isRemotePushSupported } from '@/utils/isRemotePushSupported';
import { pushLog, pushWarn } from '@/utils/pushLog';

export function PushNotificationsManager() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pushSupported = isRemotePushSupported();

  usePushNotifications(isAuthenticated && pushSupported);

  useEffect(() => {
    if (!pushSupported) {
      pushWarn('Push manager disabled — use a development build for Android push');
      return;
    }

    if (!isAuthenticated) {
      pushLog('Push manager idle — user not authenticated');
      return;
    }

    pushLog('Push manager active — user authenticated, starting registration');
    void registerDevicePushToken();
  }, [isAuthenticated, pushSupported]);

  return null;
}
