import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/auth.store';
import { getApiErrorMessage } from '@/utils/apiError';

import { apiClient, authClient } from './client';
import { ENDPOINTS } from './endpoints';

let isRefreshing = false;

type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueuedRequest[] = [];

if (__DEV__) {
  console.log('🚀 API Interceptors initialized');
}

const devLog = (...args: unknown[]) => {
  if (!__DEV__) return;

  const first = args[0];
  if (typeof first === 'string' && first.includes('/typing')) {
    return;
  }

  console.log('[API]', ...args);
};

const processQueue = (error: unknown, token: string | null = null) => {
  devLog('Processing Failed Queue → count:', failedQueue.length);

  failedQueue.forEach((req) => {
    if (error) {
      req.reject(error);
    } else {
      req.resolve(token!);
    }
  });

  failedQueue = [];
};

authClient.interceptors.request.use(
  (config) => {
    // Auth API (/me, etc.) must use the login access token — not destin-token.
    const { authAccessToken } = useAuthStore.getState();
    if (authAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${authAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    devLog('↗ REQUEST:', config.url);

    // Same as old dev-token flow: attach login access_token to every main API call.
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      devLog('→ Attached login access token');
    }

    if (config.params) {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(config.params)) {
        const str = String(value);
        if (
          value !== undefined &&
          value !== null &&
          str.trim() !== '' &&
          str !== 'undefined' &&
          str !== 'null'
        ) {
          cleaned[key] = value;
        }
      }

      config.params = Object.keys(cleaned).length > 0 ? cleaned : undefined;
      devLog('→ Query Params:', config.params ?? {});
    }

    if (config.url?.includes('undefined')) {
      devLog("⚠️ Found 'undefined' in URL — cleaning...");
      config.url = config.url
        .replace(/[?&][^=]*=undefined/g, '')
        .replace(/[?&]$/, '');
    }

    // Multipart uploads must not use the default application/json Content-Type.
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    devLog('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    devLog('✔ RESPONSE:', response.config.url, 'Status:', response.status);
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const { isLoggingOut } = useAuthStore.getState();
      if (isLoggingOut) {
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          statusCode: 401,
        });
      }

      devLog('⚠️ 401 RECEIVED → Starting Refresh Flow');

      const isAuthEndpoint =
        originalRequest.url === ENDPOINTS.AUTH.DEV_TOKEN ||
        originalRequest.url === ENDPOINTS.AUTH.SIGNUP ||
        originalRequest.url === ENDPOINTS.AUTH.VERIFY_EMAIL ||
        originalRequest.url === ENDPOINTS.AUTH.LOGIN ||
        originalRequest.url === ENDPOINTS.AUTH.REFRESH;

      if (isAuthEndpoint) {
        devLog('❌ 401 from Auth Endpoint — Not Refreshing');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        devLog('⏳ Refresh already in progress → Queuing Request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            devLog('🔁 Retrying queued request');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      devLog('🔄 Refresh Token API Call');

      try {
        const newToken = await useAuthStore.getState().ensureAccessToken(true);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        devLog('❌ Token refresh FAILED:', refreshError);
        processQueue(refreshError, null);

        const { isAuthenticated, isLoggingOut } = useAuthStore.getState();
        if (isAuthenticated && !isLoggingOut) {
          useAuthStore.getState().clearSession();
        }

        return Promise.reject(refreshError);
      } finally {
        devLog('🔚 Refresh flow ended');
        isRefreshing = false;
      }
    }

    if (!error.response) {
      devLog('❌ NETWORK ERROR:', error);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      });
    }

    devLog('❌ API ERROR:', error.response.status, error.response.data);

    return Promise.reject({
      message: getApiErrorMessage(
        error.response.data as {
          message?: string;
          detail?: string | Array<{ msg?: string }>;
        },
      ),
      statusCode: error.response.status,
      errors: (error.response.data as { errors?: unknown })?.errors,
    });
  },
);

export {};
