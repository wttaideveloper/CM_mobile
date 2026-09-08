import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthModeFooter, AuthSocialButtons } from '@/components/auth/LoginScreenParts';
import type { AuthMode } from '@/hooks/useLoginAuth.types';
import { styles } from '@/screens/auth/LoginScreen.styles';

type LoginAuthFormActionsProps = {
  authMode: AuthMode;
  isSubmitting: boolean;
  primaryButtonLabel: string;
  onPrimaryAction: () => void;
  onOpenLoginMode: () => void;
  onOpenSignupMode: () => void;
  onSocialLogin?: (provider: 'google' | 'facebook') => void;
};

export function LoginAuthFormActions({
  authMode,
  isSubmitting,
  primaryButtonLabel,
  onPrimaryAction,
  onOpenLoginMode,
  onOpenSignupMode,
  onSocialLogin,
}: LoginAuthFormActionsProps) {
  const { t } = useTranslation();
  const showSocial = authMode === 'login' && Boolean(onSocialLogin);

  return (
    <>
      <Pressable
        style={[
          styles.primaryButton,
          showSocial && styles.primaryButtonWithSocial,
          isSubmitting && styles.primaryButtonDisabled,
        ]}
        onPress={onPrimaryAction}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={primaryButtonLabel}
        accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
        )}
      </Pressable>

      {showSocial && onSocialLogin ? (
        <View style={styles.socialSection}>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>
          <AuthSocialButtons
            disabled={isSubmitting}
            onGoogle={() => void onSocialLogin('google')}
            onFacebook={() => void onSocialLogin('facebook')}
          />
        </View>
      ) : null}

      {authMode === 'verify' ? (
        <AuthModeFooter
          mutedText={t('auth.alreadyVerified')}
          linkText={t('auth.login')}
          onPress={onOpenLoginMode}
          accessibilityLabel={t('auth.login')}
        />
      ) : authMode === 'signup' ? (
        <AuthModeFooter
          mutedText={t('auth.alreadyHaveAccount')}
          linkText={t('auth.signIn')}
          onPress={onOpenLoginMode}
          accessibilityLabel={t('auth.signIn')}
        />
      ) : authMode === 'forgot' ||
        authMode === 'verify-reset' ||
        authMode === 'reset-password' ? (
        <AuthModeFooter
          mutedText={t('auth.rememberPassword')}
          linkText={t('auth.signIn')}
          onPress={onOpenLoginMode}
          accessibilityLabel={t('auth.signIn')}
        />
      ) : (
        <AuthModeFooter
          mutedText={t('auth.newToInvigorate')}
          linkText={t('auth.createAnAccount')}
          onPress={onOpenSignupMode}
          accessibilityLabel={t('auth.createAnAccount')}
        />
      )}
    </>
  );
}
