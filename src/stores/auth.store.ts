import { create } from 'zustand';

import { markActiveChatReadOnLogout } from '@/services/chatRead.service';
import {
  clearAuthSession,
  // saveAuthSession, // re-enable with login JWT persistence later
} from '@/services/authSession.storage';
import {
  fetchDevToken,
  fetchMe,
  updateMyProfile,
  loginWithCredentials,
  // refreshSession, // re-enable when using auth API access/refresh tokens for main APIs
} from '@/services/auth.service';
import { updatePresenceStatus } from '@/services/presence.service';
import { unregisterDevicePushToken } from '@/services/pushRegistration.service';
import { connectSocket, disconnectSocket } from '@/services/socket/socket.client';
import { useSubscriptionStore } from '@/stores/subscription.store';
import type { AuthUser, LoginRequest, UpdateProfileRequest } from '@/types/auth.types';
import {
  getLoginAccessToken,
  isAuthenticatedMe,
  mapLoginUserToAuthUser,
} from '@/types/auth.types';

/** Dev-token TTL is ~1h; refresh when less than 15 min remain (at ~45 min). */
export const TOKEN_REFRESH_BUFFER_MS = 15 * 60_000;
/** Proactive refresh while the app stays open (before hourly token rotation). */
export const DEV_TOKEN_REFRESH_INTERVAL_MS = 45 * 60_000;

type AuthState = {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  /** Marketplace JWT (destin-token) for main API / socket. */
  accessToken: string | null;
  /** Login API access token — used for GET /auth/me and other auth-API calls. */
  authAccessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  expiresAt: number | null;
  login: (credentials: LoginRequest) => Promise<void>;
  loadCurrentUser: () => Promise<boolean>;
  /** Calls GET /auth/me with login token and logs the response (Me tab). */
  fetchAndLogMe: () => Promise<void>;
  /** PATCH /auth/me/profile with login token; updates stored user on success. */
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>;
  initializeSession: () => Promise<void>;
  clearSession: () => void;
  logout: () => void;
  /** Returns the marketplace JWT (dev-token) for apiClient interceptors. */
  ensureAccessToken: (force?: boolean) => Promise<string>;
  /** @deprecated Use ensureAccessToken */
  ensureDevToken: (force?: boolean) => Promise<string>;
};

function getExpiresAt(expiresIn: number): number {
  const seconds = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 300;
  return Date.now() + seconds * 1000;
}

/*
 * --- PRODUCTION SESSION (auth API tokens) — re-enable later ---
 *
 * function applySessionFromResponse(
 *   response: LoginResponse,
 *   set: (partial: Partial<AuthState>) => void,
 * ): string {
 *   const accessToken = getLoginAccessToken(response);
 *   const user = mapLoginUserToAuthUser(response.data);
 *   const refreshToken = response.tokens.refresh_token ?? null;
 *   const expiresAt = getExpiresAt(response.tokens.expires_in);
 *
 *   set({
 *     isAuthenticated: true,
 *     accessToken,
 *     refreshToken,
 *     user,
 *     expiresAt,
 *   });
 *
 *   connectSocket(accessToken);
 *
 *   if (refreshToken) {
 *     void saveAuthSession({ accessToken, refreshToken, expiresAt }).catch(() => {});
 *   }
 *
 *   return accessToken;
 * }
 */

/** Apply local marketplace JWT from POST /api/v1/auth/dev-token. */
function applyDevTokenSession(
  data: Awaited<ReturnType<typeof fetchDevToken>>,
  set: (partial: Partial<AuthState>) => void,
  loginUser?: AuthUser | null,
): string {
  const accessToken = data.access_token;
  const expiresAt = getExpiresAt(data.expires_in);

  set({
    isAuthenticated: true,
    accessToken,
    // Prefer real login profile for UI; fall back to dev-token user.
    user: loginUser ?? data.user,
    expiresAt,
  });

  connectSocket(accessToken);
  return accessToken;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isAuthReady: false,
  isLoading: false,
  isLoggingOut: false,
  accessToken: null,
  authAccessToken: null,
  refreshToken: null,
  user: null,
  expiresAt: null,

  login: async (credentials) => {
    set({ isLoading: true });

    try {
      // 1) Real Invigorate auth (AWS) — must succeed before entering the app.
      const response = await loginWithCredentials(credentials);
      const loginUser = mapLoginUserToAuthUser(response.data);
      const authAccessToken = getLoginAccessToken(response);

      // Keep login token for /auth/me (separate from destin-token used on main API).
      set({
        authAccessToken,
        refreshToken: response.tokens.refresh_token ?? null,
      });

      if (__DEV__) {
        console.log('✅ Auth login OK for', loginUser.email, `(${loginUser.id})`);
        console.log('🔐 Auth access token stored for /auth/me');
      }

      /*
       * --- Later: attach auth API tokens to main APIs ---
       * const accessToken = applySessionFromResponse(response, set);
       */

      // 2) Local marketplace JWT for chat/devices/presence/socket (main API).
      const devToken = await fetchDevToken();
      applyDevTokenSession(devToken, set, loginUser);

      set({ isLoading: false });

      if (__DEV__) {
        console.log('🔑 Dev-token stored — attached to main API requests via interceptor');
      }

      void useSubscriptionStore
        .getState()
        .loadChatEligibility()
        .catch((eligibilityError) => {
          if (__DEV__) {
            console.warn('⚠️ Chat eligibility check failed:', eligibilityError);
          }
        });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadCurrentUser: async () => {
    return Boolean(get().accessToken && get().user);
  },

  updateProfile: async (payload) => {
    const { authAccessToken } = get();

    if (!authAccessToken) {
      throw new Error('Please sign in again to update your profile.');
    }

    const response = await updateMyProfile(payload);
    const user = mapLoginUserToAuthUser(response.data);
    set({ user });

    if (__DEV__) {
      console.log('✅ Profile updated:', user);
    }
  },

  fetchAndLogMe: async () => {
    const { authAccessToken } = get();

    if (!authAccessToken) {
      console.warn('⚠️ /auth/me skipped — no login access token stored');
      return;
    }

    try {
      console.log('👤 Calling GET /api/v1/auth/me with login access token...');
      const me = await fetchMe();
      console.log('👤 /auth/me response:', JSON.stringify(me, null, 2));

      if (isAuthenticatedMe(me)) {
        const user = mapLoginUserToAuthUser(me.data);
        set({ user });
        console.log('👤 /auth/me user mapped:', user);
      }
    } catch (error) {
      console.warn('⚠️ /auth/me failed:', error);
    }
  },

  initializeSession: async () => {
    set({ isAuthReady: false });

    try {
      /*
       * GET /api/v1/auth/me session restore — disabled until sign-out API is available.
       */
    } finally {
      set({ isAuthReady: true });
    }
  },

  clearSession: () => {
    disconnectSocket();
    useSubscriptionStore.getState().clear();
    void clearAuthSession().catch((error) => {
      if (__DEV__) {
        console.warn('⚠️ Failed to clear persisted auth session:', error);
      }
    });
    set({
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      authAccessToken: null,
      refreshToken: null,
      user: null,
      expiresAt: null,
    });
  },

  logout: () => {
    if (get().isLoggingOut) return;

    set({ isLoggingOut: true });
    const hadSession = Boolean(get().accessToken);

    get().clearSession();

    void (async () => {
      try {
        if (!hadSession) {
          set({ isLoggingOut: false });
          return;
        }

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
      } finally {
        set({ isLoggingOut: false });
      }
    })();
  },

  ensureAccessToken: async (force = false) => {
    const { accessToken, expiresAt, isLoggingOut, user } = get();

    if (isLoggingOut) {
      throw new Error('Session expired. Please log in again.');
    }

    if (
      !force &&
      accessToken &&
      expiresAt &&
      Date.now() < expiresAt - TOKEN_REFRESH_BUFFER_MS
    ) {
      return accessToken;
    }

    // Local testing: renew marketplace JWT via /auth/dev-token (not auth API refresh).
    try {
      const data = await fetchDevToken();
      const newAccessToken = applyDevTokenSession(data, set, user);

      if (__DEV__) {
        console.log('🔄 Dev-token refreshed — new access token stored');
      }

      return newAccessToken;
    } catch (error) {
      get().clearSession();
      throw error;
    }
  },

  ensureDevToken: async (force = false) => get().ensureAccessToken(force),
}));
