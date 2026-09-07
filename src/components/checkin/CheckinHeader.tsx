import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { CheckinCalendarIcon } from '@/components/checkin/CheckinIcons';
import {
  CHECKIN_GREEN,
  CHECKIN_HEADER,
} from '@/components/checkin/checkinData';
import { MarketBackIcon } from '@/components/market/MarketIcons';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/checkin-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type CheckinHeaderProps = {
  goalsMet: number;
  goalsTotal: number;
};

export function CheckinHeader({ goalsMet, goalsTotal }: CheckinHeaderProps) {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;
  const progressPct = Math.min(100, (goalsMet / goalsTotal) * 100);

  return (
    <View style={styles.header}>
      <Image
        source={headerDeco}
        style={{
          position: 'absolute',
          left: 218 * scale,
          top: 26.5 * scale,
          width: 218.1 * scale,
          height: 331.7 * scale,
          opacity: 0.55,
        }}
        contentFit="contain"
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
          <MarketBackIcon />
        </Pressable>
        <View style={styles.titleBlock}>
          <View style={styles.dateRow}>
            <CheckinCalendarIcon />
            <Text style={styles.dateText}>{CHECKIN_HEADER.dateLabel}</Text>
          </View>
          <Text style={styles.title}>{CHECKIN_HEADER.title}</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>{CHECKIN_HEADER.progressLabel}</Text>
          <Text style={styles.progressValue}>
            {goalsMet}/{goalsTotal} goals met
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={styles.progressHint}>{CHECKIN_HEADER.progressHint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: CHECKIN_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTop,
    paddingBottom: NU.headerPadBottomTall,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(7, 5),
  },
  dateText: {
    fontSize: NU.eyebrow,
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    fontSize: NU.title,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  progressCard: {
    marginTop: NU.headerPadTopHome,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: NU.cardRadius,
    padding: NU.cardPad,
    zIndex: 1,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: NU.cardTitle,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressValue: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressTrack: {
    marginTop: NU.cardPadXs,
    height: c(8, 6),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  progressFill: {
    height: c(8, 6),
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
  },
  progressHint: {
    marginTop: NU.cardPadXs,
    fontSize: NU.body,
    color: 'rgba(255,255,255,0.88)',
  },
});
