import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { HomeTrendIcon } from '@/components/home/HomeDashboardIcons';
import {
  HWI_SCORE,
  HWI_WEEK_DELTA,
  HOME_DASH_GREEN,
} from '@/components/hwi/hwiDashboardData';
import { HwiScoreRing } from '@/components/hwi/HwiScoreRing';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/home-header-heart.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

function BackChevron() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="m15 18-6-6 6-6"
        stroke="#fff"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function HwiDashboardHeader() {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;

  return (
    <View style={styles.header}>
      <Image
        source={headerDeco}
        style={{
          position: 'absolute',
          left: 200 * scale,
          bottom: 0,
          width: 225 * scale,
          height: 390 * scale,
        }}
        contentFit="contain"
        contentPosition="bottom right"
        pointerEvents="none"
        transition={0}
      />

      <View style={styles.topRow}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(main)/(tabs)');
          }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <BackChevron />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Health & Wellness Index</Text>
          <Text style={styles.title}>Your HWI™</Text>
        </View>
      </View>

      <View style={styles.scoreBlock}>
        <HwiScoreRing
          score={HWI_SCORE}
          size={c(132, 110)}
          strokeWidth={c(9, 7)}
          scoreFontSize={c(46, 38)}
          labelFontSize={NU.bodySm}
        />
        <View style={styles.deltaPill}>
          <HomeTrendIcon color="#a1ffa7" size={16} />
          <Text style={styles.deltaText}>{HWI_WEEK_DELTA}</Text>
        </View>
        <Text style={styles.meta}>Overall score • Updated today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: HOME_DASH_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: c(10, 8),
    paddingBottom: NU.headerPadBottomHome,
    borderBottomLeftRadius: c(30, 26),
    borderBottomRightRadius: c(30, 26),
    overflow: 'hidden',
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.rowGap,
    zIndex: 1,
  },
  backBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: NU.eyebrow,
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: NU.title,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  scoreBlock: {
    marginTop: NU.groupGap,
    alignItems: 'center',
    gap: NU.rowGap,
    zIndex: 1,
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    paddingVertical: c(7, 5),
    paddingHorizontal: NU.chipPadH,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  deltaText: {
    fontSize: NU.chipFont,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  meta: {
    fontSize: NU.subtitle,
    color: 'rgba(255,255,255,0.8)',
  },
});
