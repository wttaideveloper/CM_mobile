export type DevTokenRequest = {
  email: string;
  role: string;
  user_id: string;
};

export type AuthUser = {
  id: string;
  role: string;
  email: string;
};

export type DevTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};
