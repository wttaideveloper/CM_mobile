import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketPillarBody } from '@/components/market/MarketPillarBody';
import { MarketPillarHeader } from '@/components/market/MarketPillarHeader';
import {
  PILLAR_BG,
  PILLAR_GREEN,
  getPillarBrowseContent,
} from '@/components/market/marketPillarData';
import { usePillarSearch } from '@/hooks/useSearch';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { mapPillarSearchToBrowseContent } from '@/utils/marketPillar.mapper';

export function MarketPillarScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const scrollRef = useScrollToTopOnFocus();
  const staticPillar = getPillarBrowseContent(id);
  const [activeFilter, setActiveFilter] = useState('All');

  const { enterprises, products, services, isLoading } = usePillarSearch(
    staticPillar.title,
  );

  const pillar = useMemo(
    () =>
      mapPillarSearchToBrowseContent(
        staticPillar,
        enterprises,
        products,
        services,
      ),
    [staticPillar, enterprises, products, services],
  );

  useEffect(() => {
    setActiveFilter('All');
  }, [pillar.id]);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={PILLAR_GREEN} />
      <StatusBarFill lightColor={PILLAR_GREEN} darkColor={PILLAR_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketPillarHeader pillar={pillar} />
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={PILLAR_GREEN} size="large" />
          </View>
        ) : (
          <MarketPillarBody
            pillar={pillar}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PILLAR_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
