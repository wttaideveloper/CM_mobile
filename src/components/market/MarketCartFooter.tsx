import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MARKET_CART_BORDER,
  MARKET_CART_SUMMARY,
  MARKET_CART_TEAL,
} from '@/components/market/marketCartData';
import { c, NU } from '@/utils/newUiCompact';

type MarketCartFooterProps = {
  onCheckout?: () => void;
};

export function MarketCartFooter({ onCheckout }: MarketCartFooterProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, c(22, 18)) }]}>
      <Pressable
        style={styles.checkout}
        onPress={
          onCheckout ?? (() => router.push('/(main)/market/checkout'))
        }
        accessibilityRole="button"
      >
        <Text style={styles.checkoutText}>
          Checkout · {MARKET_CART_SUMMARY.total}
        </Text>
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
    borderTopColor: MARKET_CART_BORDER,
  },
  checkout: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: MARKET_CART_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
