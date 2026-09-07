import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { MOCK_ADDRESS } from '@/constants/checkout';
import { PRIMARY, checkoutStyles as styles } from '@/screens/checkout/checkout.styles';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function StaticAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState(MOCK_ADDRESS);

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
        <Text style={styles.title}>Delivery address</Text>
        <Text style={styles.stepText}>2 of 3</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CheckoutOrderSummary />

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput
            style={styles.input}
            value={form.fullName}
            onChangeText={(fullName) => setForm((current) => ({ ...current, fullName }))}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(phone) => setForm((current) => ({ ...current, phone }))}
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>Address line 1</Text>
          <TextInput
            style={styles.input}
            value={form.line1}
            onChangeText={(line1) => setForm((current) => ({ ...current, line1 }))}
          />

          <Text style={styles.fieldLabel}>Address line 2</Text>
          <TextInput
            style={styles.input}
            value={form.line2}
            onChangeText={(line2) => setForm((current) => ({ ...current, line2 }))}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(city) => setForm((current) => ({ ...current, city }))}
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>State</Text>
              <TextInput
                style={styles.input}
                value={form.state}
                onChangeText={(state) => setForm((current) => ({ ...current, state }))}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>ZIP</Text>
              <TextInput
                style={styles.input}
                value={form.zip}
                onChangeText={(zip) => setForm((current) => ({ ...current, zip }))}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>Country</Text>
              <TextInput
                style={styles.input}
                value={form.country}
                onChangeText={(country) => setForm((current) => ({ ...current, country }))}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <LeafyGradientButton
          style={styles.cta}
          borderRadius={14}
          onPress={() => router.push('/(main)/checkout/payment')}
        >
          <Text style={styles.ctaText}>Continue to payment</Text>
        </LeafyGradientButton>
      </View>
    </View>
  );
}
