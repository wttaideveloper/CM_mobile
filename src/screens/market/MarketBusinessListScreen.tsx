import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketBusinessListBody } from '@/components/market/MarketBusinessListBody';
import { MarketBusinessListHeader } from '@/components/market/MarketBusinessListHeader';
import {
  BIZ_LIST_BG,
  BIZ_LIST_GREEN,
  FEATURED_BUSINESSES_ALL,
} from '@/components/market/marketBusinessListData';

export function MarketBusinessListScreen() {
  const [sort, setSort] = useState('Closest');

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={BIZ_LIST_GREEN} />
      <StatusBarFill lightColor={BIZ_LIST_GREEN} darkColor={BIZ_LIST_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketBusinessListHeader count={FEATURED_BUSINESSES_ALL.length} />
        <MarketBusinessListBody sort={sort} onSortChange={setSort} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BIZ_LIST_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
