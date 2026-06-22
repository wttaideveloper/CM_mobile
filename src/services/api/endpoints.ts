export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },

  ENTERPRISES: {
    GET_ALL: '/api/v1/api/enterprises/',
    GET_BY_ID: (id: string) => `/api/v1/api/enterprises/${id}`,
  },

  PRODUCTS: {
    GET_ALL: '/api/v1/api/products/',
    GET_BY_ID: (id: string) => `/api/v1/api/products/${id}`,
  },

  SERVICES: {
    GET_ALL: '/api/v1/api/services/',
    GET_BY_ID: (id: string) => `/api/v1/api/services/${id}`,
  },
} as const;
