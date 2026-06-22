import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { apiClient } from './client';
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
  if (__DEV__) console.log('[API]', ...args);
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

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    devLog('↗ REQUEST:', config.url);

    // TODO: attach auth token when login is implemented
    // const { accessToken } = await tokenStorage.getTokens();
    // if (accessToken && config.headers) {
    //   devLog('→ Attached Access Token');
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    //   config.headers['Cache-Control'] = 'no-cache';
    //   config.headers.Pragma = 'no-cache';
    // }

    if (config.params) {
      devLog('→ Cleaning Query Params');

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
    }

    if (config.url?.includes('undefined')) {
      devLog("⚠️ Found 'undefined' in URL — cleaning...");
      config.url = config.url
        .replace(/[?&][^=]*=undefined/g, '')
        .replace(/[?&]$/, '');
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
      devLog('⚠️ 401 RECEIVED → Starting Refresh Flow');

      const isAuthEndpoint =
        originalRequest.url === ENDPOINTS.AUTH.LOGIN ||
        originalRequest.url === ENDPOINTS.AUTH.REFRESH_TOKEN;

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
        // TODO: implement refresh token flow when auth is added
        // const { refreshToken } = await tokenStorage.getTokens();
        // if (!refreshToken) throw new Error('No refresh token available');
        // const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
        // const { accessToken, refreshToken: newRefreshToken } = response.data;
        // await tokenStorage.setTokens(accessToken, newRefreshToken);
        // processQueue(null, accessToken);
        // originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        // return apiClient(originalRequest);

        throw new Error('Refresh token flow not implemented');
      } catch (refreshError) {
        devLog('❌ Refresh FAILED:', refreshError);
        processQueue(refreshError, null);

        // TODO: logout when auth store supports tokens
        // await useAuthStore.getState().logout();

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
      message:
        (error.response.data as { message?: string })?.message || 'An error occurred',
      statusCode: error.response.status,
      errors: (error.response.data as { errors?: unknown })?.errors,
    });
  },
);

export {};
