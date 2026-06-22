import '@/services/api/interceptors';
import { useAuthStore } from '@/stores/auth.store';
import { QueryProvider } from '@/providers/QueryProvider';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SPLASH_BG = '#FFFFFF';

function RootNav() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: SPLASH_BG }}>
      <SafeAreaProvider>
        <QueryProvider>
          <RootNav />
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
