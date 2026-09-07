import { useEffect } from 'react';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { registerDevicePushToken } from '@/services/pushRegistration.service';
import { useAuthStore } from '@/stores/auth.store';
import { pushLog } from '@/utils/pushLog';

export function PushNotificationsManager() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  usePushNotifications(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      pushLog('Push manager idle — user not authenticated');
      return;
    }

    pushLog('Push manager active — user authenticated, starting registration');
    void registerDevicePushToken();
  }, [isAuthenticated]);

  return null;
}
