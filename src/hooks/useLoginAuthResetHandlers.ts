import { Alert } from 'react-native';

import { forgotPassword, resetPassword, verifyResetCode } from '@/services/auth.service';
import type { ApiError } from '@/types/api.types';
import type { PasswordRequirements } from '@/types/auth.types';
import { validatePassword } from '@/utils/passwordValidation';

type LoginAuthResetHandlerDeps = {
  forgotEmail: string;
  resetOtp: string;
  newPassword: string;
  confirmPassword: string;
  forgotResendCooldown: number;
  resendCooldownSeconds: number;
  passwordRequirements: PasswordRequirements;
  isForgotPasswordSending: boolean;
  isVerifyingResetCode: boolean;
  setIsForgotPasswordSending: (value: boolean) => void;
  setIsVerifyingResetCode: (value: boolean) => void;
  setIsResettingPassword: (value: boolean) => void;
  setResetOtp: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  startForgotResendCooldown: (seconds: number) => void;
  openVerifyResetMode: () => void;
  openResetPasswordMode: () => void;
  openLoginMode: () => void;
};

export function createLoginAuthResetHandlers(deps: LoginAuthResetHandlerDeps) {
  const handleSendForgotPassword = async () => {
    const trimmedEmail = deps.forgotEmail.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (deps.isForgotPasswordSending) return;

    deps.setIsForgotPasswordSending(true);

    try {
      const response = await forgotPassword({ email: trimmedEmail });
      deps.startForgotResendCooldown(deps.resendCooldownSeconds);
      Alert.alert(
        'Check your email',
        response.data?.message ||
          response.message ||
          'If an account exists for that email, a reset code is being sent.',
        [{ text: 'OK', onPress: deps.openVerifyResetMode }],
      );
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Could not send reset code',
        apiError?.message || 'Please check your connection and try again.',
      );
    } finally {
      deps.setIsForgotPasswordSending(false);
    }
  };

  const handleResendResetCode = async () => {
    const trimmedEmail = deps.forgotEmail.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (deps.forgotResendCooldown > 0 || deps.isForgotPasswordSending) return;

    deps.setIsForgotPasswordSending(true);

    try {
      const response = await forgotPassword({ email: trimmedEmail });
      deps.setResetOtp('');
      deps.startForgotResendCooldown(deps.resendCooldownSeconds);
      Alert.alert(
        'Code sent',
        response.data?.message ||
          response.message ||
          'A new reset code was sent to your email.',
      );
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Could not resend code',
        apiError?.message || 'Please check your connection and try again.',
      );
    } finally {
      deps.setIsForgotPasswordSending(false);
    }
  };

  const handleVerifyResetCode = async () => {
    const trimmedEmail = deps.forgotEmail.trim();
    const trimmedOtp = deps.resetOtp.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (trimmedOtp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit reset code.');
      return;
    }

    if (deps.isVerifyingResetCode) return;

    deps.setIsVerifyingResetCode(true);

    try {
      const response = await verifyResetCode({
        email: trimmedEmail,
        otp: trimmedOtp,
      });

      if (!response.data?.verified) {
        Alert.alert('Verification failed', 'The reset code could not be verified. Please try again.');
        return;
      }

      deps.openResetPasswordMode();
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Wrong code',
        apiError?.message ||
          'The reset code is incorrect or expired. Check your latest email or request a new code.',
      );
    } finally {
      deps.setIsVerifyingResetCode(false);
    }
  };

  const handleResetPassword = async () => {
    const trimmedEmail = deps.forgotEmail.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (!deps.newPassword.trim()) {
      Alert.alert('Password required', 'Please enter a new password.');
      return;
    }

    const passwordError = validatePassword(deps.newPassword, deps.passwordRequirements);
    if (passwordError) {
      Alert.alert('Invalid password', passwordError);
      return;
    }

    if (deps.newPassword !== deps.confirmPassword) {
      Alert.alert('Passwords do not match', 'New password and confirm password must match.');
      return;
    }

    deps.setIsResettingPassword(true);

    try {
      const response = await resetPassword({
        email: trimmedEmail,
        password: deps.newPassword,
      });

      Alert.alert(
        'Password updated',
        response.data?.message || response.message || 'Your password has been reset. Please log in.',
        [{ text: 'Login', onPress: deps.openLoginMode }],
      );
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Reset failed',
        apiError?.message || 'Could not reset your password. Check the code and try again.',
      );
    } finally {
      deps.setIsResettingPassword(false);
    }
  };

  return {
    handleSendForgotPassword,
    handleResendResetCode,
    handleVerifyResetCode,
    handleResetPassword,
  };
}
