import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import { fetchPasswordRequirements } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { PasswordRequirements } from '@/types/auth.types';
import { DEFAULT_PASSWORD_REQUIREMENTS } from '@/utils/passwordValidation';

import { createLoginAuthAccountHandlers } from '@/hooks/useLoginAuthAccountHandlers';
import { useLoginAuthCooldown } from '@/hooks/useLoginAuthCooldown';
import { createLoginAuthModeActions } from '@/hooks/useLoginAuthModeActions';
import { createLoginAuthResetHandlers } from '@/hooks/useLoginAuthResetHandlers';
import { type AuthMode, isEmailNotVerifiedMessage } from '@/hooks/useLoginAuth.types';

export type { AuthMode } from '@/hooks/useLoginAuth.types';

export function useLoginAuth(onKeyboardVisibilityChange?: (isOpen: boolean) => void) {
  const login = useAuthStore((state) => state.login);
  const loginWithSocial = useAuthStore((state) => state.loginWithSocial);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isForgotPasswordSending, setIsForgotPasswordSending] = useState(false);
  const [isVerifyingResetCode, setIsVerifyingResetCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>(
    DEFAULT_PASSWORD_REQUIREMENTS,
  );

  const {
    forgotResendCooldown,
    resendCooldown,
    startResendCooldown,
    startForgotResendCooldown,
  } = useLoginAuthCooldown();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      onKeyboardVisibilityChange?.(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      onKeyboardVisibilityChange?.(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      onKeyboardVisibilityChange?.(false);
    };
  }, [onKeyboardVisibilityChange]);

  const resendCooldownSeconds = passwordRequirements.tokenExpiry.emailOtpResendCooldownSeconds;
  const otpExpiryMinutes = Math.round(passwordRequirements.tokenExpiry.emailOtpSeconds / 60);
  const resetOtpExpiryMinutes = Math.round(
    passwordRequirements.tokenExpiry.passwordResetSeconds / 60,
  );

  const isSubmitting =
    isLoading ||
    isSigningUp ||
    isVerifying ||
    isResending ||
    isForgotPasswordSending ||
    isVerifyingResetCode ||
    isResettingPassword;

  useEffect(() => {
    void fetchPasswordRequirements()
      .then((response) => {
        setPasswordRequirements(response.data);
      })
      .catch(() => {
        // Keep defaults if requirements API is unavailable.
      });
  }, []);

  const {
    openVerifyMode,
    openLoginMode,
    openForgotMode,
    openVerifyResetMode,
    openResetPasswordMode,
  } = createLoginAuthModeActions(setAuthMode, {
    setName,
    setOtp,
    setForgotEmail,
    setResetOtp,
    setNewPassword,
    setConfirmPassword,
  });

  const {
    handleLogin,
    handleSocialLogin,
    handleCreateAccount,
    handleVerifyEmail,
    handleResendVerification,
  } = createLoginAuthAccountHandlers({
    email,
    password,
    name,
    otp,
    rememberMe,
    acceptedTerms,
    isSubmitting,
    isResending,
    resendCooldown,
    resendCooldownSeconds,
    passwordRequirements,
    login,
    loginWithSocial,
    setIsSigningUp,
    setIsVerifying,
    setIsResending,
    setOtp,
    setAuthMode,
    startResendCooldown,
    openVerifyMode,
    openLoginMode,
    isEmailNotVerifiedMessage,
  });

  const {
    handleSendForgotPassword,
    handleResendResetCode,
    handleVerifyResetCode,
    handleResetPassword,
  } = createLoginAuthResetHandlers({
    forgotEmail,
    resetOtp,
    newPassword,
    confirmPassword,
    forgotResendCooldown,
    resendCooldownSeconds,
    passwordRequirements,
    isForgotPasswordSending,
    isVerifyingResetCode,
    setIsForgotPasswordSending,
    setIsVerifyingResetCode,
    setIsResettingPassword,
    setResetOtp,
    setNewPassword,
    setConfirmPassword,
    startForgotResendCooldown,
    openVerifyResetMode,
    openResetPasswordMode,
    openLoginMode,
  });

  const handlePrimaryAction = () => {
    if (authMode === 'signup') {
      void handleCreateAccount();
      return;
    }

    if (authMode === 'verify') {
      void handleVerifyEmail();
      return;
    }

    if (authMode === 'forgot') {
      void handleSendForgotPassword();
      return;
    }

    if (authMode === 'verify-reset') {
      void handleVerifyResetCode();
      return;
    }

    if (authMode === 'reset-password') {
      void handleResetPassword();
      return;
    }

    void handleLogin();
  };

  return {
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    otp,
    setOtp,
    rememberMe,
    setRememberMe,
    acceptedTerms,
    setAcceptedTerms,
    isPasswordVisible,
    setIsPasswordVisible,
    forgotEmail,
    setForgotEmail,
    resetOtp,
    setResetOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isNewPasswordVisible,
    setIsNewPasswordVisible,
    isConfirmPasswordVisible,
    setIsConfirmPasswordVisible,
    forgotResendCooldown,
    resendCooldown,
    isResending,
    isForgotPasswordSending,
    passwordRequirements,
    otpExpiryMinutes,
    resetOtpExpiryMinutes,
    isSubmitting,
    openLoginMode,
    openForgotMode,
    handlePrimaryAction,
    handleSocialLogin,
    handleResendVerification,
    handleResendResetCode,
  };
}
