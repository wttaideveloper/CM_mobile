import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketOrdersBody } from '@/components/market/MarketOrdersBody';
import { MarketOrdersHeader } from '@/components/market/MarketOrdersHeader';
import {
  ORDERS_BG,
  ORDERS_GREEN,
  ORDERS_TABS,
  type OrdersTab,
} from '@/components/market/marketOrdersData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

function parseOrdersTab(value?: string | string[]): OrdersTab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && (ORDERS_TABS as string[]).includes(raw)) {
    return raw as OrdersTab;
  }
  return 'Subscriptions';
}

export function MarketOrdersScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<OrdersTab>(() => parseOrdersTab(tab));

  useEffect(() => {
    setActiveTab(parseOrdersTab(tab));
  }, [tab]);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={ORDERS_GREEN} />
      <StatusBarFill lightColor={ORDERS_GREEN} darkColor={ORDERS_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <MarketOrdersHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <MarketOrdersBody activeTab={activeTab} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ORDERS_BG,
  },
  scroll: {
    flex: 1,
  },
});
