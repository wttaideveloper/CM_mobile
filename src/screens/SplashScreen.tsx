import { useCallback, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { Image, StyleSheet, View } from 'react-native';

// import { BrandLogo } from '@/components/BrandLogo';
import { colors } from '@/constants/authTheme';

/** How long the splash screen shows (milliseconds). Edit this value to change duration. */
export const SPLASH_DURATION_MS = 2500;

const splashBrandImage = require('../../assets/splash-brand.png');

export function SplashScreen() {
  const router = useRouter();
  const hasHiddenNativeSplash = useRef(false);

  const onSplashLayout = useCallback(() => {
    if (hasHiddenNativeSplash.current) {
      return;
    }
    hasHiddenNativeSplash.current = true;
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container} onLayout={onSplashLayout}>
      <StatusBar style="dark" />
      {/* Previous logo + text splash — kept for reference
      <BrandLogo />
      */}
      <Image
        source={splashBrandImage}
        style={styles.splashImage}
        resizeMode="contain"
        accessibilityLabel="Invigorate Health"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});
