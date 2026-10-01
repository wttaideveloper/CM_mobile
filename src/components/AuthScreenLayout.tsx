import type { ReactNode } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { AUTH_BG_ONBOARDING } from '../constants/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthScreenLayoutProps = {
  children: ReactNode;
  showSkip?: boolean;
  onSkip?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  /** Content starts at this fraction of the area below the status bar. */
  contentTopRatio?: number;
  backgroundImage?: ImageSource;
};

export function AuthScreenLayout({
  children,
  showSkip = false,
  onSkip,
  showBack = false,
  onBack,
  contentTopRatio = 0.6,
  backgroundImage = AUTH_BG_ONBOARDING,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const bodyHeight = Dimensions.get('window').height - insets.top;
  const contentTop = bodyHeight * contentTopRatio;

  return (
    <View style={styles.root}>
      <AppStatusBar />
      <StatusBarFill lightColor="#FFFFFF" />

      <View style={styles.body}>
        <Image
          source={backgroundImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          transition={0}
        />

        {showBack && onBack && (
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to sign in"
          >
            <ChevronLeftIcon size={20} color="#FFFFFF" />
          </Pressable>
        )}

        {showSkip && onSkip && (
          <Pressable
            style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
            onPress={onSkip}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Skip"
            accessibilityHint="Skips onboarding and goes to sign in"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}

        <View style={[styles.content, { paddingTop: contentTop }]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: '#f2fff3',
  },
  body: {
    flex: 1,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B3D35',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  backButtonPressed: {
    backgroundColor: '#0F241C',
  },
  skipButton: {
    position: 'absolute',
    top: 12,
    right: 24,
    backgroundColor: '#1B3D35',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 24,
    zIndex: 2,
  },
  skipButtonPressed: {
    backgroundColor: '#0F241C',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 24,
  },
});
