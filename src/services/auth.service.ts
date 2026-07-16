import { DEV_USER } from '@/constants/devUser';
import type {
  AuthMeResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
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

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const response = await authClient.post<SignupResponse>(ENDPOINTS.AUTH.SIGNUP, payload);
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
