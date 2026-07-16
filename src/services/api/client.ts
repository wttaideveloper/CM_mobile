import { API_CONFIG } from '@/config';
import { getApiErrorMessage } from '@/utils/apiError';
import axios, { type AxiosError } from 'axios';

const defaultHeaders = {
  'Content-Type': 'application/json',
} as const;

const normalizeApiError = (error: AxiosError) => {
  if (!error.response) {
    return Promise.reject({
      message: 'Network error. Please check your connection.',
      statusCode: 0,
    });
  }

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
};

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...defaultHeaders,
    'X-Client': 'mobile',
  },
});

/** Signup, login, refresh — native/external-user auth */
export const authClient = axios.create({
  baseURL: API_CONFIG.AUTH_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...defaultHeaders,
    'X-Client': 'mobile',
  },
});

authClient.interceptors.response.use((response) => response, normalizeApiError);

if (__DEV__) {
  console.log('\n🔧 API Client Configuration:');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Auth Base URL:', API_CONFIG.AUTH_BASE_URL);
  console.log('Timeout:', API_CONFIG.TIMEOUT, 'ms');
  console.log('---\n');
}

export default apiClient;
