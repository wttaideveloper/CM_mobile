import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketBody } from '@/components/market/MarketBody';
import { MarketHeader } from '@/components/market/MarketHeader';
import { MARKET_BG } from '@/components/market/marketDashboardData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

const SEARCH_DEBOUNCE_MS = 400;

export function MarketScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <MarketHeader
          activeFilter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />
        <MarketBody searchQuery={debouncedSearch} activeFilter={filter} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MARKET_BG,
  },
  scroll: {
    flex: 1,
  },
});
