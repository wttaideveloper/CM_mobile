import { getCheckoutTotals, useCartStore } from '@/stores/cart.store';
import { formatProductPrice } from '@/utils/product.mapper';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PRIMARY, checkoutStyles as styles } from '@/screens/checkout/checkout.styles';

type CheckoutOrderSummaryProps = {
  compact?: boolean;
};

export function CheckoutOrderSummary({ compact = false }: CheckoutOrderSummaryProps) {
  const checkoutItems = useCartStore((state) => state.checkoutItems);
  const totals = getCheckoutTotals(checkoutItems);
  const [expanded, setExpanded] = useState(false);

  if (checkoutItems.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactSummaryCard}>
        <Pressable
          onPress={() => setExpanded((current) => !current)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={({ pressed }) => [
            styles.compactSummaryHeader,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.compactSummaryLeft}>
            <Text style={styles.compactSummaryTitle}>Order summary</Text>
            <Text style={styles.compactSummaryMeta}>
              {totals.count} {totals.count === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <View style={styles.compactSummaryRight}>
            <Text style={styles.compactSummaryTotal}>
              {formatProductPrice(totals.total, totals.currency)}
            </Text>
            <Text style={styles.compactSummaryChevron}>{expanded ? '▲' : '▼'}</Text>
          </View>
        </Pressable>

        {expanded ? (
          <View style={styles.compactSummaryBody}>
            {checkoutItems.map((item) => (
              <View key={item.productId} style={styles.summaryRow}>
                <Text style={styles.summaryLabel} numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={styles.summaryValue}>
                  {formatProductPrice(item.unitPrice * item.quantity, item.currency)}
                </Text>
              </View>
            ))}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {formatProductPrice(totals.shipping, totals.currency)}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>ORDER</Text>
      {checkoutItems.map((item) => (
        <View key={item.productId} style={[styles.summaryRow, { marginBottom: 8 }]}>
          <Text style={styles.summaryLabel} numberOfLines={1}>
            {item.name} × {item.quantity}
          </Text>
          <Text style={styles.summaryValue}>
            {formatProductPrice(item.unitPrice * item.quantity, item.currency)}
          </Text>
        </View>
      ))}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Shipping</Text>
        <Text style={styles.summaryValue}>
          {formatProductPrice(totals.shipping, totals.currency)}
        </Text>
      </View>
      <View style={[styles.summaryRow, { marginBottom: 0, marginTop: 6 }]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={[styles.totalValue, { color: PRIMARY }]}>
          {formatProductPrice(totals.total, totals.currency)}
        </Text>
      </View>
    </View>
  );
}
