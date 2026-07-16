import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import {
  ChevronLeftIcon,
  CircleCheckIcon,
  MapPinIcon,
  SearchIcon,
} from '@/components/dashboard/DashboardIcons';
import { ENTERPRISE_CATEGORY_FILTERS } from '@/constants/enterprises';
import { ENTERPRISE_FILTER_PAGE_SIZE } from '@/services/enterprise.service';
import { useInfiniteEnterprises } from '@/hooks/useEnterprises';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import type { EnterpriseListItem, EnterpriseListQuery } from '@/types/enterprise.types';
import { formatMembersCount, formatRevenue } from '@/utils/enterprise.mapper';
import { detailHref, isFromSearchParam } from '@/utils/searchNavigation';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';
const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const H_PAD = isSmallDevice ? 16 : 20;
const SEARCH_DEBOUNCE_MS = 400;

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  NA: { bg: '#F3F4F6', text: '#6B7280' },
  Active: { bg: '#EAF4EC', text: PRIMARY },
  Pending: { bg: '#FEF3C7', text: '#B45309' },
  Inactive: { bg: '#F3F4F6', text: '#6B7280' },
};

export function EnterpriseRow({
  enterprise,
  fromSearch,
}: {
  enterprise: EnterpriseListItem;
  fromSearch?: boolean;
}) {
  const router = useRouter();
  const statusStyle = STATUS_STYLES[enterprise.status] ?? STATUS_STYLES.NA;
  const initial = enterprise.name === 'NA' ? '?' : enterprise.name.charAt(0).toUpperCase();
  const enterprisePath = fromSearch ? '/(main)/enterprise' : '/(main)/(tabs)/explore';
  const hasLogo = Boolean(enterprise.logoUrl);

  return (
    <Pressable
      onPress={() => router.push(detailHref(enterprisePath, enterprise.id, fromSearch))}
      style={({ pressed }) => [styles.rowCard, pressed && styles.rowPressed]}
    >
      <View style={styles.rowTop}>
        <View style={styles.avatar}>
          {hasLogo ? (
            <Image
              source={{ uri: enterprise.logoUrl! }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>

        <View style={styles.rowMain}>
          <View style={styles.nameRow}>
            <Text style={styles.enterpriseName} numberOfLines={1}>
              {enterprise.name}
            </Text>
            {enterprise.isVerified && (
              <CircleCheckIcon size={14} color="#3B82F6" />
            )}
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{enterprise.category}</Text>
          </View>

          <View style={styles.locationRow}>
            <MapPinIcon size={13} color={TEXT_MUTED} />
            <Text style={styles.locationText} numberOfLines={1}>
              {enterprise.location}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {enterprise.status}
          </Text>
        </View>
      </View>

      <View style={styles.rowMeta}>
        <Text style={styles.metaItem}>
          {formatMembersCount(enterprise.members)} members
        </Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaItem}>{formatRevenue(enterprise.revenue)}</Text>
        {enterprise.joined !== 'NA' ? (
          <>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaItem}>Joined: {enterprise.joined}</Text>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

export function EnterprisesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { fromSearch } = useLocalSearchParams<{ fromSearch?: string }>();
  const openedFromSearch = isFromSearchParam(fromSearch);
  const listRef = useRef<FlatList<EnterpriseListItem>>(null);
  const routeSearch = useRouteSearchParam();
  const { search, setSearch, debouncedSearch, setDebouncedSearch } =
    useSyncedSearchState(routeSearch);
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

    if (hasSearch) {
      query.search = debouncedSearch;
    }

    if (hasCategory && activeCategory) {
      query.category = activeCategory;
    }

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
console.log('Enterprises', data);
  const enterprises = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const totalCount = data?.pages[0]?.pagination.total ?? enterprises.length;
  const isFiltering = isFetching && !isFetchingNextPage;

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [apiQuery.search, apiQuery.category]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const handleCategoryPress = (category: string) => {
    setActiveCategory((current) => (current === category ? null : category));
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <View style={styles.screen}>
      {openedFromSearch ? (
        <>
          <AppStatusBar />
          <StatusBarFill />
        </>
      ) : null}
      <View style={styles.headerSection}>
        <View style={[styles.header, openedFromSearch && styles.headerWithBack]}>
          {openedFromSearch ? (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.rowPressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color={PRIMARY} />
            </Pressable>
          ) : null}
          <Text style={[styles.title, openedFromSearch && styles.titleInHeader]}>
            Enterprises
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={TEXT_MUTED} />
          <TextInput
            value={search}
            onChangeText={handleSearchChange}
            placeholder="Search by name, category, or location..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={() => setDebouncedSearch(search.trim())}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {ENTERPRISE_CATEGORY_FILTERS.map((category) => {
            const isActive = activeCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => handleCategoryPress(category)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.resultCount}>
          {totalCount} enterprises found
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={enterprises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EnterpriseRow enterprise={item} fromSearch={openedFromSearch} />
        )}
        style={styles.listScroll}
        contentContainerStyle={[
          styles.listContent,
          enterprises.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => {
          void refetch();
        }}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListFooterComponent={
          isFetchingNextPage || (isFiltering && enterprises.length > 0) ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading || isFiltering ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : isError ? (
            <EmptyState variant="error" entity="enterprises" onAction={() => void refetch()} />
          ) : (
            <EmptyState entity="enterprises" />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  headerSection: {
    backgroundColor: BODY_BG,
    paddingBottom: 4,
  },
  header: {
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 34,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 4 : 6,
    marginHorizontal: H_PAD,
    marginTop: 10,
  },
  titleInHeader: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    color: TEXT_MUTED,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginBottom: isSmallDevice ? 12 : 14,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    height: isSmallDevice ? 44 : 48,
    borderRadius: isSmallDevice ? 12 : 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    gap: isSmallDevice ? 8 : 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  filtersScroll: {
    paddingHorizontal: H_PAD,
    gap: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 16 : 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultCount: {
    paddingHorizontal: H_PAD,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 :  8,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 2 :  4,
  },
  listSeparator: {
    height: isSmallDevice ? 10 :  12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    paddingVertical: isSmallDevice ? 36 : 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    ...shadowSm,
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: isSmallDevice ? 40 :  44,
    height: isSmallDevice ? 40 :  44,
    borderRadius: 22,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  enterpriseName: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MINT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: isSmallDevice ? 4 :  6,
  },
  categoryText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    color: PRIMARY,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    flex: 1,
    fontSize: isSmallDevice ? 11 : 12,
    color: TEXT_MUTED,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: isSmallDevice ? 3 :  4,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '700',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 4 : 6,
    paddingLeft: isSmallDevice ? 52 : 56,
  },
  metaItem: {
    fontSize: isSmallDevice ? 11 : 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#D1D5DB',
  },
});
