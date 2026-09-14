import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketCheckoutLockIcon } from '@/components/market/MarketCheckoutIcons';
import {
  MARKET_CHECKOUT_BORDER,
  MARKET_CHECKOUT_TEAL,
} from '@/components/market/marketCheckoutData';
import { useCart } from '@/hooks/useCart';
import { buildMarketCartSummary } from '@/utils/marketCart.mapper';
import { c, NU } from '@/utils/newUiCompact';

type MarketCheckoutFooterProps = {
  onPay?: () => void;
  isPaying?: boolean;
  disabled?: boolean;
};

export function MarketCheckoutFooter({
  onPay,
  isPaying = false,
  disabled = false,
}: MarketCheckoutFooterProps) {
  const insets = useSafeAreaInsets();
  const { cart } = useCart();
  const summary = useMemo(() => buildMarketCartSummary(cart), [cart]);
  const isDisabled = disabled || isPaying || !cart?.items.length;

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, c(22, 18)) }]}>
      <Pressable
        style={[styles.pay, isDisabled && styles.payDisabled]}
        onPress={onPay}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: isPaying }}
      >
        {isPaying ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <MarketCheckoutLockIcon />
            <Text style={styles.payText}>Pay {summary.total}</Text>
          </>
        )}
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
  payDisabled: {
    opacity: 0.7,
  },
  payText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
