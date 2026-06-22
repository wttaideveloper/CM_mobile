import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBadge } from '@/components/AuthBadge';
import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { authTheme, colors } from '@/constants/authTheme';
import { AUTH_BG_ONBOARDING } from '@/constants/images';

type OnboardingScreenProps = {
  onNavigateToLogin?: () => void;
};

/** Original onboarding screen — used with AuthPagerScreen for full client demo flow. */
export function OnboardingScreen({ onNavigateToLogin }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();

  const goToLogin = () => onNavigateToLogin?.();

  return (
    <AuthScreenLayout
      showSkip
      onSkip={goToLogin}
      backgroundImage={AUTH_BG_ONBOARDING}
      contentTopRatio={0.6}
    >
      <View style={styles.content}>
        <AuthBadge label="INVIGORATE HEALTH" align="center" />

        <Text style={styles.heading}>
          Restoring mind,{'\n'}body & spirit.
        </Text>

        <Text style={styles.subtext}>
          A simple, daily practice rooted in lifestyle, prevention and whole-person
          restoration.
        </Text>

        <View style={styles.dots}>
          <View style={styles.activeDot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
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
    paddingTop: 4,
  },
  heading: {
    fontSize: 32,
    fontWeight: authTheme.headingDark.fontWeight,
    color: colors.brandDark,
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 18,
  },
  subtext: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.brandGray,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
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
    backgroundColor: colors.brandDarkGreen,
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
    height: 54,
    borderRadius: authTheme.primaryButton.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    color: colors.brandGray,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: authTheme.link.fontWeight,
    color: authTheme.link.color,
  },
});
