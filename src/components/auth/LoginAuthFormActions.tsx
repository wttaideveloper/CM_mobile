import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AuthModeFooter } from '@/components/auth/LoginScreenParts';
import type { AuthMode } from '@/hooks/useLoginAuth.types';
import { styles } from '@/screens/auth/LoginScreen.styles';

type LoginAuthFormActionsProps = {
  authMode: AuthMode;
  isSubmitting: boolean;
  primaryButtonLabel: string;
  onPrimaryAction: () => void;
  onOpenLoginMode: () => void;
  onOpenSignupMode: () => void;
};

export function LoginAuthFormActions({
  authMode,
  isSubmitting,
  primaryButtonLabel,
  onPrimaryAction,
  onOpenLoginMode,
  onOpenSignupMode,
}: LoginAuthFormActionsProps) {
  const { t } = useTranslation();

  return (
    <>
      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
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
