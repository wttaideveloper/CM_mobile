import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketCartBody } from '@/components/market/MarketCartBody';
import { MarketCartFooter } from '@/components/market/MarketCartFooter';
import { MarketCartHeader } from '@/components/market/MarketCartHeader';
import {
  MARKET_CART_BG,
  MARKET_CART_GREEN,
} from '@/components/market/marketCartData';

export function MarketCartScreen() {
  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={MARKET_CART_GREEN} />
      <StatusBarFill lightColor={MARKET_CART_GREEN} darkColor={MARKET_CART_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketCartHeader />
        <MarketCartBody />
      </ScrollView>
      <MarketCartFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MARKET_CART_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
