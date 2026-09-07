import { EmptyState } from '@/components/EmptyState';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceCardSkeletonList } from '@/components/ui/Skeleton';
import { useEnterprises } from '@/hooks/useEnterprises';
import { useInfiniteServices } from '@/hooks/useServices';
import { SERVICE_FILTER_PAGE_SIZE } from '@/services/service.service';
import { PRIMARY, SEARCH_DEBOUNCE_MS, styles } from '@/screens/shop/services/ServicesScreen.styles';
import type { ServiceListItem, ServiceListQuery } from '@/types/service.types';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export type ServicesListPanelProps = {
  enterpriseId?: string;
  search: string;
  debouncedSearch: string;
  onDebouncedSearchChange: (value: string) => void;
  activeCategory: string;
  bottomInset: number;
  fromSearch?: boolean;
};

export function ServicesListPanel({
  enterpriseId,
  search,
  debouncedSearch,
  onDebouncedSearchChange,
  activeCategory,
  bottomInset,
  fromSearch,
}: ServicesListPanelProps) {
  const listRef = useRef<FlatList<ServiceListItem>>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDebouncedSearchChange(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, onDebouncedSearchChange]);

  const apiQuery = useMemo((): ServiceListQuery => {
    const hasSearch = debouncedSearch.length > 0;
    const hasCategory = activeCategory !== 'All';
    const hasEnterprise = Boolean(enterpriseId);
    const isFiltered = hasSearch || hasCategory || hasEnterprise;

    const query: ServiceListQuery = {
      page_size: isFiltered ? SERVICE_FILTER_PAGE_SIZE : undefined,
    };

    if (hasEnterprise && enterpriseId) {
      query.enterprise_id = enterpriseId;
    }

    if (hasSearch) {
      query.search = debouncedSearch;
    }

    if (hasCategory) {
      query.category = activeCategory;
    }

    return query;
  }, [activeCategory, debouncedSearch, enterpriseId]);

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
  } = useInfiniteServices(apiQuery);

  const services = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const totalCount = data?.pages[0]?.pagination.total ?? services.length;
  const isFiltering = isFetching && !isFetchingNextPage;

  const { data: enterprises = [] } = useEnterprises();

  const enterpriseNameById = useMemo(
    () =>
      Object.fromEntries(
        enterprises.map((enterprise) => [enterprise.id, enterprise.name]),
      ),
    [enterprises],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [apiQuery.search, apiQuery.category, apiQuery.enterprise_id]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <>
      <Text style={styles.resultCount}>{totalCount} services found</Text>
      <FlatList
        ref={listRef}
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            enterpriseNameById={enterpriseNameById}
            fromEnterpriseId={enterpriseId}
            fromSearch={fromSearch}
          />
        )}
        style={styles.listScroll}
        contentContainerStyle={[
          styles.listContent,
          services.length === 0 && styles.listContentEmpty,
          { paddingBottom: bottomInset + 24 },
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
          isFetchingNextPage || (isFiltering && services.length > 0) ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading || isFiltering ? (
            <ServiceCardSkeletonList />
          ) : isError ? (
            <EmptyState variant="error" entity="services" onAction={() => void refetch()} />
          ) : (
            <EmptyState entity="services" />
          )
        }
      />
    </>
  );
}
