import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketListingBody } from '@/components/market/MarketListingBody';
import { MarketListingFooter } from '@/components/market/MarketListingFooter';
import { MarketListingHeader } from '@/components/market/MarketListingHeader';
import {
  LISTING_BG,
  LISTING_GREEN,
  LISTING_MUTED,
} from '@/components/market/marketListingData';
import { useProduct } from '@/hooks/useProducts';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import {
  mapProductDetailToMarketListing,
  STATIC_MARKET_LISTING_VIEW,
} from '@/utils/marketListing.mapper';
import { c } from '@/utils/newUiCompact';

export function MarketListingScreen() {
  const scrollRef = useScrollToTopOnFocus();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const { product, isLoading, isError } = useProduct(productId, {
    enabled: Boolean(productId),
  });

  const listing =
    product != null
      ? mapProductDetailToMarketListing(product)
      : !productId || isError
        ? STATIC_MARKET_LISTING_VIEW
        : null;

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={LISTING_GREEN} />
      <StatusBarFill lightColor={LISTING_GREEN} darkColor={LISTING_GREEN} />
      {isLoading && productId && listing == null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={LISTING_GREEN} size="large" />
          <Text style={styles.loadingText}>Loading product…</Text>
        </View>
      ) : listing != null ? (
        <>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <MarketListingHeader listing={listing} />
            <MarketListingBody listing={listing} />
          </ScrollView>
          <MarketListingFooter listing={listing} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LISTING_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(12, 10),
  },
  loadingText: {
    fontSize: c(14, 13),
    color: LISTING_MUTED,
  },
});
