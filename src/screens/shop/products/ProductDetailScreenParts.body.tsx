import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { PlusIcon, ShoppingCartIcon } from '@/components/dashboard/DashboardIcons';
import { PRIMARY, styles } from '@/screens/shop/products/ProductDetailScreen.styles';

import { ProductStarRating } from '@/screens/shop/products/ProductDetailScreenParts.hero';
import type { ProductViewModel } from '@/screens/shop/products/ProductDetailScreenParts.types';

export function ProductDetailBody({
  product,
  previewImages,
  showThumbnails,
  activeImageIndex,
  quantity,
  onSelectImage,
  onDecreaseQuantity,
  onIncreaseQuantity,
}: {
  product: ProductViewModel;
  previewImages: string[];
  showThumbnails: boolean;
  activeImageIndex: number;
  quantity: number;
  onSelectImage: (index: number) => void;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
}) {
  return (
    <View style={styles.contentSection}>
      {showThumbnails ? (
        <View style={styles.thumbnailRow} pointerEvents="box-none">
          {previewImages.map((uri, index) => {
            const isActive = index === activeImageIndex;

            return (
              <Pressable
                key={`${uri}-thumb-${index}`}
                onPress={() => onSelectImage(index)}
                accessibilityRole="button"
                accessibilityLabel={`View image ${index + 1}`}
                accessibilityState={{ selected: isActive }}
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
              onPress={onDecreaseQuantity}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              style={({ pressed }) => [styles.qtyBtn, styles.qtyBtnMinus, pressed && styles.pressed]}
            >
              <View style={styles.qtyMinusLine} />
            </Pressable>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <Pressable
              onPress={onIncreaseQuantity}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={({ pressed }) => [styles.qtyBtn, styles.qtyBtnPlus, pressed && styles.pressed]}
            >
              <PlusIcon size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ProductDetailFooter({
  totalPriceLabel,
  paddingBottom,
  cartCount,
  onAddToCart,
  onBuyNow,
  addDisabled,
  isInCart,
  cartPulseKey,
}: {
  totalPriceLabel: string;
  paddingBottom: number;
  cartCount: number;
  onAddToCart: () => void;
  onBuyNow?: () => void;
  addDisabled?: boolean;
  isInCart?: boolean;
  cartPulseKey?: number;
}) {
  const badgeLabel = cartCount > 99 ? '99+' : String(cartCount);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!cartPulseKey) {
      return;
    }

    pulse.setValue(1);
    Animated.sequence([
      Animated.spring(pulse, { toValue: 1.22, useNativeDriver: true, friction: 4, tension: 140 }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true, friction: 5, tension: 120 }),
    ]).start();
  }, [cartPulseKey, pulse]);

  return (
    <View style={[styles.footer, { paddingBottom, paddingTop: 12 }]}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable
          onPress={onAddToCart}
          disabled={addDisabled}
          accessibilityRole="button"
          accessibilityLabel={isInCart ? 'Go to cart' : 'Add to cart'}
          accessibilityState={{ disabled: !!addDisabled }}
          style={({ pressed }) => [
            styles.cartBtn,
            pressed && styles.pressed,
            addDisabled && styles.cartBtnDisabled,
          ]}
          hitSlop={6}
        >
          <ShoppingCartIcon size={22} color={PRIMARY} />
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{badgeLabel}</Text>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
      <LeafyGradientButton style={styles.buyBtn} borderRadius={14} onPress={onBuyNow}>
        <Text style={styles.buyBtnText}>Buy Now · {totalPriceLabel}</Text>
      </LeafyGradientButton>
    </View>
  );
}
