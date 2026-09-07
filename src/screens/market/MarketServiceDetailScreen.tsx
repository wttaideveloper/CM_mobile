import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketServiceDetailBody } from '@/components/market/MarketServiceDetailBody';
import { MarketServiceDetailFooter } from '@/components/market/MarketServiceDetailFooter';
import { MarketServiceDetailHeader } from '@/components/market/MarketServiceDetailHeader';
import {
  SERVICE_DETAIL_BG,
  SERVICE_DETAIL_GREEN,
  getMarketServiceDetail,
} from '@/components/market/marketServiceDetailData';

export function MarketServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const service = getMarketServiceDetail(id);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={SERVICE_DETAIL_GREEN} />
      <StatusBarFill
        lightColor={SERVICE_DETAIL_GREEN}
        darkColor={SERVICE_DETAIL_GREEN}
      />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketServiceDetailHeader service={service} />
        <MarketServiceDetailBody service={service} />
      </ScrollView>
      <MarketServiceDetailFooter service={service} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SERVICE_DETAIL_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
