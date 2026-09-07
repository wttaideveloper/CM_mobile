import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ORDER_CONFIRMED_TEAL } from '@/components/market/marketOrderConfirmedData';
import { c, NU } from '@/utils/newUiCompact';

type MarketOrderConfirmedFooterProps = {
  onViewOrder?: () => void;
  onBackToMarket?: () => void;
};

export function MarketOrderConfirmedFooter({
  onViewOrder,
  onBackToMarket,
}: MarketOrderConfirmedFooterProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, c(26, 20)) }]}>
      <Pressable
        style={styles.primary}
        onPress={
          onViewOrder ?? (() => router.push('/(main)/market/orders'))
        }
        accessibilityRole="button"
      >
        <Text style={styles.primaryText}>View order</Text>
      </Pressable>
      <Pressable
        style={styles.secondary}
        onPress={
          onBackToMarket ??
          (() => router.replace('/(main)/(tabs)/market'))
        }
        accessibilityRole="button"
      >
        <Text style={styles.secondaryText}>Back to Marketplace</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: c(24, 20),
    gap: c(11, 9),
  },
  primary: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: ORDER_CONFIRMED_TEAL,
  },
  secondary: {
    height: c(46, 42),
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: NU.cardTitle,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
