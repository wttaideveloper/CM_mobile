import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketOfferListBody } from '@/components/market/MarketOfferListBody';
import { MarketOfferListHeader } from '@/components/market/MarketOfferListHeader';
import {
  OFFER_LIST_BG,
  OFFER_LIST_GREEN,
} from '@/components/market/marketOfferListData';
import { useMarketProductsList } from '@/hooks/useProducts';
import { useMarketServicesList } from '@/hooks/useServices';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { mapProductsAndServicesToOfferList } from '@/utils/marketOffers.mapper';

export function MarketOfferListScreen() {
  const scrollRef = useScrollToTopOnFocus();
  const [filter, setFilter] = useState('All');
  const { data: products = [], isLoading: productsLoading } =
    useMarketProductsList();
  const { data: services = [], isLoading: servicesLoading } =
    useMarketServicesList();

  const isLoading = productsLoading || servicesLoading;
  const allOffers = useMemo(
    () =>
      isLoading
        ? []
        : mapProductsAndServicesToOfferList(products, services),
    [isLoading, products, services],
  );

  const count = useMemo(() => {
    if (filter === 'Products') {
      return allOffers.filter((o) => o.kind === 'PRODUCT').length;
    }
    if (filter === 'Services') {
      return allOffers.filter((o) => o.kind === 'SERVICE').length;
    }
    return allOffers.length;
  }, [allOffers, filter]);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={OFFER_LIST_GREEN} />
      <StatusBarFill lightColor={OFFER_LIST_GREEN} darkColor={OFFER_LIST_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketOfferListHeader count={count} />
        <MarketOfferListBody filter={filter} onFilterChange={setFilter} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: OFFER_LIST_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
