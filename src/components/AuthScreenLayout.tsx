import type { ReactNode } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { AUTH_BG_ONBOARDING } from '../constants/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthScreenLayoutProps = {
  children: ReactNode;
  showSkip?: boolean;
  onSkip?: () => void;
  /** Content starts at this fraction of the area below the status bar. */
  contentTopRatio?: number;
  backgroundImage?: ImageSource;
};

export function AuthScreenLayout({
  children,
  showSkip = false,
  onSkip,
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
          transition={200}
        />

        {showSkip && onSkip && (
          <Pressable style={styles.skipButton} onPress={onSkip}>
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
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    width: '100%',
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
