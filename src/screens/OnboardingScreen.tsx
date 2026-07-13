import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBadge } from '@/components/AuthBadge';
import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { authTheme, colors } from '@/constants/authTheme';
import { AUTH_BG_ONBOARDING } from '@/constants/images';
import { isSmallDevice } from '@/utils/responsive';
type OnboardingScreenProps = {
  onNavigateToLogin?: () => void;
};

export function OnboardingScreen({ onNavigateToLogin }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();

  const goToLogin = () => onNavigateToLogin?.();

  return (
    <AuthScreenLayout
      showSkip
      onSkip={goToLogin}
      backgroundImage={AUTH_BG_ONBOARDING}
      contentTopRatio={isSmallDevice ? 0.65 : 0.578}
    >
      <View style={styles.content}>
        <AuthBadge label="INVIGORATE HEALTH" align="center" />

        <Text style={styles.heading}>
          <Text style={styles.headingRestoring}>Restoring </Text>
          <Text style={styles.headingAccent}>mind, body & spirit.</Text>
        </Text>

        <Text style={styles.subtext}>
          A simple, daily practice rooted in lifestyle, prevention and whole-person
          restoration.
        </Text>

        <View style={styles.dots}>
          <View style={styles.activeDot} />
          {/* <View style={styles.dot} /> */}
          {/* <View style={styles.dot} /> */}
          <View style={styles.dot} />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable style={styles.primaryButton} onPress={goToLogin}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>

        <Pressable onPress={goToLogin} style={styles.signInRow}>
          <Text style={styles.signInMuted}>Already a member? </Text>
          <Text style={styles.signInLink}>Sign in</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
  },
  heading: {
    fontSize: isSmallDevice ? 22 : 30,
    fontWeight: authTheme.headingDark.fontWeight,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: isSmallDevice ? 4 : 12,
  },
  headingRestoring: {
    color: '#274943',
  },
  headingAccent: {
    color: '#3E8040',
  },
  subtext: {
    fontSize: 15,
    fontWeight: '400',
    color: '#4F6158',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: isSmallDevice ? 24 : 28,
    paddingHorizontal: 2,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  activeDot: {
    width: 30,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3E8040',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brandLightGray,
  },
  footer: { 
    paddingTop: 8,
  },
  primaryButton: {
    backgroundColor: authTheme.primaryButton.backgroundColor,
    height: isSmallDevice ? 40 : 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  primaryButtonText: {
    color: authTheme.primaryButtonText.color,
    fontSize: 16,
    fontWeight: authTheme.primaryButtonText.fontWeight,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInMuted: {
    fontSize: 14,
    fontWeight: '400',
    color: '#234745',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: authTheme.link.fontWeight,
    color: authTheme.link.color,
  },
});
