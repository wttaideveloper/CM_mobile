import { API_CONFIG } from '@/config';
import axios from 'axios';

const defaultHeaders = {
  'Content-Type': 'application/json',
} as const;

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

/** Published workflows for mobile checkout — uses join-tenant access token */
export const workflowClient = axios.create({
  baseURL: API_CONFIG.WORKFLOW_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...defaultHeaders,
    'X-Client': 'mobile',
  },
});

// Auth 401 refresh + error normalize live in interceptors.ts so expired
// login tokens can call POST /auth/refresh and retry.

if (__DEV__) {
  console.log('\n🔧 API Client Configuration:');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Auth Base URL:', API_CONFIG.AUTH_BASE_URL);
  console.log('Workflow Base URL:', API_CONFIG.WORKFLOW_BASE_URL);
  console.log('Timeout:', API_CONFIG.TIMEOUT, 'ms');
  console.log('---\n');
}

export default apiClient;
