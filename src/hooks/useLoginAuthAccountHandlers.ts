import { Alert } from 'react-native';

import { resendVerification, signup, verifyEmail } from '@/services/auth.service';
import type { ApiError } from '@/types/api.types';
import type { PasswordRequirements } from '@/types/auth.types';
import { validatePassword } from '@/utils/passwordValidation';

import { type AuthMode } from '@/hooks/useLoginAuth.types';

type LoginAuthAccountHandlerDeps = {
  email: string;
  password: string;
  name: string;
  otp: string;
  rememberMe: boolean;
  acceptedTerms: boolean;
  isSubmitting: boolean;
  isResending: boolean;
  resendCooldown: number;
  resendCooldownSeconds: number;
  passwordRequirements: PasswordRequirements;
  login: (params: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  loginWithSocial: (provider: 'google' | 'facebook', rememberMe: boolean) => Promise<void>;
  setIsSigningUp: (value: boolean) => void;
  setIsVerifying: (value: boolean) => void;
  setIsResending: (value: boolean) => void;
  setOtp: (value: string) => void;
  setAuthMode: (mode: AuthMode) => void;
  startResendCooldown: (seconds: number) => void;
  openVerifyMode: () => void;
  openLoginMode: () => void;
  isEmailNotVerifiedMessage: (message: string) => boolean;
};

export function createLoginAuthAccountHandlers(deps: LoginAuthAccountHandlerDeps) {
  const handleLogin = async () => {
    const trimmedEmail = deps.email.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (!deps.password.trim()) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }

    try {
      await deps.login({
        email: trimmedEmail,
        password: deps.password,
        rememberMe: deps.rememberMe,
      });
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.message ||
        'Could not log in. Check your credentials and try again.';

      // 403 + "Email not verified..." → offer verify; on confirm, resend OTP then open verify UI.
      if (deps.isEmailNotVerifiedMessage(message)) {
        Alert.alert(
          'Email not verified',
          'We will send a verification code to your email. Enter it to verify your account.',
          [
            {
              text: 'Verify now',
              onPress: () => {
                void (async () => {
                  deps.setOtp('');
                  deps.setIsResending(true);
                  try {
                    await resendVerification({ email: trimmedEmail });
                    deps.startResendCooldown(deps.resendCooldownSeconds);
                    deps.openVerifyMode();
                  } catch (resendError) {
                    const resendApiError = resendError as ApiError;
                    Alert.alert(
                      'Could not send code',
                      resendApiError?.message ||
                        'Please check your connection and try again.',
                    );
                    deps.openVerifyMode();
                  } finally {
                    deps.setIsResending(false);
                  }
                })();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
        return;
      }

      Alert.alert('Login failed', message);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    console.log(`[Social OAuth:${provider}] UI — icon tapped`, {
      provider,
      rememberMe: deps.rememberMe,
      isSubmitting: deps.isSubmitting,
    });

    if (deps.isSubmitting) {
      console.log(`[Social OAuth:${provider}] UI — ignored (already submitting)`);
      return;
    }

    try {
      await deps.loginWithSocial(provider, deps.rememberMe);
      console.log(`[Social OAuth:${provider}] UI — loginWithSocial finished OK`);
    } catch (error) {
      console.error(`[Social OAuth:${provider}] UI — loginWithSocial error`, error);
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : `Could not log in with ${provider}. Please try again.`;

      Alert.alert(
        `${provider === 'google' ? 'Google' : 'Facebook'} login failed`,
        message,
      );
    }
  };

  const handleCreateAccount = async () => {
    const trimmedName = deps.name.trim();
    const trimmedEmail = deps.email.trim();

    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (!deps.password.trim()) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }

    if (!deps.acceptedTerms) {
      Alert.alert(
        'Terms required',
        'Please agree to the Terms and Privacy Policy to continue.',
      );
      return;
    }

    const passwordError = validatePassword(deps.password, deps.passwordRequirements);
    if (passwordError) {
      Alert.alert('Invalid password', passwordError);
      return;
    }

    deps.setIsSigningUp(true);

    try {
      await signup({
        email: trimmedEmail,
        password: deps.password,
        fullName: trimmedName,
      });

      deps.setOtp('');
      deps.startResendCooldown(deps.resendCooldownSeconds);
      deps.setAuthMode('verify');
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.message ||
        'Could not create account. Check your connection and try again.';

      Alert.alert(
        apiError?.statusCode === 409 ? 'Account already exists' : 'Create account failed',
        message,
      );
    } finally {
      deps.setIsSigningUp(false);
    }
  };

  const handleVerifyEmail = async () => {
    const trimmedEmail = deps.email.trim();
    const trimmedOtp = deps.otp.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (trimmedOtp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit verification code.');
      return;
    }

    deps.setIsVerifying(true);

    try {
      const response = await verifyEmail({
        email: trimmedEmail,
        otp: trimmedOtp,
      });

      Alert.alert(
        'Email verified',
        response.message || 'Your email has been verified. Please log in.',
        [{ text: 'Login', onPress: deps.openLoginMode }],
      );
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.message ||
        'Could not verify your email. Check the code and try again.';

      Alert.alert('Verification failed', message);
    } finally {
      deps.setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    const trimmedEmail = deps.email.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (deps.resendCooldown > 0 || deps.isResending) return;

    deps.setIsResending(true);

    try {
      const response = await resendVerification({ email: trimmedEmail });
      deps.setOtp('');
      deps.startResendCooldown(deps.resendCooldownSeconds);
      Alert.alert(
        'Code sent',
        response.message || 'A new verification code was sent to your email.',
      );
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Could not resend code',
        apiError?.message || 'Please check your connection and try again.',
      );
    } finally {
      deps.setIsResending(false);
    }
  };

  return {
    handleLogin,
    handleSocialLogin,
    handleCreateAccount,
    handleVerifyEmail,
    handleResendVerification,
  };
}
