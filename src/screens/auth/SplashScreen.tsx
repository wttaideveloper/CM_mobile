import { useCallback, useEffect, useRef } from 'react';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** How long the splash screen shows (milliseconds). Edit this value to change duration. */
export const SPLASH_DURATION_MS = 2500;

/** Client design frame from the provided HTML. */
const DESIGN_W = 430;
const DESIGN_H = 932;

const SPLASH_BG = '#f0fdf2';
const FOOTER_COLOR = '#1d5c46';
const FOOTER_COPY = 'Invigorate Health · Restoring Mind · Body · Spirit';

/** Cropped + 2x logo asset (icon + Invigorate/Health + tagline). */
const LOGO_ASPECT = 1152 / 360;

const splashLogo = require('../../../assets/splash-logo.png');
const splashDeco = require('../../../assets/splash-deco.png');

export function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const hasHiddenNativeSplash = useRef(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(8)).current;

  const scaleW = width / DESIGN_W;
  const scaleH = height / DESIGN_H;

  // Top brand (icon + heading) — slightly smaller than full design width.
  const logoWidth = Math.min(width * 0.72, 310 * scaleW);
  const logoHeight = logoWidth / LOGO_ASPECT;
  const logoTop = insets.top + 48 * scaleH;
  const logoLeft = (width - logoWidth) / 2;

  // Middle watermark — slightly larger for presence.
  const decoSize = 860 * scaleW;
  const decoLeft = -410 * scaleW;
  const decoTop = 110 * scaleH;

  const onSplashLayout = useCallback(() => {
    if (hasHiddenNativeSplash.current) {
      return;
    }
    hasHiddenNativeSplash.current = true;
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoTranslateY]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container} onLayout={onSplashLayout}>
      <StatusBar style="dark" />

      {/* Middle watermark heart */}
      <Image
        source={splashDeco}
        style={{
          position: 'absolute',
          left: decoLeft,
          top: decoTop,
          width: decoSize,
          height: decoSize,
        }}
        contentFit="contain"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />

      <Animated.View
        style={{
          position: 'absolute',
          left: logoLeft,
          top: logoTop,
          width: logoWidth,
          height: logoHeight,
          opacity: logoOpacity,
          transform: [{ translateY: logoTranslateY }],
        }}
      >
        <Image
          source={splashLogo}
          style={styles.logoImage}
          contentFit="contain"
          accessibilityLabel="Invigorate Health — Restoring · Mind · Body · Spirit"
        />
      </Animated.View>

      <Text
        style={[
          styles.footer,
          {
            bottom: Math.max(insets.bottom, 12) + 22 * scaleH,
            fontSize: Math.max(12, 12.5 * scaleW),
          },
        ]}
      >
        {FOOTER_COPY}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BG,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.12,
    color: FOOTER_COLOR,
  },
});
