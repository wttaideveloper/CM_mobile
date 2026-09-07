import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/auth.store';
import { getApiErrorMessage } from '@/utils/apiError';

import { apiClient, authClient, workflowClient } from './client';
import { ENDPOINTS } from './endpoints';

let isRefreshing = false;

type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueuedRequest[] = [];

const PUBLIC_AUTH_PATHS = new Set([
  ENDPOINTS.AUTH.DEV_TOKEN,
  ENDPOINTS.AUTH.SIGNUP,
  ENDPOINTS.AUTH.LOGIN,
  ENDPOINTS.AUTH.MOBILE_GOOGLE,
  ENDPOINTS.AUTH.MOBILE_FACEBOOK,
  ENDPOINTS.AUTH.COMPLETE_LOGIN,
  ENDPOINTS.AUTH.VERIFY_EMAIL,
  ENDPOINTS.AUTH.RESEND_VERIFICATION,
  ENDPOINTS.AUTH.PASSWORD_REQUIREMENTS,
  ENDPOINTS.AUTH.REFRESH,
  ENDPOINTS.AUTH.FORGOT_PASSWORD,
  ENDPOINTS.AUTH.VERIFY_RESET_CODE,
  ENDPOINTS.AUTH.RESET_PASSWORD,
  ENDPOINTS.AUTH.LOGOUT,
]);

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

function requestPath(url?: string): string {
  return url?.split('?')[0] ?? '';
}

function isPublicAuthRequest(url?: string): boolean {
  const path = requestPath(url);
  return PUBLIC_AUTH_PATHS.has(path) || path.endsWith('/auth/refresh');
}

function rejectApiError(error: AxiosError) {
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
}

async function attachTenantAccessToken(config: InternalAxiosRequestConfig) {
  const token = useAuthStore.getState().tenantAccessToken?.trim();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    devLog('→ Attached join-tenant token', config.url);
  }

  return config;
}

async function attachLoginAccessToken(config: InternalAxiosRequestConfig) {
  if (isPublicAuthRequest(config.url)) {
    return config;
  }

  const token = await useAuthStore.getState().ensureAccessToken(false);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    devLog('→ Attached login API access token', config.url);
  }

  return config;
}

async function refreshAndRetry(
  error: AxiosError,
  client: AxiosInstance,
) {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
    return rejectApiError(error);
  }

  if (isPublicAuthRequest(originalRequest.url)) {
    return rejectApiError(error);
  }

  const { isLoggingOut } = useAuthStore.getState();
  if (isLoggingOut) {
    return Promise.reject({
      message: 'Session expired. Please log in again.',
      statusCode: 401,
    });
  }

  devLog('⚠️ 401 RECEIVED → Starting Refresh Flow', originalRequest.url);

  if (isRefreshing) {
    devLog('⏳ Refresh already in progress → Queuing Request');
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  originalRequest._retry = true;
  isRefreshing = true;
  devLog('🔄 POST /api/v1/auth/refresh');

  try {
    const newToken = await useAuthStore.getState().ensureAccessToken(true);
    processQueue(null, newToken);
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return client(originalRequest);
  } catch (refreshError) {
    devLog('❌ Token refresh FAILED:', refreshError);
    processQueue(refreshError, null);

    const { isAuthenticated, isLoggingOut: loggingOut } = useAuthStore.getState();
    if (isAuthenticated && !loggingOut) {
      useAuthStore.getState().clearSession();
    }

    return Promise.reject({
      message: 'Session expired. Please log in again.',
      statusCode: 401,
    });
  } finally {
    devLog('🔚 Refresh flow ended');
    isRefreshing = false;
  }
}

authClient.interceptors.request.use(
  async (config) => attachLoginAccessToken(config),
  (error) => Promise.reject(error),
);

authClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => refreshAndRetry(error, authClient),
);

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    devLog('↗ REQUEST:', config.url);

    // TEMP: chat APIs use LOGIN access token. Destin-token kept for later:
    // const { accessToken } = useAuthStore.getState();
    // if (accessToken && config.headers) {
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    //   devLog('→ Attached destin-token');
    // }
    await attachLoginAccessToken(config);

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
  async (error: AxiosError) => refreshAndRetry(error, apiClient),
);

workflowClient.interceptors.request.use(
  async (config) => {
    devLog('↗ WORKFLOW REQUEST:', config.url);
    return attachTenantAccessToken(config);
  },
  (error) => Promise.reject(error),
);

workflowClient.interceptors.response.use(
  (response) => {
    devLog('✔ WORKFLOW RESPONSE:', response.config.url, 'Status:', response.status);
    return response;
  },
  async (error: AxiosError) => rejectApiError(error),
);

export {};
