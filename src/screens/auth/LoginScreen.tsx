import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
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
  const isSignup = auth.authMode === 'signup';
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);

  /** Name sits near the top, so KAV often skips it — scroll heading under the hero. */
  const scrollSignupNameIntoView = () => {
    const y = isSmallDevice ? 110 : 140;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    });
    setTimeout(() => {
      scrollRef.current?.assureFocusedInputVisible();
    }, 280);
  };

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
  // Scroll viewport starts at the photo edge so heading + form both
  // scroll and clip under the image (never paint on top of it).
  const contentTopRatio =
    auth.authMode === 'login'
      ? isSmallDevice
        ? 0.32
        : 0.335
      : isSmallDevice
        ? 0.22
        : 0.243;
  const bodyHeight = Dimensions.get('window').height - insets.top;
  const contentTop = bodyHeight * contentTopRatio;

  const backgroundImage =
    auth.authMode === 'login' ? AUTH_BG_LOGIN : AUTH_BG_SIGNUP;

  return (
    <AuthScreenLayout backgroundImage={backgroundImage} contentTopRatio={0}>
      <View style={styles.flex}>
        <View style={[styles.formViewport, { top: contentTop }]}>
          <KeyboardAwareScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: insets.bottom + getSpacing(isSignup ? 56 : 24),
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            bottomOffset={getSpacing(32)}
            extraKeyboardSpace={getSpacing(isSignup ? 72 : 20)}
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
              onSignupNameFocus={scrollSignupNameIntoView}
              onSocialLogin={(provider) => void auth.handleSocialLogin(provider)}
            />
          </KeyboardAwareScrollView>
        </View>
      </View>
    </AuthScreenLayout>
  );
}
