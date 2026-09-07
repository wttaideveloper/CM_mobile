import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { MarketBackIcon, MarketSearchIcon } from '@/components/market/MarketIcons';
import {
  PILLAR_GREEN,
  type PillarBrowseContent,
} from '@/components/market/marketPillarData';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type MarketPillarHeaderProps = {
  pillar: PillarBrowseContent;
};

export function MarketPillarHeader({ pillar }: MarketPillarHeaderProps) {
  const router = useRouter();
  const scale = SCREEN_W / DESIGN_W;

  return (
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
          accessibilityLabel="Back"
        >
          <MarketBackIcon />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{pillar.eyebrow}</Text>
          <Text style={styles.title}>{pillar.title}</Text>
        </View>
      </View>
      <Pressable
        style={styles.search}
        onPress={() => router.push('/(main)/search-data')}
        accessibilityRole="button"
      >
        <MarketSearchIcon />
        <Text style={styles.searchText}>
          Search in {pillar.title.toLowerCase()}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: PILLAR_GREEN,
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
  iconBtn: {
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
  search: {
    marginTop: NU.cardPad,
    height: NU.searchH,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingHorizontal: NU.cardPad,
    zIndex: 1,
  },
  searchText: {
    fontSize: NU.link,
    color: 'rgba(255,255,255,0.78)',
  },
});
