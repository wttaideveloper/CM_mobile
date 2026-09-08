import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketOfferListBody } from '@/components/market/MarketOfferListBody';
import { MarketOfferListHeader } from '@/components/market/MarketOfferListHeader';
import {
  MARKET_OFFERS_ALL,
  OFFER_LIST_BG,
  OFFER_LIST_GREEN,
} from '@/components/market/marketOfferListData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

export function MarketOfferListScreen() {
  const scrollRef = useScrollToTopOnFocus();
  const [filter, setFilter] = useState('All');
  const count = useMemo(() => {
    if (filter === 'Products') {
      return MARKET_OFFERS_ALL.filter((o) => o.kind === 'PRODUCT').length;
    }
    if (filter === 'Services') {
      return MARKET_OFFERS_ALL.filter((o) => o.kind === 'SERVICE').length;
    }
    return MARKET_OFFERS_ALL.length;
  }, [filter]);

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
