import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  LIB_BG,
  LIB_BORDER,
  LIB_GREEN,
  LIB_MUTED,
  LIB_TEAL,
  LISTENING_CONTENT,
} from '@/components/library/libraryData';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketBackIcon } from '@/components/market/MarketIcons';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

export function ListeningScreen() {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;
  const content = LISTENING_CONTENT;

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={LIB_GREEN} />
      <StatusBarFill lightColor={LIB_GREEN} darkColor={LIB_GREEN} />
      <View style={styles.header}>
        <Image
          source={headerDeco}
          style={{
            position: 'absolute',
            left: 0,
            top: -32.5 * scale,
            width: SCREEN_W,
            height: 360 * scale,
          }}
          contentFit="cover"
          pointerEvents="none"
          transition={0}
        />
        <View style={styles.topRow}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <MarketBackIcon />
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>{content.eyebrow}</Text>
            <Text style={styles.title}>{content.title}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.track}>{content.track}</Text>
          <Text style={styles.artist}>{content.artist}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${content.progress * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{content.elapsed}</Text>
            <Text style={styles.time}>{content.remaining}</Text>
          </View>
          <Pressable
            style={styles.cta}
            onPress={() => router.push('/(main)/(tabs)/check-in')}
          >
            <Text style={styles.ctaText}>Log air</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: LIB_BG },
  header: {
    backgroundColor: LIB_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTop,
    paddingBottom: NU.headerPadBottomTall,
    borderBottomLeftRadius: c(30, 26),
    borderBottomRightRadius: c(30, 26),
    overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: NU.rowGap, zIndex: 1 },
  iconBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1 },
  eyebrow: { fontSize: NU.eyebrow, color: 'rgba(255,255,255,0.85)' },
  title: {
    fontSize: NU.title,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  body: { padding: NU.hPad },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LIB_BORDER,
    borderRadius: c(18, 16),
    padding: c(20, 16),
    gap: c(10, 8),
  },
  track: { fontSize: NU.heading, fontWeight: '800', color: LIB_TEAL },
  artist: { fontSize: NU.link, color: LIB_MUTED },
  progressTrack: {
    marginTop: NU.cardGap,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#e6f4e8',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: LIB_GREEN },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: { fontSize: NU.bodySm, color: LIB_MUTED, fontWeight: '600' },
  cta: {
    marginTop: c(10, 8),
    height: NU.searchH,
    borderRadius: 99,
    backgroundColor: LIB_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: NU.cardTitle, fontWeight: '700' },
});
