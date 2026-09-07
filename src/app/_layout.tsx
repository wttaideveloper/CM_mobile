import '@/services/api/interceptors';
import '@/i18n';
import { useEffect } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { Appearance, Platform, StatusBar as RNStatusBar } from 'react-native';
import { AuthSessionBootstrap } from '@/components/AuthSessionBootstrap';
// TEMP: hide tenant picker after login — restore SelectTenantModal when needed.
// import { SelectTenantModal } from '@/components/auth/SelectTenantModal';
import { PushNotificationsManager } from '@/components/PushNotificationsManager';
import { clearScreenPrivacyForDemo } from '@/hooks/useScreenPrivacy';
import { useAuthStore } from '@/stores/auth.store';
import { QueryProvider } from '@/providers/QueryProvider';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SPLASH_BG = '#f0fdf2';

/** Native splash is held in index.ts until auth bootstrap finishes. */
function NativeSplashGate() {
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  useEffect(() => {
    if (!isAuthReady) return;

    // After session restore, force a readable Android status bar (native splash can leave black-on-black).
    if (Platform.OS === 'android') {
      const dark = Appearance.getColorScheme() === 'dark';
      RNStatusBar.setTranslucent(false);
      RNStatusBar.setBackgroundColor(dark ? '#000000' : '#FFFFFF', true);
      RNStatusBar.setBarStyle(dark ? 'light-content' : 'dark-content', true);
    }

    ExpoSplashScreen.hideAsync().catch(() => {});
  }, [isAuthReady]);

  return null;
}

// TEMP: commented — Select tenant modal after login.
// function TenantPickerHost() {
//   const visible = useAuthStore((state) => state.isTenantPickerVisible);
//   const tenants = useAuthStore((state) => state.tenants);
//   const isLoading = useAuthStore((state) => state.isTenantPickerLoading);
//   const selectTenant = useAuthStore((state) => state.selectTenant);
//   const dismissTenantPicker = useAuthStore((state) => state.dismissTenantPicker);
//
//   return (
//     <SelectTenantModal
//       visible={visible}
//       tenants={tenants}
//       isLoading={isLoading}
//       onSelect={selectTenant}
//       onClose={dismissTenantPicker}
//     />
//   );
// }

function RootNav() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  if (!isAuthReady) {
    return null;
  }

  return (
    <>
      <PushNotificationsManager />
      {/* TEMP: hide Select tenant modal after login */}
      {/* <TenantPickerHost /> */}
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>

      {/* Social OAuth deep link: invigoratehealth://oauth — not used by email login */}
      <Stack.Screen name="oauth" />
      <Stack.Screen name="+not-found" />
    </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // TEMP: unlock screenshots/recordings for client demos.
    clearScreenPrivacyForDemo();
  }, []);

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
