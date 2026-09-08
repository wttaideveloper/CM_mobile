import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketBusinessProfileBody } from '@/components/market/MarketBusinessProfileBody';
import { MarketBusinessProfileHeader } from '@/components/market/MarketBusinessProfileHeader';
import {
  BIZ_PROFILE_BG,
  BIZ_PROFILE_GREEN,
  BIZ_PROFILE_MUTED,
} from '@/components/market/marketBusinessProfileData';
import { useEnterprise } from '@/hooks/useEnterprises';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import {
  mapEnterpriseToBizProfile,
  STATIC_BIZ_PROFILE_VIEW,
} from '@/utils/marketBizProfile.mapper';
import { c } from '@/utils/newUiCompact';

export function MarketBusinessProfileScreen() {
  const scrollRef = useScrollToTopOnFocus();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const enterpriseId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const { enterprise, isLoading, isError } = useEnterprise(enterpriseId, {
    enabled: Boolean(enterpriseId),
  });

  const profile =
    enterprise != null
      ? mapEnterpriseToBizProfile(enterprise)
      : !enterpriseId || isError
        ? STATIC_BIZ_PROFILE_VIEW
        : null;

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={BIZ_PROFILE_GREEN} />
      <StatusBarFill
        lightColor={BIZ_PROFILE_GREEN}
        darkColor={BIZ_PROFILE_GREEN}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {isLoading && enterpriseId && profile == null ? (
          <View style={styles.loading}>
            <ActivityIndicator color={BIZ_PROFILE_GREEN} size="large" />
            <Text style={styles.loadingText}>Loading business…</Text>
          </View>
        ) : profile != null ? (
          <>
            <MarketBusinessProfileHeader profile={profile} />
            <MarketBusinessProfileBody
              profile={profile}
              enterpriseId={enterpriseId}
            />
          </>
        ) : null}
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
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(12, 10),
  },
  loadingText: {
    fontSize: c(14, 13),
    color: BIZ_PROFILE_MUTED,
  },
});
