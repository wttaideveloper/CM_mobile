/** Static test IDs — see GET /api/v1/auth/test-users */
export const DEV_USER = {
  email: 'dev@localhost',
  role: 'customer',
  user_id: '550e8400-e29b-41d4-a716-446655440030',
} as const;

export const DEV_PROVIDER = {
  role: 'provider',
  user_id: '550e8400-e29b-41d4-a716-446655440020',
} as const;

export const DEV_ADMIN = {
  user_id: '550e8400-e29b-41d4-a716-446655440000',
} as const;
