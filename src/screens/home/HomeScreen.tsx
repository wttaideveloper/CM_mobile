import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeDashboardHeader } from '@/components/home/HomeDashboardHeader';
import { HomeDashboardInsight } from '@/components/home/HomeDashboardInsight';
import { HomeDashboardPillars } from '@/components/home/HomeDashboardPillars';
import { HomeDashboardStats } from '@/components/home/HomeDashboardStats';
import { HomeDashboardStreak } from '@/components/home/HomeDashboardStreak';
import { HOME_DASH_BG } from '@/components/home/homeDashboardData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { useAuthStore } from '@/stores/auth.store';
import { c, NU } from '@/utils/newUiCompact';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();
  const fetchAndLogMe = useAuthStore((state) => state.fetchAndLogMe);
  const user = useAuthStore((state) => state.user);
  const displayName = user?.fullName?.trim() || 'Guest';

  useFocusEffect(
    useCallback(() => {
      void fetchAndLogMe();
    }, [fetchAndLogMe]),
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + c(24, 20) }}
      >
        <HomeDashboardHeader displayName={displayName} />

        <View style={styles.body}>
          <HomeDashboardStats />
          <HomeDashboardPillars />
          <HomeDashboardStreak />
          <HomeDashboardInsight />
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
    gap: c(26, 20),
  },
});
