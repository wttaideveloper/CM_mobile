import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { MOCK_PAYMENT } from '@/constants/checkout';
import { PRIMARY, checkoutStyles as styles } from '@/screens/checkout/checkout.styles';
import { getCheckoutTotals, useCartStore } from '@/stores/cart.store';
import { formatProductPrice } from '@/utils/product.mapper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checkoutItems = useCartStore((state) => state.checkoutItems);
  const clearCheckout = useCartStore((state) => state.clearCheckout);
  const totals = getCheckoutTotals(checkoutItems);
  const [form, setForm] = useState(MOCK_PAYMENT);
  const [paid, setPaid] = useState(false);
  const [orderId] = useState(() => `IH-${Date.now().toString().slice(-6)}`);

  if (paid) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <StatusBarFill />
        <View style={styles.successWrap}>
          <View style={styles.successBadge}>
            <Text style={{ fontSize: 28 }}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Order placed</Text>
          <Text style={styles.successText}>
            Order {orderId} for {formatProductPrice(totals.total, totals.currency)} is confirmed.
            Demo checkout only — no payment was charged.
          </Text>
          <LeafyGradientButton
            style={[styles.cta, { alignSelf: 'stretch' }]}
            borderRadius={14}
            onPress={() => {
              clearCheckout();
              router.replace('/(main)/(tabs)/shop');
            }}
          >
            <Text style={styles.ctaText}>Continue shopping</Text>
          </LeafyGradientButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.header, { paddingTop: 8 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <ChevronLeftIcon size={20} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.stepText}>3 of 3</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PAY</Text>
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
          <View style={[styles.summaryRow, { marginBottom: 0 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatProductPrice(totals.total, totals.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Name on card</Text>
          <TextInput
            style={styles.input}
            value={form.cardName}
            onChangeText={(cardName) => setForm((current) => ({ ...current, cardName }))}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Card number</Text>
          <TextInput
            style={styles.input}
            value={form.cardNumber}
            onChangeText={(cardNumber) => setForm((current) => ({ ...current, cardNumber }))}
            keyboardType="number-pad"
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>Expiry</Text>
              <TextInput
                style={styles.input}
                value={form.expiry}
                onChangeText={(expiry) => setForm((current) => ({ ...current, expiry }))}
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                value={form.cvv}
                onChangeText={(cvv) => setForm((current) => ({ ...current, cvv }))}
                keyboardType="number-pad"
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <LeafyGradientButton
          style={styles.cta}
          borderRadius={14}
          onPress={() => setPaid(true)}
        >
          <Text style={styles.ctaText}>
            Pay {formatProductPrice(totals.total, totals.currency)}
          </Text>
        </LeafyGradientButton>
      </View>
    </View>
  );
}
