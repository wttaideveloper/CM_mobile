import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBadge } from '@/components/AuthBadge';
import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { authTheme, colors } from '@/constants/authTheme';
import { AUTH_BG_LOGIN } from '@/constants/images';
import { useAuthStore } from '@/stores/auth.store';
import { getButtonHeight, getFontSize, getSpacing } from '@/utils/responsive';

/** Original login screen — kept for client demo. Not in active app flow. */
export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    login();
  };

  return (
    <AuthScreenLayout backgroundImage={AUTH_BG_LOGIN} contentTopRatio={0.4}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthBadge label="WELCOME BACK" align="left" />

          <Text style={styles.heading}>
            <Text style={styles.headingDark}>Step into your </Text>
            <Text style={styles.headingAccent}>daily</Text>
            <Text style={styles.headingDark}> practice.</Text>
          </Text>

          <Text style={styles.subtext}>
            Sign in to continue your restoration journey.
          </Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={colors.brandLightGray}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={colors.brandLightGray}
            secureTextEntry
            autoCapitalize="none"
          />

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

            <Pressable>
              <Text style={styles.optionText}>Forgot Password</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + getSpacing(24) }]}>
          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </Pressable>

          <View style={styles.createAccountRow}>
            <Text style={styles.createAccountMuted}>New to Invigorate? </Text>
            <Pressable>
              <Text style={styles.createAccountLink}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getSpacing(2),
    paddingBottom: getSpacing(8),
  },
  heading: {
    marginBottom: getSpacing(12),
  },
  headingDark: {
    fontSize: getFontSize(30),
    fontWeight: authTheme.headingDark.fontWeight,
    color: authTheme.headingDark.color,
    lineHeight: getFontSize(38),
  },
  headingAccent: {
    fontSize: getFontSize(30),
    fontWeight: authTheme.headingAccent.fontWeight,
    color: authTheme.headingAccent.color,
    lineHeight: getFontSize(38),
  },
  subtext: {
    ...authTheme.subtext,
    fontSize: getFontSize(authTheme.subtext.fontSize),
    lineHeight: getFontSize(authTheme.subtext.lineHeight),
    marginBottom: getSpacing(24),
  },
  label: {
    ...authTheme.label,
    fontSize: getFontSize(authTheme.label.fontSize),
    marginBottom: getSpacing(authTheme.label.marginBottom),
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
    marginBottom: getSpacing(20),
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getSpacing(16),
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
    backgroundColor: colors.brandAccentGreen,
    borderColor: colors.brandAccentGreen,
  },
  checkmark: {
    color: colors.white,
    fontSize: getFontSize(12),
    fontWeight: '700',
  },
  optionText: {
    fontSize: getFontSize(14),
    fontWeight: '500',
    color: colors.brandAccentGreen,
  },
  footer: {
    paddingTop: getSpacing(8),
  },
  primaryButton: {
    backgroundColor: authTheme.primaryButton.backgroundColor,
    height: getButtonHeight(authTheme.primaryButton.height),
    borderRadius: authTheme.primaryButton.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(20),
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
  },
  createAccountMuted: {
    fontSize: getFontSize(14),
    fontWeight: '400',
    color: colors.brandGray,
  },
  createAccountLink: {
    fontSize: getFontSize(authTheme.link.fontSize),
    fontWeight: authTheme.link.fontWeight,
    color: authTheme.link.color,
  },
});
