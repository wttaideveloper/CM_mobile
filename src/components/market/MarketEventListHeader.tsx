import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { MarketBackIcon, MarketSearchIcon } from '@/components/market/MarketIcons';
import { EVENT_LIST_GREEN } from '@/components/market/marketEventListData';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type MarketEventListHeaderProps = {
  count: number;
};

export function MarketEventListHeader({ count }: MarketEventListHeaderProps) {
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
          <Text style={styles.eyebrow}>Marketplace</Text>
          <Text style={styles.title}>Events & courses</Text>
        </View>
      </View>
      <Pressable
        style={styles.search}
        onPress={() => router.push('/(main)/search-data')}
        accessibilityRole="button"
      >
        <MarketSearchIcon />
        <Text style={styles.searchText}>Search events or courses</Text>
      </Pressable>
      <Text style={styles.count}>{count} upcoming</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: EVENT_LIST_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTop,
    paddingBottom: NU.headerPadBottom,
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
  count: {
    marginTop: NU.cardGap,
    fontSize: NU.body,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    zIndex: 1,
  },
});
