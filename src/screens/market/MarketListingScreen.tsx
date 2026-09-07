import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketListingBody } from '@/components/market/MarketListingBody';
import { MarketListingFooter } from '@/components/market/MarketListingFooter';
import { MarketListingHeader } from '@/components/market/MarketListingHeader';
import { LISTING_BG, LISTING_GREEN } from '@/components/market/marketListingData';

export function MarketListingScreen() {
  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={LISTING_GREEN} />
      <StatusBarFill lightColor={LISTING_GREEN} darkColor={LISTING_GREEN} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketListingHeader />
        <MarketListingBody />
      </ScrollView>
      <MarketListingFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LISTING_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
