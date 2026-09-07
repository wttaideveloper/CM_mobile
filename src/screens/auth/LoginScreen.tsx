import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { LoginAuthFormFields, LoginAuthHeader } from '@/components/auth/LoginAuthForm';
import { AUTH_BG_LOGIN, AUTH_BG_SIGNUP } from '@/constants/images';
import { useLoginAuth } from '@/hooks/useLoginAuth';
import { useScreenPrivacy } from '@/hooks/useScreenPrivacy';
import { styles } from '@/screens/auth/LoginScreen.styles';
import { getSpacing, isSmallDevice } from '@/utils/responsive';

type LoginScreenProps = {
  /** Notifies parent (auth pager) so horizontal swipe can be locked while typing. */
  onKeyboardVisibilityChange?: (isOpen: boolean) => void;
};

export function LoginScreen({ onKeyboardVisibilityChange }: LoginScreenProps = {}) {
  useScreenPrivacy('auth-login');
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const auth = useLoginAuth(onKeyboardVisibilityChange);

  const primaryButtonLabel =
    auth.authMode === 'signup'
      ? t('auth.createAccount')
      : auth.authMode === 'verify'
        ? t('auth.verifyEmail')
        : auth.authMode === 'forgot'
          ? t('auth.sendResetCode')
          : auth.authMode === 'verify-reset'
            ? t('auth.verifyCode')
            : auth.authMode === 'reset-password'
              ? t('auth.resetPassword')
              : t('auth.login');

  // Design frame 430×932 — login hero 312, signup/other hero 227.
  const contentTopRatio =
    auth.authMode === 'login'
      ? isSmallDevice
        ? 0.32
        : 0.335
      : isSmallDevice
        ? 0.22
        : 0.243;

  const backgroundImage =
    auth.authMode === 'login' ? AUTH_BG_LOGIN : AUTH_BG_SIGNUP;

  return (
    <AuthScreenLayout backgroundImage={backgroundImage} contentTopRatio={contentTopRatio}>
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
        <LoginAuthHeader
          authMode={auth.authMode}
          email={auth.email}
          forgotEmail={auth.forgotEmail}
          otpExpiryMinutes={auth.otpExpiryMinutes}
          resetOtpExpiryMinutes={auth.resetOtpExpiryMinutes}
        />

        <LoginAuthFormFields
          authMode={auth.authMode}
          email={auth.email}
          setEmail={auth.setEmail}
          password={auth.password}
          setPassword={auth.setPassword}
          name={auth.name}
          setName={auth.setName}
          otp={auth.otp}
          setOtp={auth.setOtp}
          forgotEmail={auth.forgotEmail}
          setForgotEmail={auth.setForgotEmail}
          resetOtp={auth.resetOtp}
          setResetOtp={auth.setResetOtp}
          newPassword={auth.newPassword}
          setNewPassword={auth.setNewPassword}
          confirmPassword={auth.confirmPassword}
          setConfirmPassword={auth.setConfirmPassword}
          isPasswordVisible={auth.isPasswordVisible}
          setIsPasswordVisible={auth.setIsPasswordVisible}
          isNewPasswordVisible={auth.isNewPasswordVisible}
          setIsNewPasswordVisible={auth.setIsNewPasswordVisible}
          isConfirmPasswordVisible={auth.isConfirmPasswordVisible}
          setIsConfirmPasswordVisible={auth.setIsConfirmPasswordVisible}
          rememberMe={auth.rememberMe}
          setRememberMe={auth.setRememberMe}
          acceptedTerms={auth.acceptedTerms}
          setAcceptedTerms={auth.setAcceptedTerms}
          resendCooldown={auth.resendCooldown}
          forgotResendCooldown={auth.forgotResendCooldown}
          isResending={auth.isResending}
          isForgotPasswordSending={auth.isForgotPasswordSending}
          passwordRequirements={auth.passwordRequirements}
          isSubmitting={auth.isSubmitting}
          primaryButtonLabel={primaryButtonLabel}
          onPrimaryAction={auth.handlePrimaryAction}
          onOpenForgotMode={auth.openForgotMode}
          onResendVerification={auth.handleResendVerification}
          onResendResetCode={auth.handleResendResetCode}
          onOpenLoginMode={auth.openLoginMode}
          onOpenSignupMode={() => auth.setAuthMode('signup')}
        />
      </KeyboardAwareScrollView>
    </AuthScreenLayout>
  );
}
