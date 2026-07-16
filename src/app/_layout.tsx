import '@/services/api/interceptors';
import { useEffect } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { AuthSessionBootstrap } from '@/components/AuthSessionBootstrap';
import { PushNotificationsManager } from '@/components/PushNotificationsManager';
import { useAuthStore } from '@/stores/auth.store';
import { QueryProvider } from '@/providers/QueryProvider';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SPLASH_BG = '#FFFFFF';

/** Native splash is held in index.ts until auth bootstrap finishes. */
function NativeSplashGate() {
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  useEffect(() => {
    if (isAuthReady) {
      ExpoSplashScreen.hideAsync().catch(() => {});
    }
  }, [isAuthReady]);

  return null;
}

function RootNav() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  if (!isAuthReady) {
    return null;
  }

  return (
    <>
      <PushNotificationsManager />
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: SPLASH_BG }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryProvider>
            <AuthSessionBootstrap />
            <NativeSplashGate />
            <RootNav />
          </QueryProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
