import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketCheckoutBody } from '@/components/market/MarketCheckoutBody';
import { MarketCheckoutFooter } from '@/components/market/MarketCheckoutFooter';
import { MarketCheckoutHeader } from '@/components/market/MarketCheckoutHeader';
import {
  MARKET_CHECKOUT_BG,
  MARKET_CHECKOUT_GREEN,
} from '@/components/market/marketCheckoutData';
import { useAddresses } from '@/hooks/useAddresses';
import { useCheckoutCart } from '@/hooks/useCart';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { useMarketCheckoutAddressStore } from '@/stores/marketCheckoutAddress.store';
import { savedAddressToCheckoutShipping } from '@/utils/address.mapper';

export function MarketCheckoutScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const { isLoading: isAddressesLoading } = useAddresses();
  const checkoutCart = useCheckoutCart();
  const address = useMarketCheckoutAddressStore((s) => {
    return (
      s.savedAddresses.find((item) => item.id === s.selectedAddressId) ??
      s.savedAddresses[0]
    );
  });

  const handlePay = async () => {
    if (!address) {
      Alert.alert(
        'Address required',
        'Please add or select a delivery address before paying.',
      );
      return;
    }

    try {
      await checkoutCart.mutateAsync({
        shipping_address: savedAddressToCheckoutShipping(address),
      });
      router.replace('/(main)/market/order-confirmed');
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Checkout failed. Please try again.';
      Alert.alert('Checkout failed', message);
    }
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={MARKET_CHECKOUT_GREEN} />
      <StatusBarFill
        lightColor={MARKET_CHECKOUT_GREEN}
        darkColor={MARKET_CHECKOUT_GREEN}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketCheckoutHeader />
        <MarketCheckoutBody />
      </ScrollView>
      <MarketCheckoutFooter
        onPay={() => void handlePay()}
        isPaying={checkoutCart.isPending}
        disabled={isAddressesLoading && !address}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MARKET_CHECKOUT_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
