import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../constants/authTheme';

const LOGO_ICON_SIZE = 92;

function LogoIcon() {
  return (
    <Svg width={LOGO_ICON_SIZE} height={LOGO_ICON_SIZE} viewBox="0 0 80 80">
      <Path
        d="M40 62 C18 44, 12 28, 22 18 C30 12, 38 18, 40 30"
        stroke={colors.brandAccentGreen}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M40 62 C62 44, 68 28, 58 18 C50 12, 42 18, 40 30"
        stroke={colors.brandDark}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function BrandLogo() {
  return (
    <View style={styles.container}>
      <LogoIcon />
      <View style={styles.textBlock}>
        <Text style={styles.title}>Invigorate</Text>
        <Text style={styles.subtitle}>Health</Text>
        <Text style={styles.tagline}>
          <Text style={styles.taglineBold}>Restoring</Text>
          <Text style={styles.taglineRest}> · Mind · Body · Spirit</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    flexShrink: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#274545',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#264547',
    letterSpacing: 0.3,
    marginTop: -8,
  },
  tagline: {
    fontSize: 14,
    marginTop: -6,
  },
  taglineBold: {
    fontSize: 14,
    fontWeight: '600',
  },
  taglineRest: {
    fontWeight: '300',
    color: 'black',
  },
});
