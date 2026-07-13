import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { AppStatusBar, StatusBarFill, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { useMemo, useRef, useState } from 'react';
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
  type ScrollView as ScrollViewType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronLeftIcon,
  HeartIcon,
  LucideStarIcon,
  PlusIcon,
  ShoppingCartIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import { useDetailBack } from '@/hooks/useDetailBack';
import { useInsideTabLayout } from '@/hooks/useInsideTabLayout';
import { useProduct } from '@/hooks/useProducts';
import type { ProductDetailItem } from '@/types/product.types';
import { formatProductPrice, formatProductStockLabel } from '@/utils/product.mapper';
import { shadowMd, shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const PAGE_BG = '#FFFFFF';
const SPEC_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const STOCK_GREEN = '#059669';
const RATING_STAR_COLOR = '#F59E0B';
const RATING_PILL_BG = '#FFF6E8';
const RATING_TEXT = '#B45309';
const EMPTY_STAR_COLOR = '#D1D5DB';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const H_PAD = isSmallDevice ? 16 : 20;
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * (isSmallDevice ? 0.36 : 0.4));
const THUMB_SIZE = isSmallDevice ? 44 : 52;
const THUMB_OVERLAP = THUMB_SIZE / 2;

type ProductSpec = {
  value: string;
  label: string;
};

type ProductViewModel = {
  name: string;
  category: string;
  brand: string;
  price: string;
  unitPrice: number;
  currency: string;
  originalPrice: string | null;
  rating: string;
  reviewLabel: string;
  description: string;
  specs: ProductSpec[];
  stockLabel: string;
  stockCount: number;
  inStock: boolean;
  images: string[];
};

function mapApiProductToViewModel(product: ProductDetailItem): ProductViewModel {
  const specs: ProductSpec[] = [
    { value: product.length, label: 'Length' },
    { value: product.width, label: 'Width' },
    { value: product.thick, label: 'Thickness' },
  ].filter((spec) => spec.value !== '0' && spec.value !== 'NA');

  const hasSale =
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.salePrice < product.price;

  const unitPrice = hasSale ? product.salePrice! : product.price;
  const ratingValue = Number.parseFloat(product.rating) || 0;

  return {
    name: product.name,
    category: product.category,
    brand: product.enterpriseName,
    price: formatProductPrice(unitPrice, product.currency),
    unitPrice,
    currency: product.currency,
    originalPrice: hasSale
      ? formatProductPrice(product.price, product.currency)
      : null,
    rating: product.rating,
    reviewLabel: ratingValue > 0 ? `${product.rating} reviews` : '0 reviews',
    description: product.description,
    specs,
    stockLabel: formatProductStockLabel(product.stockCount),
    stockCount: product.stockCount,
    inStock: product.stockCount > 0,
    images: product.images.length > 0 ? product.images : [product.image],
  };
}

function ProductStarRating({ rating }: { rating: string }) {
  const value = Math.max(0, Math.min(5, Number.parseFloat(rating) || 0));
  const filledCount = Math.round(value);

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, index) =>
        index < filledCount ? (
          <StarIcon key={index} size={13} color={RATING_STAR_COLOR} />
        ) : (
          <LucideStarIcon key={index} size={13} color={EMPTY_STAR_COLOR} />
        ),
      )}
    </View>
  );
}

function ImagePagination({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View style={styles.pagination}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === activeIndex ? styles.paginationDotActive : styles.paginationDotInactive,
          ]}
        />
      ))}
    </View>
  );
}

export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goBack = useDetailBack();
  const insets = useSafeAreaInsets();
  const { screenOffsetStyle } = useInsideTabLayout();
  const statusBarFill = useStatusBarBackground(PAGE_BG, PAGE_BG);
  const carouselRef = useRef<ScrollViewType>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const productId = Array.isArray(id) ? id[0] : id ?? '';
  const { product: apiProduct, isLoading, isError } = useProduct(productId, {
    enabled: Boolean(productId),
  });
  const product = useMemo(() => {
    if (!apiProduct) {
      return undefined;
    }

    return mapApiProductToViewModel(apiProduct);
  }, [apiProduct]);

  const totalPriceLabel = useMemo(() => {
    if (!product) {
      return '';
    }

    return formatProductPrice(product.unitPrice * quantity, product.currency);
  }, [product, quantity]);

  if (isLoading) {
    return (
      <View style={[styles.screen, screenOffsetStyle]}>
         <AppStatusBar />
         <StatusBarFill />
        <View style={styles.loadingState}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      </View>
    );
  }

  if (!product || isError) {
    return (
      <View style={[styles.screen, screenOffsetStyle]}>
      <AppStatusBar />
      <StatusBarFill />
        <EmptyState
          variant="notFound"
          entity="product"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const carouselImages = product.images;
  const previewImages = carouselImages.slice(0, 3);
  const showThumbnails = previewImages.length > 0;
  const showPagination = carouselImages.length > 1;

  const onCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  const selectImage = (index: number) => {
    setActiveImageIndex(index);
    carouselRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  return (
    <View style={[styles.screen, screenOffsetStyle]}>
      {/* <AppStatusBar backgroundColor={PAGE_BG} /> */}
      <AppStatusBar />
      <StatusBarFill />

      {/* <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} /> */}

      <View style={styles.body}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        >
        <View style={[styles.hero, { height: HERO_HEIGHT }]}>
          <ScrollView
            ref={carouselRef}
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
                style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          <View style={styles.heroActions}>
            <Pressable
              onPress={goBack}
              style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={20} color={PRIMARY} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <HeartIcon size={20} color={PRIMARY} />
            </Pressable>
          </View>

          {showPagination ? (
            <ImagePagination count={carouselImages.length} activeIndex={activeImageIndex} />
          ) : null}
        </View>

        <View style={styles.contentSection}>
          {showThumbnails ? (
            <View style={styles.thumbnailRow} pointerEvents="box-none">
              {previewImages.map((uri, index) => {
                const isActive = index === activeImageIndex;

                return (
                  <Pressable
                    key={`${uri}-thumb-${index}`}
                    onPress={() => selectImage(index)}
                    style={[styles.thumbnailWrap, isActive && styles.thumbnailWrapActive]}
                  >
                    <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" />
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={[styles.contentBody, showThumbnails && styles.contentBodyWithThumbs]}>
          <View style={styles.metaRow}>
            {product.category !== 'NA' ? (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{product.category}</Text>
              </View>
            ) : null}
            {product.brand !== 'NA' ? (
              <Text style={styles.brandText}>· {product.brand}</Text>
            ) : null}
          </View>

          <View style={styles.headerBlock}>
            <Text style={styles.productTitle}>{product.name}</Text>
            <View style={styles.priceBlock}>
              <Text style={styles.productPrice}>{product.price}</Text>
              {product.originalPrice ? (
                <Text style={styles.originalPrice}>{product.originalPrice}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.ratingPill}>
            <ProductStarRating rating={product.rating} />
            <Text style={styles.ratingValue}>{product.rating}</Text>
            <Text style={styles.ratingDot}>·</Text>
            <Text style={styles.reviewsText}>{product.reviewLabel}</Text>
          </View>

          {product.description !== 'NA' ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          {product.specs.length > 0 ? (
            <View style={styles.specsRow}>
              {product.specs.slice(0, 3).map((spec) => (
                <View key={spec.label} style={styles.specCard}>
                  <Text style={styles.specValue}>{spec.value}</Text>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={[styles.stockPill, !product.inStock && styles.stockPillOut]}>
            <View style={[styles.stockDot, !product.inStock && styles.stockDotOut]} />
            {product.inStock ? (
              <Text style={styles.stockText}>
                <Text style={styles.stockStatus}>In Stock</Text>
                <Text style={styles.stockRemaining}>
                  {' '}
                  · {product.stockCount} units remaining
                </Text>
              </Text>
            ) : (
              <Text style={[styles.stockText, styles.stockTextOut]}>{product.stockLabel}</Text>
            )}
          </View>

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <Pressable
                onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                style={({ pressed }) => [styles.qtyBtn, styles.qtyBtnMinus, pressed && styles.pressed]}
              >
                <View style={styles.qtyMinusLine} />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity((current) => current + 1)}
                style={({ pressed }) => [styles.qtyBtn, styles.qtyBtnPlus, pressed && styles.pressed]}
              >
                <PlusIcon size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            </View>
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
          style={({ pressed }) => [styles.cartBtn, pressed && styles.pressed]}
          hitSlop={6}
        >
          <ShoppingCartIcon size={22} color={PRIMARY} />
        </Pressable>
        <LeafyGradientButton style={styles.buyBtn} borderRadius={14}>
          <Text style={styles.buyBtnText}>Buy Now · {totalPriceLabel}</Text>
        </LeafyGradientButton>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  statusBarFill: {
    backgroundColor: PAGE_BG,
  },
  body: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  hero: {
    backgroundColor: '#F0F2F1',
    position: 'relative',
  },
  heroImage: {
    backgroundColor: '#F0F2F1',
  },
  heroActions: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 12 : 16,
  },
  heroBtn: {
    width: isSmallDevice ? 40 : 38,
    height: isSmallDevice ? 40 : 38,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowMd,
  },
  thumbnailRow: {
    position: 'absolute',
    top: -THUMB_OVERLAP,
    left: H_PAD,
    flexDirection: 'row',
    gap: 10,
    zIndex: 20,
    elevation: 20,
  },
  thumbnailWrap: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: PAGE_BG,
    ...shadowMd,
  },
  thumbnailWrapActive: {
    borderColor: PRIMARY,
    borderWidth: 1,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: '#F0F2F1',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  paginationDotActive: {
    backgroundColor: PRIMARY,
    width: 8,
    height: 8,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  contentSection: {
    position: 'relative',
    backgroundColor: PAGE_BG,
  },
  contentBody: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 : 18,
    paddingBottom: 48,
  },
  contentBodyWithThumbs: {
    paddingTop: THUMB_OVERLAP + (isSmallDevice ? 12 : 14),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  categoryChip: {
    backgroundColor: MINT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: PRIMARY,
  },
  brandText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgb(107, 114, 128)',
  },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  productTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 20 : 21,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  priceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  productPrice: {
    fontSize: isSmallDevice ? 18 : 18,
    lineHeight: 24,
    fontWeight: '900',
    color: PRIMARY,
  },
  originalPrice: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: RATING_PILL_BG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: RATING_TEXT,
  },
  ratingDot: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: RATING_TEXT,
  },
  reviewsText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: 'rgb(180, 83, 9)',
  },
  description: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 18 : 22,
  },
  specsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 16 : 18,
  },
  specCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: SPEC_BG,
    borderRadius: 14,
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 6 : 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specValue: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 24,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 2 : 2,
    textAlign: 'center',
  },
  specLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: MINT,
    borderWidth: 1,
    borderColor: '#CFE8D6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: isSmallDevice ? 18 : 22,
  },
  stockPillOut: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: STOCK_GREEN,
  },
  stockDotOut: {
    backgroundColor: '#DC2626',
  },
  stockText: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
  },
  stockStatus: {
    fontWeight: '700',
    color: STOCK_GREEN,
  },
  stockRemaining: {
    fontWeight: '500',
    color: 'rgb(107, 114, 128)',
  },
  stockTextOut: {
    fontWeight: '600',
    color: '#DC2626',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SPEC_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnMinus: {
    backgroundColor: PAGE_BG,
    ...shadowSm,
  },
  qtyMinusLine: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: TEXT_MUTED,
  },
  qtyBtnPlus: {
    backgroundColor: PRIMARY,
    ...shadowMd,
  },
  qtyValue: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: PRIMARY,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: H_PAD,
    backgroundColor: PAGE_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    ...shadowSm,
  },
  cartBtn: {
    width: isSmallDevice ? 46 : 48,
    height: isSmallDevice ? 46 : 48,
    borderRadius: 12,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtn: {
    flex: 1,
    height: isSmallDevice ? 46 : 48,
  },
  buyBtnText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAGE_BG,
    padding: 24,
  },
});
