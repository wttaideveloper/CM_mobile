import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketBusinessProfileBody } from '@/components/market/MarketBusinessProfileBody';
import { MarketBusinessProfileHeader } from '@/components/market/MarketBusinessProfileHeader';
import {
  BIZ_PROFILE_BG,
  BIZ_PROFILE_GREEN,
} from '@/components/market/marketBusinessProfileData';

export function MarketBusinessProfileScreen() {
  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={BIZ_PROFILE_GREEN} />
      <StatusBarFill
        lightColor={BIZ_PROFILE_GREEN}
        darkColor={BIZ_PROFILE_GREEN}
      />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketBusinessProfileHeader />
        <MarketBusinessProfileBody />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BIZ_PROFILE_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
});
