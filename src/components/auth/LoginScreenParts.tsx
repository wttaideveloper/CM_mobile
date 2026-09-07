import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { authTheme, colors } from '@/constants/authTheme';
import { getButtonHeight, getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';

/** Official multicolor Google "G" mark. */
export function AuthGoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

type AuthPasswordFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggleVisible: () => void;
  accessibilityLabel: string;
};

export function AuthPasswordField({
  value,
  onChangeText,
  placeholder,
  visible,
  onToggleVisible,
  accessibilityLabel,
}: AuthPasswordFieldProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.passwordField}>
      <TextInput
        style={styles.passwordInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.brandLightGray}
        secureTextEntry={!visible}
        autoCapitalize="none"
        accessibilityLabel={accessibilityLabel}
      />
      <Pressable
        style={styles.passwordToggle}
        onPress={onToggleVisible}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={visible ? t('auth.hidePassword') : t('auth.showPassword')}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={colors.brandGray}
        />
      </Pressable>
    </View>
  );
}

type AuthSocialButtonsProps = {
  disabled?: boolean;
  onGoogle: () => void;
  onFacebook: () => void;
};

export function AuthSocialButtons({
  disabled,
  onGoogle,
  onFacebook,
}: AuthSocialButtonsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.socialRow}>
      <Pressable
        style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
        onPress={onGoogle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('auth.continueGoogle')}
      >
        <AuthGoogleIcon size={22} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
        onPress={onFacebook}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('auth.continueFacebook')}
      >
        <Ionicons name="logo-facebook" size={22} color="#1877F2" />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
        onPress={() => Alert.alert('Coming soon', 'Apple login will be available soon.')}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('auth.continueApple')}
      >
        <Ionicons name="logo-apple" size={22} color="#111111" />
      </Pressable>
    </View>
  );
}

type AuthModeFooterProps = {
  mutedText: string;
  linkText: string;
  onPress: () => void;
  accessibilityLabel: string;
};

export function AuthModeFooter({
  mutedText,
  linkText,
  onPress,
  accessibilityLabel,
}: AuthModeFooterProps) {
  return (
    <View style={styles.createAccountRow}>
      <Text style={styles.createAccountMuted}>{mutedText}</Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.createAccountLink}>{linkText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#98D1A9',
    borderRadius: 8,
    height: getButtonHeight(56),
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: getSpacing(16),
    fontSize: getFontSize(16),
    color: '#164744',
  },
  passwordToggle: {
    paddingHorizontal: getSpacing(14),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacing(16),
  },
  socialButton: {
    width: isSmallDevice ? 46 : 52,
    height: isSmallDevice ? 46 : 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#98D1A9',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonPressed: {
    opacity: 0.75,
    backgroundColor: '#F5FAF6',
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isSmallDevice ? 8 : 10,
  },
  createAccountMuted: {
    fontSize: getFontSize(16),
    fontWeight: '400',
    color: '#000000',
  },
  createAccountLink: {
    fontSize: getFontSize(16),
    fontWeight: '400',
    color: '#257D3F',
  },
});
