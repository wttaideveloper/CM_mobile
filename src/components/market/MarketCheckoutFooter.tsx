import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketCheckoutLockIcon } from '@/components/market/MarketCheckoutIcons';
import {
  MARKET_CHECKOUT,
  MARKET_CHECKOUT_BORDER,
  MARKET_CHECKOUT_TEAL,
} from '@/components/market/marketCheckoutData';
import { c, NU } from '@/utils/newUiCompact';

type MarketCheckoutFooterProps = {
  onPay?: () => void;
};

export function MarketCheckoutFooter({ onPay }: MarketCheckoutFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, c(22, 18)) }]}>
      <Pressable style={styles.pay} onPress={onPay} accessibilityRole="button">
        <MarketCheckoutLockIcon />
        <Text style={styles.payText}>Pay {MARKET_CHECKOUT.total}</Text>
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
    borderTopColor: MARKET_CHECKOUT_BORDER,
  },
  pay: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: MARKET_CHECKOUT_TEAL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(8, 6),
  },
  payText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
