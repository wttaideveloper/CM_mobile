import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/stores/auth.store';

/**
 * Deep-link landing for `invigoratehealth://oauth?he_session_code=...`.
 *
 * Token exchange is handled by WebBrowser + loginWithSocial (not this screen).
 * This route only exists so Expo Router does not show +not-found after Google/Facebook.
 * Email/password login never opens this path.
 */
export default function OAuthRedirectScreen() {
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!isAuthReady) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)" />;
  }

  // Social login still exchanging tokens — keep a blank shell (not not-found).
  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  // Cold open of /oauth with no active auth attempt.
  return <Redirect href="/(auth)/login" />;
}
