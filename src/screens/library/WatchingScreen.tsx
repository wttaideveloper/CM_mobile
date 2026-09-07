import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import {
  LIB_BG,
  LIB_BORDER,
  LIB_GREEN,
  LIB_MUTED,
  LIB_TEAL,
  WATCHING_CONTENT,
} from '@/components/library/libraryData';
import { MarketBackIcon } from '@/components/market/MarketIcons';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

export function WatchingScreen() {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;
  const content = WATCHING_CONTENT;

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
        <View style={styles.player}>
          <View style={styles.playMark}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.track}>{content.track}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${content.progress * 100}%` }]} />
          </View>
          <Text style={styles.meta}>{content.meta}</Text>
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
  body: { padding: NU.hPad, gap: NU.groupGap },
  player: {
    height: 200,
    borderRadius: c(18, 16),
    backgroundColor: '#164744',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playMark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#FFFFFF', fontSize: NU.name, marginLeft: c(3, 2) },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LIB_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPad,
    gap: c(10, 8),
  },
  track: { fontSize: c(17, 15), fontWeight: '800', color: LIB_TEAL },
  progressTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: '#e6f4e8',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: LIB_GREEN },
  meta: { fontSize: NU.body, color: LIB_MUTED, fontWeight: '600' },
});
