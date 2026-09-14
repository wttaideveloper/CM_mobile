import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import {
  ENTERPRISES_TAB_BG,
  ENTERPRISES_TAB_BORDER,
  ENTERPRISES_TAB_GREEN,
  ENTERPRISES_TAB_MUTED,
  ENTERPRISES_TAB_TEAL,
  ENTERPRISES_TAB_TRACK,
  EnterprisesTabHeader,
} from '@/components/enterprises/EnterprisesTabHeader';
import {
  MarketStarIcon,
  MarketVerifiedIcon,
} from '@/components/market/MarketIcons';
import { ENTERPRISE_CATEGORY_FILTERS } from '@/constants/enterprises';
import { ENTERPRISE_FILTER_PAGE_SIZE } from '@/services/enterprise.service';
import { useInfiniteEnterprises } from '@/hooks/useEnterprises';
import type { EnterpriseListItem, EnterpriseListQuery } from '@/types/enterprise.types';
import { formatMembersCount } from '@/utils/enterprise.mapper';
import { c, NU } from '@/utils/newUiCompact';

const SEARCH_DEBOUNCE_MS = 350;

function EnterpriseCard({ item }: { item: EnterpriseListItem }) {
  const router = useRouter();
  const initial = item.name === 'NA' ? '?' : item.name.charAt(0).toUpperCase();
  const hasLogo = Boolean(item.logoUrl);
  const rating =
    item.rating === 'NA' || item.rating === '0' ? null : item.rating;

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/(main)/market/business-profile',
          params: { id: item.id },
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.category}`}
    >
      <View style={styles.avatar}>
        {hasLogo ? (
          <Image
            source={{ uri: item.logoUrl! }}
            style={styles.avatarImage}
            contentFit="cover"
            transition={0}
          />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </View>

      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isVerified ? <MarketVerifiedIcon /> : null}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.category}
          {item.location !== 'NA' ? ` · ${item.location}` : ''}
        </Text>
        <View style={styles.meta}>
          {rating ? (
            <>
              <MarketStarIcon />
              <Text style={styles.rating}>{rating}</Text>
              <Text style={styles.metaDot}>·</Text>
            </>
          ) : null}
          <Text style={styles.metaText}>
            {formatMembersCount(item.members)} members
          </Text>
          {item.status !== 'NA' ? (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{item.status}</Text>
            </>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function EnterprisesTabScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const apiQuery = useMemo((): EnterpriseListQuery => {
    const hasSearch = debouncedSearch.length > 0;
    const hasCategory = Boolean(activeCategory);
    const isFiltered = hasSearch || hasCategory;
    const query: EnterpriseListQuery = {
      page_size: isFiltered ? ENTERPRISE_FILTER_PAGE_SIZE : undefined,
    };
    if (hasSearch) query.search = debouncedSearch;
    if (hasCategory && activeCategory) query.category = activeCategory;
    return query;
  }, [activeCategory, debouncedSearch]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteEnterprises(apiQuery);

  const enterprises = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.pagination.total ?? enterprises.length;
  const isFiltering = isFetching && !isFetchingNextPage;

  return (
    <View style={styles.screen}>
      <EnterprisesTabHeader
        count={totalCount}
        search={search}
        onSearchChange={setSearch}
      />
      <View style={styles.bodyPad}>
        <Text style={styles.sectionLabel}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {ENTERPRISE_CATEGORY_FILTERS.map((category) => {
            const active = category === activeCategory;
            return (
              <Pressable
                key={category}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() =>
                  setActiveCategory((current) =>
                    current === category ? null : category,
                  )
                }
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        style={styles.list}
        data={enterprises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
          enterprises.length === 0 && styles.contentEmpty,
        ]}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.35}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => {
          void refetch();
        }}
        renderItem={({ item }) => (
          <View style={styles.rowPad}>
            <EnterpriseCard item={item} />
          </View>
        )}
        ListEmptyComponent={
          isLoading || isFiltering ? (
            <View style={styles.loading}>
              <ActivityIndicator color={ENTERPRISES_TAB_GREEN} />
            </View>
          ) : isError ? (
            <EmptyState
              variant="error"
              entity="enterprises"
              onAction={() => void refetch()}
            />
          ) : (
            <EmptyState entity="enterprises" />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={ENTERPRISES_TAB_GREEN} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ENTERPRISES_TAB_BG,
  },
  list: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: c(4, 2),
  },
  contentEmpty: {
    flexGrow: 1,
  },
  bodyPad: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.cardPad,
    gap: c(10, 8),
    backgroundColor: ENTERPRISES_TAB_BG,
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: ENTERPRISES_TAB_MUTED,
  },
  chips: {
    gap: c(8, 6),
    paddingRight: c(4, 2),
  },
  chip: {
    paddingVertical: c(8, 6),
    paddingHorizontal: NU.rowGap,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ENTERPRISES_TAB_BORDER,
  },
  chipActive: {
    backgroundColor: ENTERPRISES_TAB_TEAL,
    borderColor: ENTERPRISES_TAB_TEAL,
  },
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: ENTERPRISES_TAB_MUTED,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  rowPad: {
    paddingHorizontal: NU.hPad,
    paddingBottom: NU.cardGap,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ENTERPRISES_TAB_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(14, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  avatar: {
    width: c(56, 48),
    height: c(56, 48),
    borderRadius: NU.cardRadiusMd,
    backgroundColor: ENTERPRISES_TAB_TRACK,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: c(19, 16),
    fontWeight: '800',
    color: ENTERPRISES_TAB_TEAL,
  },
  copy: {
    flex: 1,
    gap: c(3, 2),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 4),
  },
  name: {
    flexShrink: 1,
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: ENTERPRISES_TAB_TEAL,
  },
  subtitle: {
    fontSize: c(12.5, 11.5),
    color: ENTERPRISES_TAB_MUTED,
  },
  meta: {
    marginTop: c(2, 1),
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: c(4, 3),
  },
  rating: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: ENTERPRISES_TAB_TEAL,
  },
  metaDot: {
    fontSize: c(12.5, 11.5),
    color: ENTERPRISES_TAB_MUTED,
  },
  metaText: {
    fontSize: c(12.5, 11.5),
    color: ENTERPRISES_TAB_MUTED,
  },
  loading: {
    paddingVertical: c(40, 32),
    alignItems: 'center',
  },
  footerLoading: {
    paddingVertical: c(16, 12),
    alignItems: 'center',
  },
});
