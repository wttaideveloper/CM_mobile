import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  type AppStateStatus,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBadge } from '@/components/AuthBadge';
import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { authTheme, colors } from '@/constants/authTheme';
import { AUTH_BG_LOGIN } from '@/constants/images';
import { resendVerification, fetchPasswordRequirements, forgotPassword, resetPassword, signup, verifyEmail, verifyResetCode } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types/api.types';
import type { PasswordRequirements } from '@/types/auth.types';
import {
  DEFAULT_PASSWORD_REQUIREMENTS,
  validatePassword,
} from '@/utils/passwordValidation';
import { getButtonHeight, getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';

type AuthMode = 'login' | 'signup' | 'verify' | 'forgot' | 'verify-reset' | 'reset-password';

type LoginScreenProps = {
  /** Notifies parent (auth pager) so horizontal swipe can be locked while typing. */
  onKeyboardVisibilityChange?: (isOpen: boolean) => void;
};

function isEmailNotVerifiedMessage(message: string): boolean {
  return /not verified|verify your email|email verification|check your inbox for the verification/i.test(
    message,
  );
}

export function LoginScreen({ onKeyboardVisibilityChange }: LoginScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>(
    DEFAULT_PASSWORD_REQUIREMENTS,
  );
  /** Wall-clock end times so cooldown keeps counting while app is backgrounded. */
  const resendCooldownEndsAtRef = useRef(0);
  const forgotResendCooldownEndsAtRef = useRef(0);

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

  const remainingSecondsUntil = useCallback((endsAt: number) => {
    if (endsAt <= 0) return 0;
    return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  }, []);

  const startResendCooldown = useCallback(
    (seconds: number) => {
      const endsAt = Date.now() + seconds * 1000;
      resendCooldownEndsAtRef.current = endsAt;
      setResendCooldown(seconds);
    },
    [],
  );

  const startForgotResendCooldown = useCallback((seconds: number) => {
    const endsAt = Date.now() + seconds * 1000;
    forgotResendCooldownEndsAtRef.current = endsAt;
    setForgotResendCooldown(seconds);
  }, []);

  const syncCooldownsFromWallClock = useCallback(() => {
    setResendCooldown(remainingSecondsUntil(resendCooldownEndsAtRef.current));
    setForgotResendCooldown(remainingSecondsUntil(forgotResendCooldownEndsAtRef.current));
  }, [remainingSecondsUntil]);

  useEffect(() => {
    void fetchPasswordRequirements()
      .then((response) => {
        setPasswordRequirements(response.data);
      })
      .catch(() => {
        // Keep defaults if requirements API is unavailable.
      });
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const timer = setTimeout(() => {
      setResendCooldown(remainingSecondsUntil(resendCooldownEndsAtRef.current));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown, remainingSecondsUntil]);

  useEffect(() => {
    if (forgotResendCooldown <= 0) return undefined;

    const timer = setTimeout(() => {
      setForgotResendCooldown(remainingSecondsUntil(forgotResendCooldownEndsAtRef.current));
    }, 1000);

    return () => clearTimeout(timer);
  }, [forgotResendCooldown, remainingSecondsUntil]);

  // When returning from background, catch up to real elapsed time.
  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        syncCooldownsFromWallClock();
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [syncCooldownsFromWallClock]);

  const openVerifyMode = () => {
    setOtp('');
    setAuthMode('verify');
  };

  const openLoginMode = () => {
    setAuthMode('login');
    setName('');
    setOtp('');
    setForgotEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const openForgotMode = () => {
    setForgotEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setAuthMode('forgot');
  };

  const openVerifyResetMode = () => {
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setAuthMode('verify-reset');
  };

  const openResetPasswordMode = () => {
    setNewPassword('');
    setConfirmPassword('');
    setAuthMode('reset-password');
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }

    try {
      await login({
        email: trimmedEmail,
        password,
        rememberMe,
      });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not log in. Check your credentials and try again.';

      if (isEmailNotVerifiedMessage(message)) {
        Alert.alert(
          'Email not verified',
          'Enter the 6-digit code sent to your email to verify your account.',
          [
            {
              text: 'Verify now',
              onPress: () => {
                setOtp('');
                startResendCooldown(resendCooldownSeconds);
                openVerifyMode();
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

  const handleCreateAccount = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }

    const passwordError = validatePassword(password, passwordRequirements);
    if (passwordError) {
      Alert.alert('Invalid password', passwordError);
      return;
    }

    setIsSigningUp(true);

    try {
      await signup({
        email: trimmedEmail,
        password,
        fullName: trimmedName,
      });

      setOtp('');
      startResendCooldown(resendCooldownSeconds);
      setAuthMode('verify');
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
      setIsSigningUp(false);
    }
  };

  const handleVerifyEmail = async () => {
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (trimmedOtp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await verifyEmail({
        email: trimmedEmail,
        otp: trimmedOtp,
      });

      Alert.alert(
        'Email verified',
        response.message || 'Your email has been verified. Please log in.',
        [{ text: 'Login', onPress: openLoginMode }],
      );
    } catch (error) {
      const apiError = error as ApiError;
      const message =
        apiError?.message ||
        'Could not verify your email. Check the code and try again.';

      Alert.alert('Verification failed', message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);

    try {
      const response = await resendVerification({ email: trimmedEmail });
      setOtp('');
      startResendCooldown(resendCooldownSeconds);
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
      setIsResending(false);
    }
  };

  const handleSendForgotPassword = async () => {
    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (isForgotPasswordSending) return;

    setIsForgotPasswordSending(true);

    try {
      const response = await forgotPassword({ email: trimmedEmail });
      startForgotResendCooldown(resendCooldownSeconds);
      Alert.alert(
        'Check your email',
        response.data?.message ||
          response.message ||
          'If an account exists for that email, a reset code is being sent.',
        [{ text: 'OK', onPress: openVerifyResetMode }],
      );
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Could not send reset code',
        apiError?.message || 'Please check your connection and try again.',
      );
    } finally {
      setIsForgotPasswordSending(false);
    }
  };

  const handleResendResetCode = async () => {
    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (forgotResendCooldown > 0 || isForgotPasswordSending) return;

    setIsForgotPasswordSending(true);

    try {
      const response = await forgotPassword({ email: trimmedEmail });
      setResetOtp('');
      startForgotResendCooldown(resendCooldownSeconds);
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
      setIsForgotPasswordSending(false);
    }
  };

  const handleVerifyResetCode = async () => {
    const trimmedEmail = forgotEmail.trim();
    const trimmedOtp = resetOtp.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (trimmedOtp.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit reset code.');
      return;
    }

    if (isVerifyingResetCode) return;

    setIsVerifyingResetCode(true);

    try {
      const response = await verifyResetCode({
        email: trimmedEmail,
        otp: trimmedOtp,
      });

      if (!response.data?.verified) {
        Alert.alert('Verification failed', 'The reset code could not be verified. Please try again.');
        return;
      }

      openResetPasswordMode();
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Wrong code',
        apiError?.message ||
          'The reset code is incorrect or expired. Check your latest email or request a new code.',
      );
    } finally {
      setIsVerifyingResetCode(false);
    }
  };

  const handleResetPassword = async () => {
    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Password required', 'Please enter a new password.');
      return;
    }

    const passwordError = validatePassword(newPassword, passwordRequirements);
    if (passwordError) {
      Alert.alert('Invalid password', passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'New password and confirm password must match.');
      return;
    }

    setIsResettingPassword(true);

    try {
      const response = await resetPassword({
        email: trimmedEmail,
        password: newPassword,
      });

      Alert.alert(
        'Password updated',
        response.data?.message || response.message || 'Your password has been reset. Please log in.',
        [{ text: 'Login', onPress: openLoginMode }],
      );
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Reset failed',
        apiError?.message || 'Could not reset your password. Check the code and try again.',
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

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

  const primaryButtonLabel =
    authMode === 'signup'
      ? 'Create Account'
      : authMode === 'verify'
        ? 'Verify Email'
        : authMode === 'forgot'
          ? 'Send reset code'
          : authMode === 'verify-reset'
            ? 'Verify code'
            : authMode === 'reset-password'
              ? 'Reset password'
              : 'Login';

  const contentTopRatio =
    authMode === 'signup' ||
    authMode === 'verify' ||
    authMode === 'forgot' ||
    authMode === 'verify-reset' ||
    authMode === 'reset-password'
      ? isSmallDevice
        ? 0.28
        : 0.3
      : isSmallDevice
        ? 0.4
        : 0.37;

  return (
    <AuthScreenLayout backgroundImage={AUTH_BG_LOGIN} contentTopRatio={contentTopRatio}>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + getSpacing(24) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={getSpacing(16)}
        extraKeyboardSpace={getSpacing(20)}
      >
        <AuthBadge
          label={
            authMode === 'verify'
              ? 'VERIFY EMAIL'
              : authMode === 'signup'
                ? 'GET STARTED'
                : authMode === 'forgot'
                  ? 'RESET PASSWORD'
                  : authMode === 'verify-reset'
                    ? 'VERIFY CODE'
                    : authMode === 'reset-password'
                      ? 'NEW PASSWORD'
                      : 'WELCOME BACK'
          }
          align="left"
        />

        <Text style={styles.heading}>
          {authMode === 'verify' ? (
            <>
              <Text style={styles.headingDark}>Check your </Text>
              <Text style={styles.headingAccent}>inbox.</Text>
            </>
          ) : authMode === 'forgot' ? (
            <>
              <Text style={styles.headingDark}>Forgot your </Text>
              <Text style={styles.headingAccent}>password?</Text>
            </>
          ) : authMode === 'verify-reset' ? (
            <>
              <Text style={styles.headingDark}>Enter your </Text>
              <Text style={styles.headingAccent}>reset code.</Text>
            </>
          ) : authMode === 'reset-password' ? (
            <>
              <Text style={styles.headingDark}>Set a new </Text>
              <Text style={styles.headingAccent}>password.</Text>
            </>
          ) : (
            <>
              <Text style={styles.headingDark}>Step into your </Text>
              <Text style={styles.headingAccent}>daily</Text>
              <Text style={styles.headingAccent}> practice.</Text>
            </>
          )}
        </Text>

        <Text style={styles.subtext}>
          {authMode === 'verify'
            ? `Enter the 6-digit code sent to ${email.trim() || 'your email'}. Code expires in ${otpExpiryMinutes} minutes.`
            : authMode === 'signup'
              ? 'Create your account to start your restoration journey.'
              : authMode === 'forgot'
                ? 'Enter your email and we will send you a reset code.'
                : authMode === 'verify-reset'
                  ? `Enter the 6-digit code sent to ${forgotEmail.trim() || 'your email'}. Code expires in ${resetOtpExpiryMinutes} minutes.`
                  : authMode === 'reset-password'
                    ? 'Choose a strong new password for your account.'
                    : 'Sign in to continue your restoration journey.'}
        </Text>

        {authMode === 'forgot' && (
          <>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.brandLightGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}

        {authMode === 'verify-reset' && (
          <>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.brandLightGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Reset code</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={resetOtp}
              onChangeText={(value) => setResetOtp(value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              placeholderTextColor={colors.brandLightGray}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={6}
            />

            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>Didn&apos;t receive the code? </Text>
              <Pressable
                onPress={() => void handleResendResetCode()}
                disabled={forgotResendCooldown > 0 || isForgotPasswordSending}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Resend reset code"
              >
                <Text
                  style={[
                    styles.resendLink,
                    (forgotResendCooldown > 0 || isForgotPasswordSending) && styles.resendLinkDisabled,
                  ]}
                >
                  {isForgotPasswordSending
                    ? 'Sending...'
                    : forgotResendCooldown > 0
                      ? `Resend in ${forgotResendCooldown}s`
                      : 'Resend code'}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {authMode === 'reset-password' && (
          <>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={forgotEmail}
              editable={false}
              placeholder="Enter email address"
              placeholderTextColor={colors.brandLightGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>New password</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.brandLightGray}
                secureTextEntry={!isNewPasswordVisible}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setIsNewPasswordVisible((prev) => !prev)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isNewPasswordVisible ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.brandGray}
                />
              </Pressable>
            </View>

            <Text style={styles.label}>Confirm password</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={colors.brandLightGray}
                secureTextEntry={!isConfirmPasswordVisible}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.brandGray}
                />
              </Pressable>
            </View>

            <Text style={styles.passwordHint}>{passwordRequirements.summary}</Text>
          </>
        )}

        {authMode === 'signup' && (
          <>
            <Text style={styles.label}>Enter name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor={colors.brandLightGray}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </>
        )}

        {authMode !== 'verify' &&
          authMode !== 'forgot' &&
          authMode !== 'verify-reset' &&
          authMode !== 'reset-password' && (
          <>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.brandLightGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}

        {authMode === 'verify' && (
          <>
            <Text style={styles.label}>Verification code</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              placeholderTextColor={colors.brandLightGray}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={6}
            />
            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>Didn&apos;t receive the code? </Text>
              <Pressable
                onPress={() => void handleResendVerification()}
                disabled={resendCooldown > 0 || isResending}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Resend verification code"
              >
                <Text
                  style={[
                    styles.resendLink,
                    (resendCooldown > 0 || isResending) && styles.resendLinkDisabled,
                  ]}
                >
                  {isResending
                    ? 'Sending...'
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend code'}
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {authMode !== 'verify' &&
          authMode !== 'forgot' &&
          authMode !== 'verify-reset' &&
          authMode !== 'reset-password' && (
          <>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.brandLightGray}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.brandGray}
                />
              </Pressable>
            </View>
            {authMode === 'signup' && (
              <Text style={styles.passwordHint}>{passwordRequirements.summary}</Text>
            )}
          </>
        )}

        {authMode === 'login' && (
          <View style={styles.optionsRow}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberMe((prev) => !prev)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.optionText}>Remember me</Text>
            </Pressable>

            <Pressable
              onPress={openForgotMode}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.optionText}>Forgot Password?</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
          onPress={handlePrimaryAction}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
          )}
        </Pressable>

        <View style={styles.createAccountRow}>
          {authMode === 'verify' ? (
            <>
              <Text style={styles.createAccountMuted}>Already verified? </Text>
              <Pressable onPress={openLoginMode}>
                <Text style={styles.createAccountLink}>Login</Text>
              </Pressable>
            </>
          ) : authMode === 'signup' ? (
            <>
              <Text style={styles.createAccountMuted}>Already have an account? </Text>
              <Pressable onPress={openLoginMode}>
                <Text style={styles.createAccountLink}>Login</Text>
              </Pressable>
            </>
          ) : authMode === 'forgot' || authMode === 'verify-reset' || authMode === 'reset-password' ? (
            <>
              <Text style={styles.createAccountMuted}>Remember your password? </Text>
              <Pressable onPress={openLoginMode}>
                <Text style={styles.createAccountLink}>Login</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.createAccountMuted}>New to Invigorate? </Text>
              <Pressable onPress={() => setAuthMode('signup')}>
                <Text style={styles.createAccountLink}>Create an account</Text>
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAwareScrollView>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: getSpacing(2),
  },
  heading: {
    marginTop: isSmallDevice ? 0 : 10,
    marginBottom: getSpacing(8),
  },
  headingDark: {
    fontSize: isSmallDevice ? 24 : 29,
    fontWeight: authTheme.headingDark.fontWeight,
    color: '#274943',
    lineHeight: getFontSize(38),
  },
  headingAccent: {
    fontSize: isSmallDevice ? 24 : 29,
    fontWeight: authTheme.headingAccent.fontWeight,
    color: '#3E8040',
    lineHeight: getFontSize(38),
  },
  subtext: {
    ...authTheme.subtext,
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: getFontSize(authTheme.subtext.lineHeight),
    marginBottom: getSpacing(24),
  },
  label: {
    ...authTheme.label,
    fontSize: getFontSize(authTheme.label.fontSize),
    marginBottom: isSmallDevice ? 4 : 6,
  },
  input: {
    backgroundColor: authTheme.input.backgroundColor,
    borderWidth: authTheme.input.borderWidth,
    borderColor: authTheme.input.borderColor,
    borderRadius: authTheme.input.borderRadius,
    paddingHorizontal: getSpacing(authTheme.input.paddingHorizontal),
    height: getButtonHeight(authTheme.input.height),
    fontSize: getFontSize(authTheme.input.fontSize),
    color: authTheme.input.color,
    marginBottom: 20,
  },
  readOnlyInput: {
    opacity: 0.85,
    backgroundColor: '#F5F5F5',
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: authTheme.input.backgroundColor,
    borderWidth: authTheme.input.borderWidth,
    borderColor: authTheme.input.borderColor,
    borderRadius: authTheme.input.borderRadius,
    height: getButtonHeight(authTheme.input.height),
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: getSpacing(authTheme.input.paddingHorizontal),
    fontSize: getFontSize(authTheme.input.fontSize),
    color: authTheme.input.color,
  },
  passwordToggle: {
    paddingHorizontal: getSpacing(14),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordHint: {
    fontSize: getFontSize(12),
    lineHeight: getFontSize(18),
    color: colors.brandGray,
    marginTop: -12,
    marginBottom: getSpacing(16),
  },
  otpInput: {
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: getSpacing(8),
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  resendPrompt: {
    fontSize: getFontSize(13),
    color: colors.brandGray,
  },
  resendLink: {
    fontSize: getFontSize(13),
    fontWeight: '600',
    color: authTheme.link.color,
  },
  resendLinkDisabled: {
    opacity: 0.55,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getSpacing(16),
    marginTop: isSmallDevice ? -14 : -14,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(10),
  },
  checkbox: {
    width: getSpacing(20),
    height: getSpacing(20),
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: '#3E8040',
    borderColor: '#3E8040',
  },
  checkmark: {
    color: colors.white,
    fontSize: getFontSize(12),
    fontWeight: '700',
  },
  optionText: {
    fontSize: getFontSize(14),
    fontWeight: '500',
    color: '#3E8040',
  },
  primaryButton: {
    backgroundColor: authTheme.primaryButton.backgroundColor,
    height: isSmallDevice ? 40 : 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallDevice ? 8 : 10,
    marginBottom: getSpacing(20),
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: authTheme.primaryButtonText.color,
    fontSize: getFontSize(authTheme.primaryButtonText.fontSize),
    fontWeight: authTheme.primaryButtonText.fontWeight,
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isSmallDevice ? 8 : 10,
  },
  createAccountMuted: {
    fontSize: getFontSize(16),
    fontWeight: '500',
    color: colors.brandGray,
  },
  createAccountLink: {
    fontSize: getFontSize(16),
    fontWeight: '400',
    color: authTheme.link.color,
  },
});
