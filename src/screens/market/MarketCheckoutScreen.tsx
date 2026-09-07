import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketCheckoutBody } from '@/components/market/MarketCheckoutBody';
import { MarketCheckoutFooter } from '@/components/market/MarketCheckoutFooter';
import { MarketCheckoutHeader } from '@/components/market/MarketCheckoutHeader';
import {
  MARKET_CHECKOUT_BG,
  MARKET_CHECKOUT_GREEN,
} from '@/components/market/marketCheckoutData';

export function MarketCheckoutScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={MARKET_CHECKOUT_GREEN} />
      <StatusBarFill
        lightColor={MARKET_CHECKOUT_GREEN}
        darkColor={MARKET_CHECKOUT_GREEN}
      />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketCheckoutHeader />
        <MarketCheckoutBody />
      </ScrollView>
      <MarketCheckoutFooter
        onPay={() => router.push('/(main)/market/order-confirmed')}
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
