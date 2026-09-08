import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HwiDashboardHeader } from '@/components/hwi/HwiDashboardHeader';
import { HwiPillarBreakdown } from '@/components/hwi/HwiPillarBreakdown';
import { HwiRecommendations } from '@/components/hwi/HwiRecommendations';
import { HwiTrendCard } from '@/components/hwi/HwiTrendCard';
import { HOME_DASH_BG } from '@/components/hwi/hwiDashboardData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { c, NU } from '@/utils/newUiCompact';

export function HwiScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + c(24, 20) }}
      >
        <HwiDashboardHeader />
        <View style={styles.body}>
          <HwiTrendCard />
          <HwiPillarBreakdown />
          <HwiRecommendations />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: HOME_DASH_BG,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(24, 20),
  },
});
