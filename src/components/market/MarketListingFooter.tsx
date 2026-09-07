import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingListIcon } from '@/components/market/MarketListingIcons';
import {
  LISTING_BORDER,
  LISTING_TEAL,
  MARKET_LISTING,
} from '@/components/market/marketListingData';
import { c, NU } from '@/utils/newUiCompact';

type MarketListingFooterProps = {
  onAddToCart?: () => void;
};

export function MarketListingFooter({ onAddToCart }: MarketListingFooterProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, c(22, 18)) }]}>
      <Pressable
        style={styles.listBtn}
        onPress={() => router.push('/(main)/market/cart')}
        accessibilityRole="button"
        accessibilityLabel="View cart"
      >
        <ListingListIcon />
      </Pressable>
      <Pressable
        style={styles.addBtn}
        onPress={onAddToCart ?? (() => router.push('/(main)/market/cart'))}
        accessibilityRole="button"
      >
        <Text style={styles.addText}>{MARKET_LISTING.cartLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: NU.hPad,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: LISTING_BORDER,
    flexDirection: 'row',
    gap: c(11, 9),
    alignItems: 'center',
  },
  listBtn: {
    width: c(46, 42),
    height: c(46, 42),
    borderRadius: NU.cardRadiusMd,
    borderWidth: 1,
    borderColor: '#c8e0cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flex: 1,
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: LISTING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
