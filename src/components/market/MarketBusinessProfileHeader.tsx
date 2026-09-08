import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { BizProfileShareIcon } from '@/components/market/MarketBusinessProfileIcons';
import {
  MarketBackIcon,
  MarketHeartIcon,
  MarketSearchIcon,
} from '@/components/market/MarketIcons';
import { BIZ_PROFILE_GREEN } from '@/components/market/marketBusinessProfileData';
import type { MarketBizProfileView } from '@/utils/marketBizProfile.mapper';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type MarketBusinessProfileHeaderProps = {
  profile: MarketBizProfileView;
};

export function MarketBusinessProfileHeader({
  profile,
}: MarketBusinessProfileHeaderProps) {
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
          <Text style={styles.eyebrow}>{profile.eyebrow}</Text>
          <Text style={styles.title}>{profile.shortName}</Text>
        </View>
        <View style={styles.spacer} />
        <Pressable style={styles.iconBtn} accessibilityRole="button">
          <MarketHeartIcon color="#fff" size={18} />
        </Pressable>
        <Pressable style={styles.iconBtn} accessibilityRole="button">
          <BizProfileShareIcon />
        </Pressable>
      </View>
      <Pressable
        style={styles.search}
        onPress={() => router.push('/(main)/search-data')}
        accessibilityRole="button"
      >
        <MarketSearchIcon />
        <Text style={styles.searchText}>
          Search products, services and events
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: BIZ_PROFILE_GREEN,
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
    flexShrink: 1,
  },
  spacer: {
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
    marginTop: NU.sectionGap,
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingHorizontal: NU.cardPad,
    zIndex: 1,
  },
  searchText: {
    fontSize: NU.link,
    color: 'rgba(255,255,255,0.8)',
  },
});
