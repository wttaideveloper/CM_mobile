import { EmptyState } from '@/components/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { ProductGridCard } from '@/components/products/ProductGridCard';
import { useInfiniteProducts } from '@/hooks/useProducts';
import { PRODUCT_FILTER_PAGE_SIZE } from '@/services/product.service';
import { PRIMARY, SEARCH_DEBOUNCE_MS, styles } from '@/screens/shop/products/ProductsScreen.styles';
import type { ProductListItem, ProductListQuery } from '@/types/product.types';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export type ProductsListPanelProps = {
  enterpriseId?: string;
  search: string;
  debouncedSearch: string;
  onDebouncedSearchChange: (value: string) => void;
  activeCategory: string;
  bottomInset: number;
  fromSearch?: boolean;
};

export function ProductsListPanel({
  enterpriseId,
  search,
  debouncedSearch,
  onDebouncedSearchChange,
  activeCategory,
  bottomInset,
  fromSearch,
}: ProductsListPanelProps) {
  const listRef = useRef<FlatList<ProductListItem>>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDebouncedSearchChange(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, onDebouncedSearchChange]);

  const apiQuery = useMemo((): ProductListQuery => {
    const hasSearch = debouncedSearch.length > 0;
    const hasCategory = activeCategory !== 'All';
    const hasEnterprise = Boolean(enterpriseId);
    const isFiltered = hasSearch || hasCategory || hasEnterprise;

    const query: ProductListQuery = {
      page_size: isFiltered ? PRODUCT_FILTER_PAGE_SIZE : undefined,
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
  } = useInfiniteProducts(apiQuery);
console.log("products",data);
  const products = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const totalCount = data?.pages[0]?.pagination.total ?? products.length;
  const isFiltering = isFetching && !isFetchingNextPage;

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
      <Text style={styles.resultCount}>{totalCount} products found</Text>
      <FlatList
        ref={listRef}
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <ProductGridCard
            product={item}
            fromEnterpriseId={enterpriseId}
            fromSearch={fromSearch}
          />
        )}
        style={styles.productsScroll}
        contentContainerStyle={[
          styles.grid,
          products.length === 0 && styles.gridEmpty,
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
        ListFooterComponent={
          isFetchingNextPage || (isFiltering && products.length > 0) ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading || isFiltering ? (
            <ProductGridSkeleton />
          ) : isError ? (
            <EmptyState variant="error" entity="products" onAction={() => void refetch()} />
          ) : (
            <EmptyState entity="products" />
          )
        }
      />
    </>
  );
}
