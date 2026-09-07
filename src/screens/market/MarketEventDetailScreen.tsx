import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketEventDetailBody } from '@/components/market/MarketEventDetailBody';
import { MarketEventDetailFooter } from '@/components/market/MarketEventDetailFooter';
import { MarketEventDetailHeader } from '@/components/market/MarketEventDetailHeader';
import {
  EVENT_DETAIL_BG,
  EVENT_DETAIL_GREEN,
} from '@/components/market/marketEventDetailData';

export function MarketEventDetailScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={EVENT_DETAIL_GREEN} />
      <StatusBarFill
        lightColor={EVENT_DETAIL_GREEN}
        darkColor={EVENT_DETAIL_GREEN}
      />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketEventDetailHeader />
        <MarketEventDetailBody />
      </ScrollView>
      <MarketEventDetailFooter
        onReserve={() => router.push('/(main)/market/checkout')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: EVENT_DETAIL_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
