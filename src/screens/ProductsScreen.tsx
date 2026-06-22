import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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
  SearchIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import { useEnterpriseProducts, useProducts } from '@/hooks/useProducts';
import type { ProductListItem } from '@/types/product.types';
import { formatProductPrice } from '@/utils/product.mapper';
import { isSmallDevice } from '@/utils/responsive';
const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SEARCH_BORDER = '#E0E7E1';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 20;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 0.8);

function ProductGridCard({ product }: { product: ProductListItem }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(main)/product/${product.id}`)}
      style={({ pressed }) => [
        styles.productCard,
        { width: CARD_WIDTH },
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        contentFit="cover"
      />
      <View style={styles.cardBody}>
        <Text style={styles.categoryLabel}>{product.category}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatProductPrice(product.price)}</Text>
          <View style={styles.ratingRow}>
            <StarIcon size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const statusBarFill = useStatusBarBackground();
  const { enterpriseId } = useLocalSearchParams<{ enterpriseId?: string }>();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const enterpriseProductsQuery = useEnterpriseProducts(enterpriseId ?? '', {
    enabled: Boolean(enterpriseId),
  });
  const allProductsQuery = useProducts({
    enabled: !enterpriseId,
  });

  const { data, isLoading, isError } = enterpriseId
    ? enterpriseProductsQuery
    : allProductsQuery;

  const products = data ?? [];

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean)),
    ).sort();

    return ['All', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, search]);

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

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
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.productsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.grid,
          filteredProducts.length === 0 && styles.gridEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={PRIMARY} size="large" />
          </View>
        ) : isError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Failed to load products.</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <ProductGridCard key={product.id} product={product} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: BODY_BG,
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
    marginBottom: isSmallDevice ? 12 :  16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  backBtn: {
    width: isSmallDevice ? 32 :  36,
    height: isSmallDevice ? 32 :  36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 18 :  24,
    lineHeight: 32,
    fontWeight: '700',
    color: 'black',
  },
  filterBtn: {
    width: isSmallDevice ? 40 :  44,
    height: isSmallDevice ? 40 :  44,
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
    marginBottom: isSmallDevice ? 12 :  16,
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
    gap: isSmallDevice ? 6 :    8,
    paddingBottom: isSmallDevice ? 12 :  16,
  },
  categoryChip: {
    paddingHorizontal: isSmallDevice ? 14 :  16,
    paddingVertical: isSmallDevice ? 4 :  6,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PAD,
    gap: isSmallDevice ? 8 :  CARD_GAP,
  },
  gridEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    width: '100%',
    paddingVertical: isSmallDevice ? 36 :  48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    marginBottom: isSmallDevice ? 3 :   4,
  },
  productImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F0F2F1',
  },
  cardBody: {
    paddingHorizontal: isSmallDevice ? 10 :  12,
    paddingTop: isSmallDevice ? 8 :  10,
    paddingBottom: isSmallDevice ? 10 :  12,
  },
  categoryLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 3 :  4,
  },
  productName: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 6 :  8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: PRIMARY,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 3 :    4,
  },
  ratingText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  pressed: {
    opacity: 0.85,
  },
});
