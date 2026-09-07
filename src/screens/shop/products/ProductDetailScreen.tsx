import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAddToCart, useCart } from '@/hooks/useCart';
import { useDetailBack } from '@/hooks/useDetailBack';
import { useInsideTabLayout } from '@/hooks/useInsideTabLayout';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cart.store';
import { formatProductPrice } from '@/utils/product.mapper';
import {
  ProductDetailBody,
  ProductDetailFooter,
  ProductDetailHero,
  mapApiProductToViewModel,
} from '@/screens/shop/products/ProductDetailScreenParts';
import { PRIMARY, SCREEN_WIDTH, styles } from '@/screens/shop/products/ProductDetailScreen.styles';

export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goBack = useDetailBack();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { screenOffsetStyle } = useInsideTabLayout();
  const carouselRef = useRef<ScrollViewType>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const [flyImage, setFlyImage] = useState<string | null>(null);
  const flyAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const startBuyNow = useCartStore((state) => state.startBuyNow);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const addToCartMutation = useAddToCart();
  useCart();

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

  const onCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  const selectImage = (index: number) => {
    setActiveImageIndex(index);
    carouselRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const cartPayload = {
    productId: product.id,
    name: product.name,
    image: product.image,
    unitPrice: product.unitPrice,
    currency: product.currency,
  };

  const isInCart = cartItems.some((item) => item.productId === product.id);
  const isAdding = addToCartMutation.isPending;

  const playAddedFeedback = () => {
    setFlyImage(product.image);
    setShowAddedToast(true);
    setCartPulseKey((current) => current + 1);
    flyAnim.setValue(0);
    toastAnim.setValue(0);

    Animated.parallel([
      Animated.timing(flyAnim, {
        toValue: 1,
        duration: 720,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(toastAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.delay(1600),
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }
      setFlyImage(null);
      setShowAddedToast(false);
    });
  };

  const handleAddToCart = () => {
    if (!product.inStock || isAdding) {
      return;
    }

    if (isInCart) {
      router.push('/(main)/checkout/cart');
      return;
    }

    addToCartMutation.mutate(
      {
        product_id: product.id,
        quantity,
      },
      {
        onSuccess: () => {
          playAddedFeedback();
        },
        onError: (error) => {
          Alert.alert('Could not add to cart', error.message || 'Please try again.');
        },
      },
    );
  };

  const handleBuyNow = () => {
    if (!product.inStock) {
      return;
    }

    startBuyNow(cartPayload, quantity);
    router.push('/(main)/checkout/address');
  };

  return (
    <View style={[styles.screen, screenOffsetStyle]}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={styles.body}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        >
          <ProductDetailHero
            carouselRef={carouselRef}
            carouselImages={carouselImages}
            activeImageIndex={activeImageIndex}
            onBack={goBack}
            onCarouselScroll={onCarouselScroll}
          />
          <ProductDetailBody
            product={product}
            previewImages={previewImages}
            showThumbnails={showThumbnails}
            activeImageIndex={activeImageIndex}
            quantity={quantity}
            onSelectImage={selectImage}
            onDecreaseQuantity={() => setQuantity((current) => Math.max(1, current - 1))}
            onIncreaseQuantity={() =>
              setQuantity((current) =>
                product.stockCount > 0
                  ? Math.min(product.stockCount, current + 1)
                  : current + 1,
              )
            }
          />
        </ScrollView>

        <ProductDetailFooter
          totalPriceLabel={totalPriceLabel}
          paddingBottom={insets.bottom + 12}
          cartCount={cartCount}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          addDisabled={!product.inStock || isAdding}
          isInCart={isInCart}
          cartPulseKey={cartPulseKey}
        />
        {flyImage ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.flyingCartImage,
              {
                top: '38%',
                left: SCREEN_WIDTH / 2 - 44,
                opacity: flyAnim.interpolate({
                  inputRange: [0, 0.15, 1],
                  outputRange: [0, 1, 0.2],
                }),
                transform: [
                  {
                    translateX: flyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -(SCREEN_WIDTH / 2 - 40)],
                    }),
                  },
                  {
                    translateY: flyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 220],
                    }),
                  },
                  {
                    scale: flyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.18],
                    }),
                  },
                  {
                    rotate: flyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-28deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image source={{ uri: flyImage }} style={styles.flyingCartImageInner} contentFit="cover" />
          </Animated.View>
        ) : null}
        {showAddedToast ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.cartToast,
              {
                bottom: insets.bottom + 72,
                opacity: toastAnim,
                transform: [
                  {
                    translateY: toastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                  {
                    scale: toastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.cartToastCheck}>
              <Text style={styles.cartToastCheckText}>✓</Text>
            </View>
            <Text style={styles.cartToastText}>Product added to cart</Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}
