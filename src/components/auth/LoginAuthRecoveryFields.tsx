import { Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthPasswordField } from '@/components/auth/LoginScreenParts';
import { colors } from '@/constants/authTheme';
import type { AuthMode } from '@/hooks/useLoginAuth.types';
import { styles } from '@/screens/auth/LoginScreen.styles';
import type { PasswordRequirements } from '@/types/auth.types';

type LoginAuthRecoveryFieldsProps = {
  authMode: AuthMode;
  forgotEmail: string;
  setForgotEmail: (value: string) => void;
  resetOtp: string;
  setResetOtp: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  isNewPasswordVisible: boolean;
  setIsNewPasswordVisible: (updater: (prev: boolean) => boolean) => void;
  isConfirmPasswordVisible: boolean;
  setIsConfirmPasswordVisible: (updater: (prev: boolean) => boolean) => void;
  forgotResendCooldown: number;
  isForgotPasswordSending: boolean;
  passwordRequirements: PasswordRequirements;
  onResendResetCode: () => void;
};

export function LoginAuthRecoveryFields({
  authMode,
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
  isForgotPasswordSending,
  passwordRequirements,
  onResendResetCode,
}: LoginAuthRecoveryFieldsProps) {
  const { t } = useTranslation();

  if (authMode === 'forgot') {
    return (
      <>
        <Text style={styles.label}>{t('auth.emailAddress')}</Text>
        <TextInput
          style={styles.input}
          value={forgotEmail}
          onChangeText={setForgotEmail}
          placeholder={t('auth.placeholderEmail')}
          placeholderTextColor={colors.brandLightGray}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('auth.emailAddress')}
        />
      </>
    );
  }

  if (authMode === 'verify-reset') {
    return (
      <>
        <Text style={styles.label}>{t('auth.emailAddress')}</Text>
        <TextInput
          style={styles.input}
          value={forgotEmail}
          onChangeText={setForgotEmail}
          placeholder={t('auth.placeholderEmail')}
          placeholderTextColor={colors.brandLightGray}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('auth.emailAddress')}
        />

        <Text style={styles.label}>{t('auth.resetCode')}</Text>
        <TextInput
          style={[styles.input, styles.otpInput]}
          value={resetOtp}
          onChangeText={(value) => setResetOtp(value.replace(/\D/g, '').slice(0, 6))}
          placeholder={t('auth.placeholderOtp')}
          placeholderTextColor={colors.brandLightGray}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={6}
          accessibilityLabel={t('auth.resetCode')}
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendPrompt}>Didn&apos;t receive the code? </Text>
          <Pressable
            onPress={() => void onResendResetCode()}
            disabled={forgotResendCooldown > 0 || isForgotPasswordSending}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('auth.resendResetCode')}
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
                  : t('auth.resendCode')}
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  if (authMode === 'reset-password') {
    return (
      <>
        <Text style={styles.label}>{t('auth.emailAddress')}</Text>
        <TextInput
          style={[styles.input, styles.readOnlyInput]}
          value={forgotEmail}
          editable={false}
          placeholder={t('auth.placeholderEmail')}
          placeholderTextColor={colors.brandLightGray}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('auth.emailAddress')}
        />

        <Text style={styles.label}>{t('auth.newPassword')}</Text>
        <AuthPasswordField
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t('auth.placeholderNewPassword')}
          visible={isNewPasswordVisible}
          onToggleVisible={() => setIsNewPasswordVisible((prev) => !prev)}
          accessibilityLabel={t('auth.newPassword')}
        />

        <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
        <AuthPasswordField
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t('auth.placeholderConfirmPassword')}
          visible={isConfirmPasswordVisible}
          onToggleVisible={() => setIsConfirmPasswordVisible((prev) => !prev)}
          accessibilityLabel={t('auth.confirmPassword')}
        />

        <Text style={styles.passwordHint}>{passwordRequirements.summary}</Text>
      </>
    );
  }

  return null;
}
