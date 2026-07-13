import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { getButtonHeight, getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not get dev token. Check your connection and try again.';

      Alert.alert('Login failed', message);
    }
  };

  return (
    <AuthScreenLayout backgroundImage={AUTH_BG_LOGIN} contentTopRatio={isSmallDevice ? 0.4 : 0.37}>
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
            <Text style={styles.headingAccent}> practice.</Text>
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
          <Pressable
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
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
    // flex: 1,
  },
  scrollContent: {
    paddingTop: getSpacing(2),
    paddingBottom: getSpacing(8),
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
  footer: {
    paddingTop: isSmallDevice ? 8: 10,
  },
  primaryButton: {
    backgroundColor: authTheme.primaryButton.backgroundColor,
    height: isSmallDevice ? 40 : 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
