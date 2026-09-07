import { EmptyState } from '@/components/EmptyState';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { EnterpriseRow } from '@/components/enterprises/EnterpriseRow';
import { HomeEnterpriseSkeletonList } from '@/components/ui/Skeleton';
import {
  ChevronLeftIcon,
  SearchIcon,
} from '@/components/dashboard/DashboardIcons';
import { ENTERPRISE_CATEGORY_FILTERS } from '@/constants/enterprises';
import { ENTERPRISE_FILTER_PAGE_SIZE } from '@/services/enterprise.service';
import { useInfiniteEnterprises } from '@/hooks/useEnterprises';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import type { EnterpriseListItem, EnterpriseListQuery } from '@/types/enterprise.types';
import { isFromSearchParam } from '@/utils/searchNavigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRIMARY, SEARCH_DEBOUNCE_MS, styles, TEXT_MUTED } from '@/screens/enterprise/EnterprisesScreen.styles';

export { EnterpriseRow } from '@/components/enterprises/EnterpriseRow';

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
              accessibilityRole="button"
              accessibilityLabel="Go back"
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
                accessibilityRole="button"
                accessibilityLabel={category}
                accessibilityState={{ selected: isActive }}
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
            <HomeEnterpriseSkeletonList count={6} />
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
