import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketOrdersBody } from '@/components/market/MarketOrdersBody';
import { MarketOrdersHeader } from '@/components/market/MarketOrdersHeader';
import {
  ORDERS_BG,
  ORDERS_GREEN,
  type OrdersTab,
} from '@/components/market/marketOrdersData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';

export function MarketOrdersScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();
  const [activeTab, setActiveTab] =
    useState<OrdersTab>('Trainings and Courses');

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
