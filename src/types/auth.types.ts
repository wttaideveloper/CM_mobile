export type DevTokenRequest = {
  email: string;
  role: string;
  user_id: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  preferredLocale?: string | null;
  emailVerified?: boolean;
  role?: string;
};

export type DevTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
};

export type LoginUserData = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  preferredLocale?: string | null;
  emailVerified?: boolean;
  groups?: string[];
  userId: string;
  membership?: {
    tenantRole?: string;
    userRole?: string;
  } | null;
  roles?: {
    tenantRole?: string;
    userRole?: string;
  } | null;
};

export type LoginResponse = {
  message: string;
  data: LoginUserData;
  tokens: AuthTokens;
};

export type RefreshSessionRequest = {
  refresh_token: string;
};

export type RefreshSessionResponse = LoginResponse;

export function getLoginAccessToken(response: LoginResponse): string {
  const accessToken = response.tokens?.access_token?.trim();
  if (!accessToken) {
    throw new Error('Login succeeded but no access token was returned.');
  }
  return accessToken;
}

export function mapLoginUserToAuthUser(data: LoginUserData): AuthUser {
  return {
    id: data.userId || data.id,
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
    address: data.address,
    country: data.country,
    preferredLocale: data.preferredLocale,
    emailVerified: data.emailVerified,
    role: data.roles?.userRole || data.membership?.userRole || data.membership?.tenantRole,
  };
}

export type UpdateProfileRequest = {
  fullName?: string;
  phone?: string;
  address?: string;
  country?: string;
  preferredLocale?: string;
};

export type UpdateProfileResponse = {
  message: string;
  data: LoginUserData;
};

export type SignupRequest = {
  email: string;
  password: string;
  fullName: string;
};

export type SignupUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  address?: string | null;
  preferredLocale?: string | null;
  emailVerified?: boolean;
  groups?: string[];
};

export type SignupResponse = {
  message: string;
  data: {
    user: SignupUser;
  };
};

export type VerifyEmailRequest = {
  email: string;
  otp: string;
};

export type VerifyEmailResponse = {
  message: string;
  data: {
    user: LoginUserData;
    userId: string;
  };
};

export type ResendVerificationRequest = {
  email: string;
};

export type ResendVerificationResponse = {
  message: string;
  data: LoginUserData;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  data: {
    message: string;
  };
};

export type VerifyResetCodeRequest = {
  email: string;
  otp: string;
};

export type VerifyResetCodeResponse = {
  message: string;
  data: {
    email: string;
    verified: boolean;
  };
};

/** After verify-reset-code, server accepts email + password only. */
export type ResetPasswordRequest = {
  email: string;
  password: string;
};

export type ResetPasswordResponse = {
  message: string;
  data: {
    message: string;
  };
};

export type AuthTokenExpiry = {
  emailOtpSeconds: number;
  emailOtpResendCooldownSeconds: number;
  inviteLinkSeconds: number;
  passwordResetSeconds: number;
};

export type PasswordRequirements = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialCharacter: boolean;
  summary: string;
  tokenExpiry: AuthTokenExpiry;
};

export type PasswordRequirementsResponse = {
  message: string;
  data: PasswordRequirements;
};

/** GET /api/v1/auth/me — 200 even when not signed in (no 401). */
export type AuthMeResponse = {
  authenticated: boolean;
  message: string;
  data: LoginUserData | null;
};

export function isAuthenticatedMe(
  me: AuthMeResponse,
): me is AuthMeResponse & { authenticated: true; data: LoginUserData } {
  return me.authenticated && me.data != null;
}
