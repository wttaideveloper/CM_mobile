import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronLeftIcon,
  HeartIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import { getProductById, type Product, type ProductSpec } from '@/constants/products';
import { useProduct } from '@/hooks/useProducts';
import type { ProductListItem } from '@/types/product.types';
import { formatProductPrice, formatProductStockLabel } from '@/utils/product.mapper';
import { shadowLg } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';
const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const STOCK_GREEN = '#059669';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const H_PAD = 20;
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.38);

type ProductViewModel = {
  name: string;
  category: string;
  brand: string;
  price: string;
  rating: string;
  reviewCount: number;
  description: string;
  specs: ProductSpec[];
  stockLabel: string;
  images: string[];
  placeholder: boolean;
};

function mapApiProductToViewModel(product: ProductListItem): ProductViewModel {
  return {
    name: product.name,
    category: product.category,
    brand: product.enterpriseName,
    price: formatProductPrice(product.price),
    rating: product.rating,
    reviewCount: 0,
    description: product.description,
    specs: [
      { value: product.length, label: 'Length' },
      { value: product.width, label: 'Width' },
      { value: product.thick, label: 'Thick' },
    ],
    stockLabel: formatProductStockLabel(product.stockCount),
    images: [product.image],
    placeholder: false,
  };
}

function mapStaticProductToViewModel(product: Product): ProductViewModel {
  return {
    name: product.name,
    category: product.category,
    brand: product.brand,
    price: product.price,
    rating: product.rating,
    reviewCount: product.reviewCount,
    description: product.description,
    specs: product.specs,
    stockLabel: `In Stock · ${product.stock} units`,
    images:
      product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [],
    placeholder: Boolean(product.placeholder),
  };
}

function ImagePagination({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View style={styles.pagination}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationBar,
            index === activeIndex ? styles.paginationBarActive : styles.paginationBarInactive,
          ]}
        />
      ))}
    </View>
  );
}

export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const productId = Array.isArray(id) ? id[0] : id ?? '';
  const staticProduct = productId ? getProductById(productId) : undefined;
  const { product: apiProduct, isLoading, isError } = useProduct(productId, {
    enabled: Boolean(productId) && !staticProduct,
  });

  const product = useMemo(() => {
    if (staticProduct) {
      return mapStaticProductToViewModel(staticProduct);
    }

    if (apiProduct) {
      return mapApiProductToViewModel(apiProduct);
    }

    return undefined;
  }, [apiProduct, staticProduct]);

  if (!staticProduct && isLoading) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />
        <View style={styles.loadingState}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      </View>
    );
  }

  if (!product || (!staticProduct && isError)) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />
        <View style={styles.loadingState}>
          <Text style={styles.errorText}>Product not found</Text>
          <Pressable onPress={() => router.back()} style={styles.fallbackBtn}>
            <Text style={styles.fallbackBtnText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const carouselImages = product.images;

  const onCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.body}>
        <View style={[styles.hero, { height: HERO_HEIGHT }]}>
          {product.placeholder && carouselImages.length === 0 ? (
            <View style={[styles.heroImage, styles.placeholderHero]}>
              <Text style={styles.placeholderHeroText}>{product.name}</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onCarouselScroll}
              scrollEventThrottle={16}
            >
              {carouselImages.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={{ uri }}
                  style={[styles.heroImage, { width: SCREEN_WIDTH }]}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          )}

          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color={PRIMARY} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <HeartIcon size={20} color={PRIMARY} />
            </Pressable>
          </View>

          {carouselImages.length > 1 && (
            <ImagePagination count={carouselImages.length} activeIndex={activeImageIndex} />
          )}
        </View>

        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <View style={styles.content}>
            <View style={styles.headerBlock}>
              <View style={styles.headerLeft}>
                <Text style={styles.metaText} numberOfLines={1}>
                  {product.category} · {product.brand}
                </Text>
                <Text style={styles.productTitle}>{product.name}</Text>
              </View>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>

            <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} size={14} color="#F59E0B" />
              ))}
            </View>
            <Text style={styles.reviewsText}>
              {product.rating} ({product.reviewCount} reviews)
            </Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.specsRow}>
            {product.specs.map((spec) => (
              <View key={spec.label} style={styles.specCard}>
                <Text style={styles.specValue}>{spec.value}</Text>
                <Text style={styles.specLabel}>{spec.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.stockRow}>
            <View style={styles.stockDot} />
            <Text style={styles.stockText}>{product.stockLabel}</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 12, paddingTop: 12 },
        ]}
      >
        <Pressable
          style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
        >
          <Text style={styles.outlineBtnText}>Add to Cart</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
        >
          <Text style={styles.primaryBtnText}>Buy Now</Text>
        </Pressable>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  statusBarFill: {
    backgroundColor: '#1A1A1A',
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    backgroundColor: '#1A1A1A',
  },
  heroImage: {
    height: isSmallDevice ? 160 :  HERO_HEIGHT,
    backgroundColor: '#F0F2F1',
  },
  placeholderHero: {
    width: SCREEN_WIDTH,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isSmallDevice ? 16 :  24,
  },
  placeholderHeroText: {
    fontSize: isSmallDevice ? 20 :  22,
    lineHeight: 28,
    fontWeight: '700',
    color: PRIMARY,
    textAlign: 'center',
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 12 :  16,
    paddingTop: isSmallDevice ? 6 :  8,
    paddingBottom: isSmallDevice ? 6 :  8,
  },
  heroBtn: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowLg,
  },
  pagination: {
    position: 'absolute',
    bottom: isSmallDevice ? 12 :  16,
    left: H_PAD,
    right: H_PAD,
    flexDirection: 'row',
    gap: isSmallDevice ? 4 :  6,
  },
  paginationBar: {
    flex: 1,
    height: isSmallDevice ? 2 :  3,
    borderRadius: 2,
  },
  paginationBarActive: {
    backgroundColor: PRIMARY,
  },
  paginationBarInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 :  20,
  },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: isSmallDevice ? 8 :  10,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  metaText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 3 :  4,
  },
  productTitle: {
    fontSize: isSmallDevice ? 19 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  productPrice: {
    fontSize: isSmallDevice ? 19 : 22,
    lineHeight: 28,
    fontWeight: '700',
    color: PRIMARY,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 12 :  16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewsText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  description: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 16 :  20,
  },
  specsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 12 :  16,
  },
  specCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F5F7F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 12 :  14,
    paddingHorizontal: isSmallDevice ? 6 :  8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specValue: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: 22,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 3 :  4,
    textAlign: 'center',
  },
  specLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockDot: {
    width: isSmallDevice ? 6 :  8,
    height: isSmallDevice ? 6 :  8,
    borderRadius: 4,
    backgroundColor: STOCK_GREEN,
  },
  stockText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: STOCK_GREEN,
  },
  footer: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 :  12,
    paddingHorizontal: H_PAD,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  outlineBtn: {
    flex: 1,
    height: isSmallDevice ? 40 : 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: isSmallDevice ? 13 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: PRIMARY,
  },
  primaryBtn: {
    flex: 1,
    height: isSmallDevice ? 40 : 48,
    borderRadius: isSmallDevice ? 14 : 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  fallbackBtn: {
    marginTop: isSmallDevice ? 12 :  16,
    paddingHorizontal: isSmallDevice ? 16 :  20,
    paddingVertical: isSmallDevice ? 10 :  12,
    borderRadius: isSmallDevice ? 10 :  12,
    backgroundColor: PRIMARY,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: TEXT_MUTED,
  },
});
