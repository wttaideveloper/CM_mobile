import { useEffect, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthPasswordField } from '@/components/auth/LoginScreenParts';
import { colors } from '@/constants/authTheme';
import type { AuthMode } from '@/hooks/useLoginAuth.types';
import { styles } from '@/screens/auth/LoginScreen.styles';

type LoginAuthAccountFieldsProps = {
  authMode: AuthMode;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  isPasswordVisible: boolean;
  setIsPasswordVisible: (updater: (prev: boolean) => boolean) => void;
  rememberMe: boolean;
  setRememberMe: (updater: (prev: boolean) => boolean) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (updater: (prev: boolean) => boolean) => void;
  resendCooldown: number;
  isResending: boolean;
  onOpenForgotMode: () => void;
  onResendVerification: () => void;
  onSignupNameFocus?: () => void;
};

export function LoginAuthAccountFields({
  authMode,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  otp,
  setOtp,
  isPasswordVisible,
  setIsPasswordVisible,
  rememberMe,
  setRememberMe,
  acceptedTerms,
  setAcceptedTerms,
  resendCooldown,
  isResending,
  onOpenForgotMode,
  onResendVerification,
  onSignupNameFocus,
}: LoginAuthAccountFieldsProps) {
  const { t } = useTranslation();
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (authMode !== 'signup') return undefined;

    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 350);

    return () => clearTimeout(timer);
  }, [authMode]);

  return (
    <>
      {authMode === 'signup' && (
        <>
          <Text style={styles.label}>{t('auth.enterName')}</Text>
          <TextInput
            ref={nameInputRef}
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('auth.placeholderName')}
            placeholderTextColor={colors.brandLightGray}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus
            returnKeyType="next"
            onFocus={onSignupNameFocus}
            accessibilityLabel={t('auth.fullName')}
          />
        </>
      )}

      {authMode !== 'verify' &&
        authMode !== 'forgot' &&
        authMode !== 'verify-reset' &&
        authMode !== 'reset-password' && (
        <>
          <Text style={styles.label}>{t('auth.emailAddress')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.placeholderEmail')}
            placeholderTextColor={colors.brandLightGray}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t('auth.emailAddress')}
          />
        </>
      )}

      {authMode === 'verify' && (
        <>
          <Text style={styles.label}>{t('auth.verificationCode')}</Text>
          <TextInput
            style={[styles.input, styles.otpInput]}
            value={otp}
            onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('auth.placeholderOtp')}
            placeholderTextColor={colors.brandLightGray}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={6}
            accessibilityLabel={t('auth.verificationCode')}
          />
          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>Didn&apos;t receive the code? </Text>
            <Pressable
              onPress={() => void onResendVerification()}
              disabled={resendCooldown > 0 || isResending}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('auth.resendVerificationCode')}
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
                    : t('auth.resendCode')}
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
          <Text style={styles.label}>{t('auth.password')}</Text>
          <AuthPasswordField
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.placeholderPassword')}
            visible={isPasswordVisible}
            onToggleVisible={() => setIsPasswordVisible((prev) => !prev)}
            accessibilityLabel={t('auth.password')}
          />
        </>
      )}

      {authMode === 'signup' && (
        <Pressable
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((prev) => !prev)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          accessibilityLabel={t('auth.agreeTerms')}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>{t('auth.agreeTerms')}</Text>
        </Pressable>
      )}

      {authMode === 'login' && (
        <View style={styles.optionsRow}>
          <Pressable
            style={styles.rememberRow}
            onPress={() => setRememberMe((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
            accessibilityLabel={t('auth.rememberMe')}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.optionText}>{t('auth.rememberMe')}</Text>
          </Pressable>

          <Pressable
            onPress={onOpenForgotMode}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('auth.forgotPassword')}
          >
            <Text style={styles.optionLink}>{t('auth.forgotPassword')}</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
