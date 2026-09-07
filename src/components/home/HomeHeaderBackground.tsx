import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { HOME_ACCENT_GREEN } from '@/components/home/homeData';
import { homePartsStyles as styles } from '@/components/home/homePartsStyles';

export function HomeHeaderBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="headerGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#163D34" />
            <Stop offset="0.55" stopColor="#1A5245" />
            <Stop offset="1" stopColor="#1F5D4E" />
          </SvgGradient>
          <RadialGradient
            id="headerLeafGlow"
            cx="1"
            cy="1"
            r="1.05"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0" stopColor={'#2B773F'} stopOpacity={0.80} />
            <Stop offset="0.32" stopColor="#2B773F" stopOpacity={0.6} />
            <Stop offset="0.65" stopColor="#2B773F" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#2B773F" stopOpacity={0} />
          </RadialGradient>
          <SvgGradient id="headerLeafSweep" x1="1" y1="1" x2="0.1" y2="0.15">
            <Stop offset="0" stopColor={HOME_ACCENT_GREEN} stopOpacity={0.45} />
            <Stop offset="0.4" stopColor="#38A06E" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#163D34" stopOpacity={0} />
          </SvgGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#headerGrad)" />
        <Rect width="100%" height="100%" fill="url(#headerLeafGlow)" />
        <Rect width="100%" height="100%" fill="url(#headerLeafSweep)" />
      </Svg>
      <View style={styles.headerArcLeft} />
      <View style={styles.headerArcRight} />
    </View>
  );
}
