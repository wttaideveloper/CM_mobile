import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthBadge } from '@/components/AuthBadge';
import type { AuthMode } from '@/hooks/useLoginAuth.types';
import { styles } from '@/screens/auth/LoginScreen.styles';

type LoginAuthHeaderProps = {
  authMode: AuthMode;
  email: string;
  forgotEmail: string;
  otpExpiryMinutes: number;
  resetOtpExpiryMinutes: number;
};

export function LoginAuthHeader({
  authMode,
  email,
  forgotEmail,
  otpExpiryMinutes,
  resetOtpExpiryMinutes,
}: LoginAuthHeaderProps) {
  const { t } = useTranslation();

  const badgeLabel =
    authMode === 'verify'
      ? t('auth.badgeVerifyEmail')
      : authMode === 'signup'
        ? t('auth.badgeGetStarted')
        : authMode === 'forgot'
          ? t('auth.badgeResetPassword')
          : authMode === 'verify-reset'
            ? t('auth.badgeVerifyCode')
            : authMode === 'reset-password'
              ? t('auth.badgeNewPassword')
              : t('auth.badgeWelcome');

  const subtext =
    authMode === 'verify'
      ? `Enter the 6-digit code sent to ${email.trim() || 'your email'}. Code expires in ${otpExpiryMinutes} minutes.`
      : authMode === 'signup'
        ? t('auth.subtextSignup')
        : authMode === 'forgot'
          ? t('auth.subtextForgot')
          : authMode === 'verify-reset'
            ? `Enter the 6-digit code sent to ${forgotEmail.trim() || 'your email'}. Code expires in ${resetOtpExpiryMinutes} minutes.`
            : authMode === 'reset-password'
              ? t('auth.subtextResetPassword')
              : t('auth.subtextLogin');

  return (
    <>
      <AuthBadge label={badgeLabel} align="left" />

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
        ) : authMode === 'signup' ? (
          <Text style={styles.headingDark}>{t('auth.headingSignup')}</Text>
        ) : (
          <Text style={styles.headingDark}>{t('auth.headingLogin')}</Text>
        )}
      </Text>

      <Text style={styles.subtext}>{subtext}</Text>
    </>
  );
}
