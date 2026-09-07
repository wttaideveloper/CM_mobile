import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { CartRow } from '@/components/checkout/CartRow';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/hooks/useCart';
import { PAGE_BG, PRIMARY, checkoutStyles as styles } from '@/screens/checkout/checkout.styles';
import {
  getCheckoutTotals,
  useCartStore,
  type MockCartItem,
} from '@/stores/cart.store';
import { formatProductPrice } from '@/utils/product.mapper';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, isError, error, refetch, isFetching } = useCart();
  const items = useCartStore((state) => state.items);
  const startCartCheckout = useCartStore((state) => state.startCartCheckout);
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const totals = getCheckoutTotals(items);
  const isMutating =
    updateItem.isPending || removeItem.isPending || clearCart.isPending;

  const showCartError = (message?: string) => {
    Alert.alert('Cart', message || 'Something went wrong. Please try again.');
  };

  const requireItemId = (item: MockCartItem) => {
    if (!item.id) {
      showCartError('Missing cart item id. Refresh and try again.');
      void refetch();
      return null;
    }
    return item.id;
  };

  const handleDecrease = (item: MockCartItem) => {
    const itemId = requireItemId(item);
    if (!itemId || isMutating) {
      return;
    }

    if (item.quantity <= 1) {
      removeItem.mutate(itemId, {
        onError: (err) => showCartError(err.message),
      });
      return;
    }

    updateItem.mutate(
      { itemId, quantity: item.quantity - 1 },
      { onError: (err) => showCartError(err.message) },
    );
  };

  const handleIncrease = (item: MockCartItem) => {
    const itemId = requireItemId(item);
    if (!itemId || isMutating) {
      return;
    }

    const maxStock = item.stockQuantity;
    if (maxStock != null && maxStock > 0 && item.quantity >= maxStock) {
      showCartError(`Only ${maxStock} in stock.`);
      return;
    }

    updateItem.mutate(
      { itemId, quantity: item.quantity + 1 },
      { onError: (err) => showCartError(err.message) },
    );
  };

  const handleRemove = (item: MockCartItem) => {
    const itemId = requireItemId(item);
    if (!itemId || isMutating) {
      return;
    }

    removeItem.mutate(itemId, {
      onError: (err) => showCartError(err.message),
    });
  };

  const handleClearCart = () => {
    if (isMutating || items.length === 0) {
      return;
    }

    Alert.alert('Clear cart?', 'Remove all items from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearCart.mutate(undefined, {
            onError: (err) => showCartError(err.message),
          });
        },
      },
    ]);
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <StatusBarFill />
        <View style={styles.successWrap}>
          <ActivityIndicator color={PRIMARY} size="large" />
          <Text style={[styles.fieldHint, { marginTop: 12 }]}>Loading cart…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.header, { paddingTop: 8 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <ChevronLeftIcon size={20} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Cart</Text>
        {items.length > 0 && !isError ? (
          <Pressable
            onPress={handleClearCart}
            disabled={isMutating}
            accessibilityRole="button"
            accessibilityLabel="Clear cart"
          >
            <Text style={styles.stepText}>Clear</Text>
          </Pressable>
        ) : (
          <Text style={styles.stepText}>
            {totals.count} item{totals.count === 1 ? '' : 's'}
          </Text>
        )}
      </View>

      {isError ? (
        <View style={[styles.content, { paddingTop: 24 }]}>
          <Text style={styles.emptyText}>
            {error?.message || 'Could not load your cart.'}
          </Text>
          <Pressable
            onPress={() => {
              void refetch();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.qtyBtn,
              styles.qtyBtnPlus,
              { alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 14 },
              pressed && styles.pressed,
            ]}
          >
            <Text style={{ color: PAGE_BG, fontWeight: '600' }}>
              {isFetching ? 'Retrying…' : 'Retry'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <Text style={styles.emptyText}>Your cart is empty. Add a product to continue.</Text>
          ) : (
            <>
              {items.map((item) => (
                <CartRow
                  key={item.id ?? item.productId}
                  item={item}
                  disabled={isMutating}
                  onDecrease={() => handleDecrease(item)}
                  onIncrease={() => handleIncrease(item)}
                  onRemove={() => handleRemove(item)}
                />
              ))}

              <View style={styles.card}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    {formatProductPrice(totals.subtotal, totals.currency)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={styles.summaryValue}>
                    {formatProductPrice(totals.shipping, totals.currency)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, { marginBottom: 0 }]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatProductPrice(totals.total, totals.currency)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {items.length > 0 && !isError ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <LeafyGradientButton
            style={styles.cta}
            borderRadius={14}
            onPress={() => {
              startCartCheckout();
              router.push('/(main)/checkout/address');
            }}
          >
            <Text style={styles.ctaText}>
              Checkout · {formatProductPrice(totals.total, totals.currency)}
            </Text>
          </LeafyGradientButton>
        </View>
      ) : null}
    </View>
  );
}
