import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { updatePresenceStatus } from '@/services/presence.service';

function isActiveState(state: AppStateStatus): boolean {
  return state === 'active';
}

function isBackgroundState(state: AppStateStatus): boolean {
  return state === 'background' || state === 'inactive';
}

/**
 * Keeps the authenticated user's REST presence in sync with app lifecycle.
 * Online while the app is foregrounded; offline only on background or logout.
 */
export function useAppPresence(enabled: boolean) {
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (!enabled) return undefined;

    const markOnline = () => {
      void updatePresenceStatus('online').catch((error) => {
        if (__DEV__) {
          console.warn('⚠️ Set presence online failed:', error);
        }
      });
    };

    const markOffline = () => {
      void updatePresenceStatus('offline').catch((error) => {
        if (__DEV__) {
          console.warn('⚠️ Set presence offline failed:', error);
        }
      });
    };

    if (isActiveState(appStateRef.current)) {
      markOnline();
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (isBackgroundState(nextState) && isActiveState(previousState)) {
        markOffline();
        return;
      }

      if (isActiveState(nextState) && isBackgroundState(previousState)) {
        markOnline();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled]);
}
