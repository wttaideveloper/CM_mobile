import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketPillarBody } from '@/components/market/MarketPillarBody';
import { MarketPillarHeader } from '@/components/market/MarketPillarHeader';
import {
  PILLAR_BG,
  PILLAR_GREEN,
  getPillarBrowseContent,
} from '@/components/market/marketPillarData';

export function MarketPillarScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const pillar = getPillarBrowseContent(id);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    setActiveFilter('All');
  }, [pillar.id]);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={PILLAR_GREEN} />
      <StatusBarFill lightColor={PILLAR_GREEN} darkColor={PILLAR_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketPillarHeader pillar={pillar} />
        <MarketPillarBody
          pillar={pillar}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
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
});
