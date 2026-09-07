import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EVENT_DETAIL_BORDER,
  EVENT_DETAIL_MUTED,
  EVENT_DETAIL_TEAL,
  MARKET_EVENT_DETAIL,
} from '@/components/market/marketEventDetailData';
import { c, NU } from '@/utils/newUiCompact';

type MarketEventDetailFooterProps = {
  onReserve?: () => void;
};

export function MarketEventDetailFooter({
  onReserve,
}: MarketEventDetailFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, c(22, 18)) }]}>
      <View style={styles.priceBlock}>
        <Text style={styles.priceLabel}>{MARKET_EVENT_DETAIL.priceLabel}</Text>
        <Text style={styles.price}>{MARKET_EVENT_DETAIL.price}</Text>
      </View>
      <Pressable
        style={styles.cta}
        onPress={onReserve}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>{MARKET_EVENT_DETAIL.cta}</Text>
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
    borderTopColor: EVENT_DETAIL_BORDER,
    flexDirection: 'row',
    gap: c(11, 9),
    alignItems: 'center',
  },
  priceBlock: {
    flexShrink: 0,
  },
  priceLabel: {
    fontSize: c(11.5, 10.5),
    color: EVENT_DETAIL_MUTED,
  },
  price: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: EVENT_DETAIL_TEAL,
  },
  cta: {
    flex: 1,
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: EVENT_DETAIL_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
