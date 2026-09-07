import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  LOGIN_TOKEN_REFRESH_INTERVAL_MS,
  TOKEN_REFRESH_BUFFER_MS,
  useAuthStore,
} from '@/stores/auth.store';

/** Restores SecureStore session via GET /auth/me (+ refresh if needed). */
export function AuthSessionBootstrap() {
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ensureAccessToken = useAuthStore((state) => state.ensureAccessToken);

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const refreshDevToken = () => {
      void ensureAccessToken(true).catch((error) => {
        if (__DEV__) {
          console.warn('[TokenRefresh] Scheduled refresh failed:', error);
        }
      });
    };

    const refreshIfTokenStale = () => {
      const { expiresAt } = useAuthStore.getState();
      if (!expiresAt) return;

      if (Date.now() >= expiresAt - TOKEN_REFRESH_BUFFER_MS) {
        refreshDevToken();
      }
    };

    const intervalId = setInterval(refreshDevToken, LOGIN_TOKEN_REFRESH_INTERVAL_MS);

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          refreshIfTokenStale();
        }
      },
    );

    if (__DEV__) {
      console.log(
        `[TokenRefresh] Scheduler started — every ${LOGIN_TOKEN_REFRESH_INTERVAL_MS / 60_000} min`,
      );
    }

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [ensureAccessToken, isAuthenticated]);

  return null;
}
