import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketEventListBody } from '@/components/market/MarketEventListBody';
import { MarketEventListHeader } from '@/components/market/MarketEventListHeader';
import {
  EVENT_LIST_BG,
  EVENT_LIST_GREEN,
  MARKET_EVENTS_ALL,
} from '@/components/market/marketEventListData';

export function MarketEventListScreen() {
  const [filter, setFilter] = useState('All');
  const count = useMemo(() => {
    if (filter === 'Events') {
      return MARKET_EVENTS_ALL.filter((i) => i.kind === 'event').length;
    }
    if (filter === 'Courses') {
      return MARKET_EVENTS_ALL.filter((i) => i.kind === 'course').length;
    }
    return MARKET_EVENTS_ALL.length;
  }, [filter]);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={EVENT_LIST_GREEN} />
      <StatusBarFill lightColor={EVENT_LIST_GREEN} darkColor={EVENT_LIST_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketEventListHeader count={count} />
        <MarketEventListBody filter={filter} onFilterChange={setFilter} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: EVENT_LIST_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
