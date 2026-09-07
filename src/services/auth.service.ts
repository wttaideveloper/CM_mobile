import { DEV_USER } from '@/constants/devUser';
import type {
  AuthMeResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  CompleteLoginRequest,
  DevTokenResponse,
  LoginRequest,
  LoginResponse,
  PasswordRequirementsResponse,
  RefreshSessionRequest,
  RefreshSessionResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignupRequest,
  SignupResponse,
  AuthTenantsResponse,
  JoinTenantRequest,
  JoinTenantResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '@/types/auth.types';

import { apiClient, authClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export async function fetchPasswordRequirements(): Promise<PasswordRequirementsResponse> {
  const response = await authClient.get<PasswordRequirementsResponse>(
    ENDPOINTS.AUTH.PASSWORD_REQUIREMENTS,
  );
  return response.data;
}

/** GET /api/v1/auth/me — uses login access token via authClient (not destin-token). */
export async function fetchMe(): Promise<AuthMeResponse> {
  const response = await authClient.get<AuthMeResponse>(ENDPOINTS.AUTH.ME);
  return response.data;
}

/** PATCH /api/v1/auth/me/profile — uses login access token via authClient (not destin-token). */
export async function updateMyProfile(payload: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const response = await authClient.patch<UpdateProfileResponse>(
    ENDPOINTS.AUTH.ME_PROFILE,
    payload,
  );
  return response.data;
}

export async function loginWithCredentials(payload: LoginRequest): Promise<LoginResponse> {
  const response = await authClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload);
  return response.data;
}

/** POST /api/v1/auth/complete-login — exchange OAuth he_session_code for tokens. */
export async function completeLogin(payload: CompleteLoginRequest): Promise<LoginResponse> {
  const url = ENDPOINTS.AUTH.COMPLETE_LOGIN;
  console.log('[Social OAuth] STEP 5 — POST complete-login', {
    url,
    body: {
      sessionCode: payload.sessionCode
        ? `${payload.sessionCode.slice(0, 8)}…(${payload.sessionCode.length} chars)`
        : null,
    },
  });

  try {
    const response = await authClient.post<LoginResponse>(url, payload);
    console.log('[Social OAuth] STEP 5 — complete-login response', {
      status: response.status,
      hasTokens: Boolean(response.data?.tokens),
      hasAccessToken: Boolean(response.data?.tokens?.access_token),
      hasRefreshToken: Boolean(response.data?.tokens?.refresh_token),
      expires_in: response.data?.tokens?.expires_in,
      user: response.data?.data
        ? {
            id: response.data.data.id,
            email: response.data.data.email,
            fullName: response.data.data.fullName,
          }
        : null,
      raw: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('[Social OAuth] STEP 5 — complete-login FAILED', error);
    throw error;
  }
}

/** POST /api/v1/auth/signup — end-user signup; module is always "enterprise". */
export async function signup(
  payload: Omit<SignupRequest, 'module'>,
): Promise<SignupResponse> {
  const body: SignupRequest = {
    ...payload,
    module: 'enterprise',
  };
  const response = await authClient.post<SignupResponse>(ENDPOINTS.AUTH.SIGNUP, body);
  return response.data;
}

export async function verifyEmail(payload: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  const response = await authClient.post<VerifyEmailResponse>(
    ENDPOINTS.AUTH.VERIFY_EMAIL,
    payload,
  );
  return response.data;
}

export async function resendVerification(
  payload: ResendVerificationRequest,
): Promise<ResendVerificationResponse> {
  const response = await authClient.post<ResendVerificationResponse>(
    ENDPOINTS.AUTH.RESEND_VERIFICATION,
    payload,
  );
  return response.data;
}

export async function refreshSession(
  payload: RefreshSessionRequest,
): Promise<RefreshSessionResponse> {
  const response = await authClient.post<RefreshSessionResponse>(ENDPOINTS.AUTH.REFRESH, payload);
  return response.data;
}

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  const response = await authClient.post<ForgotPasswordResponse>(
    ENDPOINTS.AUTH.FORGOT_PASSWORD,
    payload,
  );
  return response.data;
}

export async function verifyResetCode(
  payload: VerifyResetCodeRequest,
): Promise<VerifyResetCodeResponse> {
  const response = await authClient.post<VerifyResetCodeResponse>(
    ENDPOINTS.AUTH.VERIFY_RESET_CODE,
    payload,
  );
  return response.data;
}

export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response = await authClient.post<ResetPasswordResponse>(
    ENDPOINTS.AUTH.RESET_PASSWORD,
    payload,
  );
  return response.data;
}

/** POST /api/v1/auth/join-tenant — attach tenant claims; uses login access token header. */
export async function joinTenant(payload: JoinTenantRequest): Promise<JoinTenantResponse> {
  const response = await authClient.post<JoinTenantResponse>(ENDPOINTS.AUTH.JOIN_TENANT, payload);
  return response.data;
}

/** GET /api/v1/auth/tenants?module=enterprise — active organizations. */
export async function fetchTenants(): Promise<AuthTenantsResponse> {
  const response = await authClient.get<AuthTenantsResponse>(ENDPOINTS.AUTH.TENANTS, {
    params: { module: 'enterprise' },
  });
  return response.data;
}

/** POST /api/v1/auth/mobile/logout — revoke refresh token server-side. */
export async function mobileLogout(refreshToken: string): Promise<{ message: string }> {
  const response = await authClient.post<{ message: string }>(ENDPOINTS.AUTH.LOGOUT, {
    refreshToken,
  });
  return response.data;
}

/**
 * Local marketplace JWT for main API / Socket.IO (BASE_URL).
 * Requires ENABLE_DEV_TOKEN=true on the marketplace server.
 */
export async function fetchDevToken(): Promise<DevTokenResponse> {
  const response = await apiClient.post<DevTokenResponse>(ENDPOINTS.AUTH.DEV_TOKEN, {
    email: DEV_USER.email,
    role: DEV_USER.role,
    user_id: DEV_USER.user_id,
  });

  return response.data;
}
