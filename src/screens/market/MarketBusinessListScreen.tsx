import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketBusinessAvatar } from '@/components/market/MarketBusinessAvatar';
import {
  MarketStarIcon,
  MarketVerifiedIcon,
} from '@/components/market/MarketIcons';
import { MarketBusinessListHeader } from '@/components/market/MarketBusinessListHeader';
import {
  BIZ_LIST_BG,
  BIZ_LIST_BORDER,
  BIZ_LIST_GREEN,
  BIZ_LIST_MUTED,
  BIZ_LIST_SOFT,
  BIZ_LIST_SORTS,
  BIZ_LIST_TEAL,
  FEATURED_BUSINESSES_ALL,
} from '@/components/market/marketBusinessListData';
import type { MarketBusiness } from '@/components/market/marketDashboardData';
import { useInfiniteEnterprises } from '@/hooks/useEnterprises';
import {
  mapEnterprisesToMarketBusinessList,
  sortMarketBusinesses,
} from '@/utils/marketBusiness.mapper';
import { c, NU } from '@/utils/newUiCompact';

function SortChips({
  sort,
  onSortChange,
}: {
  sort: string;
  onSortChange: (sort: string) => void;
}) {
  return (
    <View style={styles.sortRow}>
      <Text style={styles.sortLabel}>Sort</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortChips}
      >
        {BIZ_LIST_SORTS.map((item) => {
          const active = item === sort;
          return (
            <Pressable
              key={item}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSortChange(item)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function BusinessCard({ biz }: { biz: MarketBusiness }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/(main)/market/business-profile',
          params: { id: biz.id },
        })
      }
      accessibilityRole="button"
    >
      <MarketBusinessAvatar
        imageUrl={biz.imageUrl}
        initials={biz.initials}
        avatarBg={biz.avatarBg}
        avatarColor={biz.avatarColor}
        size={c(56, 48)}
        borderRadius={NU.cardRadiusMd}
        initialsFontSize={c(19, 16)}
      />
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{biz.name}</Text>
          {biz.verified ? <MarketVerifiedIcon /> : null}
        </View>
        <Text style={styles.subtitle}>{biz.subtitle}</Text>
        <View style={styles.meta}>
          <MarketStarIcon />
          <Text style={styles.rating}>{biz.rating}</Text>
          <Text style={styles.metaDot}>· {biz.reviews}</Text>
          <Text style={styles.metaDot}>· {biz.meta}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function MarketBusinessListScreen() {
  const [sort, setSort] = useState('Closest');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteEnterprises({ status: 'active' });

  const enterprises = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const businesses = useMemo(() => {
    if (isLoading && enterprises.length === 0) return [];
    const mapped =
      enterprises.length > 0
        ? mapEnterprisesToMarketBusinessList(
            enterprises,
            FEATURED_BUSINESSES_ALL,
          )
        : FEATURED_BUSINESSES_ALL;
    return sortMarketBusinesses(mapped, sort);
  }, [enterprises, isLoading, sort]);

  const count =
    data?.pages[0]?.pagination.total ??
    (enterprises.length > 0 ? enterprises.length : businesses.length);

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={BIZ_LIST_GREEN} />
      <StatusBarFill lightColor={BIZ_LIST_GREEN} darkColor={BIZ_LIST_GREEN} />
      <FlatList
        style={styles.list}
        data={businesses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            <MarketBusinessListHeader count={count} />
            <View style={styles.bodyPad}>
              <SortChips sort={sort} onSortChange={setSort} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.rowPad}>
            <BusinessCard biz={item} />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={BIZ_LIST_GREEN} />
            </View>
          ) : (
            <Text style={styles.empty}>No businesses available yet.</Text>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={BIZ_LIST_GREEN} />
            </View>
          ) : (
            <View style={styles.footerSpacer} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BIZ_LIST_BG,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
    flexGrow: 1,
  },
  bodyPad: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
  },
  rowPad: {
    paddingHorizontal: NU.hPad,
    paddingBottom: NU.cardGap,
  },
  sortRow: {
    gap: c(10, 8),
    marginBottom: NU.cardPad,
  },
  sortLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: BIZ_LIST_MUTED,
  },
  sortChips: {
    gap: c(8, 6),
  },
  chip: {
    paddingVertical: c(8, 6),
    paddingHorizontal: NU.rowGap,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BIZ_LIST_BORDER,
  },
  chipActive: {
    backgroundColor: BIZ_LIST_TEAL,
    borderColor: BIZ_LIST_TEAL,
  },
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: BIZ_LIST_MUTED,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  loading: {
    paddingVertical: c(28, 24),
    alignItems: 'center',
  },
  empty: {
    fontSize: c(13, 12),
    color: BIZ_LIST_MUTED,
    paddingHorizontal: NU.hPad,
    paddingVertical: c(12, 10),
  },
  footerLoading: {
    paddingVertical: c(16, 12),
    alignItems: 'center',
  },
  footerSpacer: {
    height: NU.bodyPadBottom,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BIZ_LIST_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: c(13, 11),
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: c(4, 3),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(7, 5),
  },
  name: {
    flexShrink: 1,
    fontSize: c(15.5, 14),
    fontWeight: '700',
    color: BIZ_LIST_TEAL,
  },
  subtitle: {
    fontSize: c(12.5, 11.5),
    color: BIZ_LIST_MUTED,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(4, 3),
    marginTop: c(2, 1),
  },
  rating: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: BIZ_LIST_TEAL,
  },
  metaDot: {
    fontSize: c(12.5, 11.5),
    color: BIZ_LIST_SOFT,
  },
});
