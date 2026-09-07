import { create } from 'zustand';

import { markActiveChatReadOnLogout } from '@/services/chatRead.service';
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '@/services/authSession.storage';
import {
  fetchDevToken,
  fetchMe,
  fetchTenants,
  joinTenant,
  updateMyProfile,
  completeLogin,
  loginWithCredentials,
  mobileLogout,
  refreshSession,
} from '@/services/auth.service';
import {
  MobileOAuthCancelledError,
  openMobileSocialLogin,
} from '@/services/mobileOAuth.service';
import { updatePresenceStatus } from '@/services/presence.service';
import { unregisterDevicePushToken } from '@/services/pushRegistration.service';
import { connectSocket, disconnectSocket } from '@/services/socket/socket.client';
import { useSubscriptionStore } from '@/stores/subscription.store';
import type {
  AuthUser,
  AuthTenant,
  LoginRequest,
  LoginResponse,
  SocialAuthProvider,
  UpdateProfileRequest,
} from '@/types/auth.types';
import {
  getLoginAccessToken,
  isAuthenticatedMe,
  mapLoginUserToAuthUser,
} from '@/types/auth.types';

/** Login access token TTL is 300s; refresh when less than 45s remain. */
export const TOKEN_REFRESH_BUFFER_MS = 45_000;
/** Proactive refresh while the app stays open (before 5 min login-token expiry). */
export const LOGIN_TOKEN_REFRESH_INTERVAL_MS = 4 * 60_000;
/** Destin-token interval kept for later. */
export const DEV_TOKEN_REFRESH_INTERVAL_MS = 45 * 60_000;

let inFlightRefresh: Promise<string> | null = null;

type AuthState = {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  /** Marketplace JWT (dev-token) for main API / chat / socket. Switch to login JWT later. */
  accessToken: string | null;
  /** Login API access token — used for GET /auth/me and other auth-API calls. */
  authAccessToken: string | null;
  /** Join-tenant access token — used for workflow APIs only. */
  tenantAccessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  expiresAt: number | null;
  tenants: AuthTenant[];
  selectedTenant: AuthTenant | null;
  isTenantPickerVisible: boolean;
  isTenantPickerLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  /** Google / Facebook mobile OAuth → complete-login → same session as password login. */
  loginWithSocial: (provider: SocialAuthProvider, rememberMe?: boolean) => Promise<void>;
  selectTenant: (tenant: AuthTenant) => Promise<void>;
  dismissTenantPicker: () => void;
  loadCurrentUser: () => Promise<boolean>;
  /** Calls GET /auth/me with login token and logs the response (Me tab). */
  fetchAndLogMe: () => Promise<void>;
  /** PATCH /auth/me/profile with login token; updates stored user on success. */
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>;
  initializeSession: () => Promise<void>;
  clearSession: () => void;
  logout: () => void;
  /** Returns marketplace JWT (dev-token) for apiClient interceptors. */
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
    // Prefer real login profile for UI; fall back to destin-token user.
    user: loginUser ?? data.user,
    expiresAt,
  });

  connectSocket(accessToken);
  return accessToken;
}

/** TEMP testing: chat / socket use the same JWT as GET /auth/me (login, then join-tenant). */
function applyLoginAccessTokenSession(
  authAccessToken: string,
  loginUser: AuthUser,
  set: (partial: Partial<AuthState>) => void,
  expiresAt?: number,
): void {
  set({
    isAuthenticated: true,
    accessToken: authAccessToken,
    authAccessToken,
    user: loginUser,
    ...(expiresAt != null ? { expiresAt } : {}),
  });
  connectSocket(authAccessToken);
}

async function finishAuthenticatedLogin(
  response: LoginResponse,
  set: (partial: Partial<AuthState>) => void,
): Promise<void> {
  console.log('[Auth] finishAuthenticatedLogin — mapping login user + storing auth access token');
  const loginUser = mapLoginUserToAuthUser(response.data);
  const authAccessToken = getLoginAccessToken(response);
  const refreshToken = response.tokens.refresh_token ?? null;
  const authExpiresAt = getExpiresAt(response.tokens.expires_in);

  set({
    authAccessToken,
    refreshToken,
  });

  if (refreshToken?.trim()) {
    void saveAuthSession({
      accessToken: authAccessToken,
      refreshToken,
      expiresAt: authExpiresAt,
    }).catch((error) => {
      if (__DEV__) {
        console.warn('⚠️ Failed to persist auth session:', error);
      }
    });
  }

  console.log('[Auth] Auth login OK', {
    email: loginUser.email,
    id: loginUser.id,
    fullName: loginUser.fullName,
    hasAuthAccessToken: Boolean(authAccessToken),
    hasRefreshToken: Boolean(refreshToken),
  });

  // TEMP testing: skip destin-token; chat APIs use login / join-tenant JWT (same as /auth/me).
  // Restore destin-token after testing:
  // console.log('[Auth] Calling POST /api/v1/auth/dev-token…');
  // const destinToken = await fetchDevToken();
  // console.log('[Auth] destin-token response', {
  //   hasAccessToken: Boolean(destinToken.access_token),
  //   expires_in: destinToken.expires_in,
  //   user: destinToken.user
  //     ? { id: destinToken.user.id, email: destinToken.user.email }
  //     : null,
  // });
  // applyDevTokenSession(destinToken, set, loginUser);
  // console.log('[Auth] Dev-token stored — attached to main API requests via interceptor');

  applyLoginAccessTokenSession(authAccessToken, loginUser, set, authExpiresAt);
  console.log('[Auth] Admin + chat APIs using LOGIN access token (destin-token commented for later)');

  void useSubscriptionStore
    .getState()
    .loadChatEligibility()
    .catch((eligibilityError) => {
      console.warn('[Auth] Chat eligibility check failed:', eligibilityError);
    });
}

async function openTenantPickerAfterLogin(
  set: (partial: Partial<AuthState>) => void,
): Promise<void> {
  set({ isTenantPickerLoading: true, isTenantPickerVisible: true, tenants: [] });
  try {
    const response = await fetchTenants();
    set({
      tenants: response.data ?? [],
      isTenantPickerLoading: false,
      isTenantPickerVisible: true,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[Auth] GET /auth/tenants failed:', error);
    }
    set({
      tenants: [],
      isTenantPickerLoading: false,
      isTenantPickerVisible: true,
    });
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isAuthReady: false,
  isLoading: false,
  isLoggingOut: false,
  accessToken: null,
  authAccessToken: null,
  tenantAccessToken: null,
  refreshToken: null,
  user: null,
  expiresAt: null,
  tenants: [],
  selectedTenant: null,
  isTenantPickerVisible: false,
  isTenantPickerLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });

    try {
      const response = await loginWithCredentials(credentials);
      await finishAuthenticatedLogin(response, set);
      set({ isLoading: false });
      // TEMP: skip Select tenant modal after login
      // void openTenantPickerAfterLogin(set);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithSocial: async (provider, rememberMe = false) => {
    console.log(`[Social OAuth:${provider}] STEP 1 — loginWithSocial started`, {
      provider,
      rememberMe,
    });
    set({ isLoading: true });

    try {
      console.log(`[Social OAuth:${provider}] STEP 1 → open browser / wait for redirect`);
      const sessionCode = await openMobileSocialLogin(provider, rememberMe);

      console.log(`[Social OAuth:${provider}] STEP 5 → exchange session code for tokens`);
      const response = await completeLogin({ sessionCode });

      console.log(`[Social OAuth:${provider}] STEP 6 — finishAuthenticatedLogin (store auth token + fetch destin-token)`);
      await finishAuthenticatedLogin(response, set);

      console.log(`[Social OAuth:${provider}] STEP 7 — DONE — social login success`, {
        userEmail: get().user?.email,
        userId: get().user?.id,
        hasAuthAccessToken: Boolean(get().authAccessToken),
        hasDevAccessToken: Boolean(get().accessToken),
      });
      set({ isLoading: false });
      // TEMP: skip Select tenant modal after login
      // void openTenantPickerAfterLogin(set);
    } catch (error) {
      set({ isLoading: false });

      if (error instanceof MobileOAuthCancelledError) {
        console.log(`[Social OAuth:${provider}] CANCELLED by user`);
        return;
      }

      console.error(`[Social OAuth:${provider}] FAILED`, error);
      throw error;
    }
  },

  loadCurrentUser: async () => {
    return Boolean(get().accessToken && get().user);
  },

  selectTenant: async (tenant) => {
    const refreshToken = get().refreshToken?.trim();
    if (!refreshToken) {
      throw new Error('Missing refresh token. Please log in again.');
    }

    const response = await joinTenant({
      tenantSlug: tenant.slug,
      refreshToken,
    });

    const nextAccess = response.tokens?.access_token?.trim();
    const nextRefresh = response.tokens?.refresh_token?.trim() || refreshToken;
    const joinedUser = response.data?.user;

    if (!nextAccess) {
      throw new Error('Join tenant succeeded but no access token was returned.');
    }

    const nextUser = joinedUser ? mapLoginUserToAuthUser(joinedUser) : get().user;
    const loginAccessToken = get().accessToken;
    const loginRefreshToken = get().refreshToken ?? nextRefresh;
    const loginExpiresAt = get().expiresAt ?? getExpiresAt(response.tokens.expires_in);

    set({
      // TEMP: admin + chat keep LOGIN access token. Join-tenant token kept for workflow APIs:
      tenantAccessToken: nextAccess,
      // authAccessToken: nextAccess,
      // accessToken: nextAccess,
      // refreshToken: nextRefresh,
      selectedTenant: tenant,
      user: nextUser,
      isTenantPickerVisible: false,
      isTenantPickerLoading: false,
    });

    // Destin-token / join-token socket swap kept for later:
    // connectSocket(nextAccess);

    void saveAuthSession({
      accessToken: loginAccessToken ?? nextAccess,
      refreshToken: loginRefreshToken,
      expiresAt: loginExpiresAt,
      tenantAccessToken: nextAccess,
      tenantSlug: tenant.slug,
    }).catch(() => {});

    if (__DEV__) {
      console.log('[Auth] Join tenant OK — admin + chat still use LOGIN access token', {
        tenantSlug: response.data?.tenant?.slug ?? tenant.slug,
        tenantRole: joinedUser?.roles?.tenantRole ?? joinedUser?.membership?.tenantRole,
      });
    }
  },

  dismissTenantPicker: () => {
    set({ isTenantPickerVisible: false, isTenantPickerLoading: false });
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
      const stored = await loadAuthSession();
      if (!stored?.accessToken?.trim() || !stored?.refreshToken?.trim()) {
        if (__DEV__) {
          console.log('[Auth] No persisted session — show auth flow');
        }
        return;
      }

      set({
        authAccessToken: stored.accessToken,
        tenantAccessToken: stored.tenantAccessToken?.trim() || null,
        refreshToken: stored.refreshToken,
      });

      if (__DEV__) {
        console.log('[Auth] Restoring session — GET /api/v1/auth/me');
      }

      let me = await fetchMe().catch(() => null);

      if (!me || !isAuthenticatedMe(me)) {
        if (__DEV__) {
          console.log('[Auth] /auth/me not authenticated — trying refresh');
        }
        try {
          const refreshed = await refreshSession({ refresh_token: stored.refreshToken });
          const authAccessToken = getLoginAccessToken(refreshed);
          const refreshToken = refreshed.tokens.refresh_token?.trim() || stored.refreshToken;
          set({ authAccessToken, refreshToken });
          await saveAuthSession({
            accessToken: authAccessToken,
            refreshToken,
            expiresAt: getExpiresAt(refreshed.tokens.expires_in),
            tenantAccessToken: stored.tenantAccessToken,
            tenantSlug: stored.tenantSlug,
          });
          me = {
            authenticated: true,
            message: refreshed.message,
            data: refreshed.data,
          };
        } catch (refreshError) {
          if (__DEV__) {
            console.warn('[Auth] Session restore failed — clearing', refreshError);
          }
          await clearAuthSession().catch(() => {});
          set({
            authAccessToken: null,
            tenantAccessToken: null,
            refreshToken: null,
          });
          return;
        }
      }

      if (!isAuthenticatedMe(me)) {
        await clearAuthSession().catch(() => {});
        set({ authAccessToken: null, tenantAccessToken: null, refreshToken: null });
        return;
      }

      const loginUser = mapLoginUserToAuthUser(me.data);
      const restoredAccessToken = get().authAccessToken;
      if (!restoredAccessToken) {
        await clearAuthSession().catch(() => {});
        set({ authAccessToken: null, tenantAccessToken: null, refreshToken: null });
        return;
      }

      if (__DEV__) {
        // console.log('[Auth] Session valid — fetching destin-token for main API', {
        console.log('[Auth] Session valid — using stored LOGIN access token for chat APIs', {
          email: loginUser.email,
          id: loginUser.id,
        });
      }

      // TEMP testing: skip destin-token on restore.
      // const destinToken = await fetchDevToken();
      // applyDevTokenSession(destinToken, set, loginUser);
      applyLoginAccessTokenSession(
        restoredAccessToken,
        loginUser,
        set,
        stored.expiresAt,
      );

      void useSubscriptionStore
        .getState()
        .loadChatEligibility()
        .catch((eligibilityError) => {
          console.warn('[Auth] Chat eligibility check failed:', eligibilityError);
        });

      if (__DEV__) {
        console.log('[Auth] Session restored — opening app as authenticated');
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[Auth] initializeSession error — clearing session', error);
      }
      await clearAuthSession().catch(() => {});
      set({
        isAuthenticated: false,
        accessToken: null,
        authAccessToken: null,
        refreshToken: null,
        user: null,
        expiresAt: null,
      });
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
      tenantAccessToken: null,
      refreshToken: null,
      user: null,
      expiresAt: null,
      tenants: [],
      selectedTenant: null,
      isTenantPickerVisible: false,
      isTenantPickerLoading: false,
    });
  },

  logout: () => {
    if (get().isLoggingOut) return;

    set({ isLoggingOut: true });
    const hadSession = Boolean(get().accessToken);
    const refreshToken = get().refreshToken;

    get().clearSession();

    void (async () => {
      try {
        if (refreshToken?.trim()) {
          await mobileLogout(refreshToken);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('⚠️ Mobile logout API failed:', error);
        }
      }

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
    const { accessToken, expiresAt, isLoggingOut, refreshToken, user } = get();

    if (isLoggingOut) {
      throw new Error('Session expired. Please log in again.');
    }

    const isFresh =
      Boolean(accessToken) &&
      Boolean(expiresAt) &&
      Date.now() < expiresAt - TOKEN_REFRESH_BUFFER_MS;

    if (!force && isFresh && accessToken) {
      return accessToken;
    }

    if (inFlightRefresh) {
      return inFlightRefresh;
    }

    /*
     * --- LOGIN JWT REFRESH (switch in a few days) ---
     * Replace the destin-token refresh below with refreshSession + login access token.
     * Also re-enable: import { refreshSession } from '@/services/auth.service';
     */

    // Destin-token refresh kept for later:
    // try {
    //   const data = await fetchDevToken();
    //   const newAccessToken = applyDevTokenSession(data, set, user);
    //   if (__DEV__) {
    //     console.log('🔄 Dev-token refreshed — new access token stored');
    //   }
    //   return newAccessToken;
    // } catch (error) {
    //   get().clearSession();
    //   throw error;
    // }

    if (!refreshToken?.trim()) {
      get().clearSession();
      throw new Error('Session expired. Please log in again.');
    }

    inFlightRefresh = (async () => {
      try {
        if (__DEV__) {
          console.log('[Auth] POST /api/v1/auth/refresh — exchanging refresh token');
        }

        const refreshed = await refreshSession({ refresh_token: refreshToken });
        const nextAccess = getLoginAccessToken(refreshed);
        const nextRefresh = refreshed.tokens.refresh_token?.trim() || refreshToken;
        const nextExpiresAt = getExpiresAt(refreshed.tokens.expires_in);
        const nextUser = mapLoginUserToAuthUser(refreshed.data);

        set({
          authAccessToken: nextAccess,
          accessToken: nextAccess,
          refreshToken: nextRefresh,
          expiresAt: nextExpiresAt,
          user: nextUser ?? user,
        });
        connectSocket(nextAccess);

        await saveAuthSession({
          accessToken: nextAccess,
          refreshToken: nextRefresh,
          expiresAt: nextExpiresAt,
        });

        if (__DEV__) {
          console.log('[Auth] Refresh OK — new login access token stored', {
            expires_in: refreshed.tokens.expires_in,
          });
        }

        return nextAccess;
      } catch (error) {
        get().clearSession();
        throw error;
      } finally {
        inFlightRefresh = null;
      }
    })();

    return inFlightRefresh;
  },

  ensureDevToken: async (force = false) => get().ensureAccessToken(force),
}));
