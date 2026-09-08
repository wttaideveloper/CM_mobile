import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  MarketBackIcon,
  MarketHeartIcon,
} from '@/components/market/MarketIcons';
import { LISTING_GREEN } from '@/components/market/marketListingData';
import type { MarketListingView } from '@/utils/marketListing.mapper';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/market-header-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

type MarketListingHeaderProps = {
  listing: MarketListingView;
};

export function MarketListingHeader({ listing }: MarketListingHeaderProps) {
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
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Pressable style={styles.iconBtn} accessibilityRole="button">
          <MarketHeartIcon color="#fff" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: LISTING_GREEN,
    paddingHorizontal: NU.hPad,
    paddingTop: NU.headerPadTop,
    paddingBottom: NU.headerPadBottomTall,
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
  title: {
    flex: 1,
    fontSize: NU.cardTitleLg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
