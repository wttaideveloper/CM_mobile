import { create } from 'zustand';

import { markActiveChatReadOnLogout } from '@/services/chatRead.service';
import { fetchDevToken } from '@/services/auth.service';
import { updatePresenceStatus } from '@/services/presence.service';
import { unregisterDevicePushToken } from '@/services/pushRegistration.service';
import { connectSocket, disconnectSocket } from '@/services/socket/socket.client';
import { useSubscriptionStore } from '@/stores/subscription.store';
import type { AuthUser } from '@/types/auth.types';

const TOKEN_REFRESH_BUFFER_MS = 60_000;

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  expiresAt: number | null;
  login: () => Promise<void>;
  logout: () => void;
  ensureDevToken: (force?: boolean) => Promise<string>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  user: null,
  expiresAt: null,

  login: async () => {
    set({ isLoading: true });

    try {
      const data = await fetchDevToken();

      set({
        isAuthenticated: true,
        isLoading: false,
        accessToken: data.access_token,
        user: data.user,
        expiresAt: Date.now() + data.expires_in * 1000,
      });

      if (__DEV__) {
        console.log('✅ Dev token acquired for', data.user.email, `(${data.user.id})`);
      }

      connectSocket(data.access_token);

      await useSubscriptionStore.getState().loadChatEligibility().catch((eligibilityError) => {
        if (__DEV__) {
          console.warn('⚠️ Chat eligibility check failed:', eligibilityError);
        }
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    void (async () => {
      try {
        await markActiveChatReadOnLogout();
      } catch (error) {
        if (__DEV__) {
          console.warn('⚠️ Mark chat read on logout failed:', error);
        }
      }

      try {
        await unregisterDevicePushToken();
      } catch (error) {
        if (__DEV__) {
          console.warn('⚠️ Push unregister on logout failed:', error);
        }
      }

      try {
        await updatePresenceStatus('offline');
      } catch (error) {
        if (__DEV__) {
          console.warn('⚠️ Set presence offline on logout failed:', error);
        }
      }

      disconnectSocket();
      useSubscriptionStore.getState().clear();
      set({
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        user: null,
        expiresAt: null,
      });
    })();
  },

  ensureDevToken: async (force = false) => {
    const { accessToken, expiresAt } = get();

    if (
      !force &&
      accessToken &&
      expiresAt &&
      Date.now() < expiresAt - TOKEN_REFRESH_BUFFER_MS
    ) {
      return accessToken;
    }

    const data = await fetchDevToken();

    set({
      isAuthenticated: true,
      accessToken: data.access_token,
      user: data.user,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    connectSocket(data.access_token);

    return data.access_token;
  },
}));
