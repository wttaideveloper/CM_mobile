import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketBody } from '@/components/market/MarketBody';
import { MarketHeader } from '@/components/market/MarketHeader';
import { MARKET_BG } from '@/components/market/marketDashboardData';

export function MarketScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('All');

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <MarketHeader activeFilter={filter} onFilterChange={setFilter} />
        <MarketBody />
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
