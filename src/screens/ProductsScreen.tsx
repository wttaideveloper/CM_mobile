import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronLeftIcon,
  FunnelIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import { PRODUCT_CATEGORIES } from '@/constants/products';
import { useInfiniteProducts } from '@/hooks/useProducts';
import { PRODUCT_FILTER_PAGE_SIZE } from '@/services/product.service';
import type { ProductListItem, ProductListQuery } from '@/types/product.types';
import { formatProductPrice } from '@/utils/product.mapper';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import { detailFromEnterpriseHref, detailHref, exploreTabProductHref, isFromSearchParam } from '@/utils/searchNavigation';
import { shadowMd, shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const HEADER_BG = '#FFFFFF';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SEARCH_BORDER = '#E0E7E1';
const SEARCH_DEBOUNCE_MS = 400;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = isSmallDevice ? 16 : 20;
const CARD_GAP = isSmallDevice ? 10 : 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 0.82);

export function ProductGridCard({
  product,
  fromSearch,
  fromEnterpriseId,
}: {
  product: ProductListItem;
  fromSearch?: boolean;
  fromEnterpriseId?: string;
}) {
  const router = useRouter();

  const openDetail = () => {
    if (fromEnterpriseId) {
      router.push(
        fromSearch
          ? detailFromEnterpriseHref('/(main)/product', product.id, fromEnterpriseId, true)
          : exploreTabProductHref(product.id),
      );
      return;
    }

    router.push(detailHref('/(main)/product', product.id, fromSearch));
  };

  return (
    <Pressable
      onPress={openDetail}
      style={({ pressed }) => [
        styles.productCard,
        { width: CARD_WIDTH },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          contentFit="cover"
        />
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={({ pressed }) => [styles.heartBtn, pressed && styles.pressed]}
          hitSlop={6}
        >
          <HeartIcon size={16} color="#9AA8A2" />
        </Pressable>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.categoryLabel}>{product.category}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.ratingRow}>
          <StarIcon size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          {product.stockCount > 0 ? (
            <>
              <Text style={styles.ratingDot}>·</Text>
              <Text style={styles.soldText}>{product.stockCount} sold</Text>
            </>
          ) : null}
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.productPrice}>{formatProductPrice(product.price)}</Text>
          <Pressable
            onPress={openDetail}
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            hitSlop={6}
          >
            <PlusIcon size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

type ProductsListPanelProps = {
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
            <View style={styles.emptyState}>
              <ActivityIndicator color={PRIMARY} size="large" />
            </View>
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

export function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routeSearch = useRouteSearchParam();
  const { enterpriseId: rawEnterpriseId, fromSearch } = useLocalSearchParams<{
    enterpriseId?: string | string[];
    fromSearch?: string;
  }>();
  const openedFromSearch = isFromSearchParam(fromSearch);
  const enterpriseId = Array.isArray(rawEnterpriseId)
    ? rawEnterpriseId[0]
    : rawEnterpriseId;

  const { search, setSearch, debouncedSearch, setDebouncedSearch } =
    useSyncedSearchState(routeSearch);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color={PRIMARY} />
            </Pressable>
            <Text style={styles.title}>Products</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <FunnelIcon size={16} color={PRIMARY} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={() => setDebouncedSearch(search.trim())}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {PRODUCT_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setActiveCategory((current) => (current === category ? 'All' : category))
                }
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              >
                <Text
                  style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ProductsListPanel
        enterpriseId={enterpriseId}
        search={search}
        debouncedSearch={debouncedSearch}
        onDebouncedSearchChange={setDebouncedSearch}
        activeCategory={activeCategory}
        bottomInset={insets.bottom}
        fromSearch={openedFromSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: HEADER_BG,
    paddingBottom: isSmallDevice ? 4 : 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDEA',
  },
  productsScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 18 : 24,
    lineHeight: 32,
    fontWeight: '700',
    color: 'black',
  },
  filterBtn: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: 15,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F3',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: 16,
    height: isSmallDevice ? 40 : 48,
    marginHorizontal: H_PAD,
    marginBottom: isSmallDevice ? 12 : 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  categoriesScroll: {
    paddingHorizontal: H_PAD,
    gap: isSmallDevice ? 6 : 8,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  categoryChip: {
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 4 : 6,
    borderRadius: 20,
    backgroundColor: MINT,
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
  },
  categoryChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultCount: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 10 : 12,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  grid: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
  },
  gridRow: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  gridEmpty: {
    flexGrow: 1,
  },
  footerLoader: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    width: '100%',
    paddingVertical: isSmallDevice ? 24 : 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    ...shadowSm,
  },
  imageWrap: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F0F2F1',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSm,
  },
  cardBody: {
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingTop: isSmallDevice ? 8 : 10,
    paddingBottom: isSmallDevice ? 10 : 12,
  },
  categoryLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 3 : 4,
  },
  productName: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: isSmallDevice ? 8 : 10,
    marginTop: 4,
  },
  ratingText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  ratingDot: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  soldText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 20,
    fontWeight: '900',
    color: PRIMARY,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowMd,
  },
  pressed: {
    opacity: 0.85,
  },
});
