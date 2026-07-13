import { API_CONFIG } from '@/config';
import axios from 'axios';

const defaultHeaders = {
  'Content-Type': 'application/json',
} as const;

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: defaultHeaders,
});

/** Dev-token login only — uses AUTH_DEV_BASE_URL */
export const authDevClient = axios.create({
  baseURL: API_CONFIG.AUTH_DEV_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: defaultHeaders,
});

if (__DEV__) {
  console.log('\n🔧 API Client Configuration:');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('Auth Dev Base URL:', API_CONFIG.AUTH_DEV_BASE_URL);
  console.log('Timeout:', API_CONFIG.TIMEOUT, 'ms');
  console.log('---\n');
}

export default apiClient;
