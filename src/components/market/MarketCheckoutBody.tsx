import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  MarketCartChevronIcon,
  MarketCartPlusIcon,
} from '@/components/market/MarketCartIcons';
import {
  MarketCheckoutCheckIcon,
  MarketCheckoutPinIcon,
} from '@/components/market/MarketCheckoutIcons';
import { formatMarketAddressLine } from '@/components/market/marketAddressData';
import {
  MARKET_CHECKOUT,
  MARKET_CHECKOUT_BORDER,
  MARKET_CHECKOUT_GREEN,
  MARKET_CHECKOUT_MUTED,
  MARKET_CHECKOUT_TEAL,
  MARKET_CHECKOUT_TRACK,
} from '@/components/market/marketCheckoutData';
import { useAddresses } from '@/hooks/useAddresses';
import { useCart } from '@/hooks/useCart';
import { useMarketCheckoutAddressStore } from '@/stores/marketCheckoutAddress.store';
import { formatMoney } from '@/utils/currency';
import {
  buildMarketCartSummary,
  mapCartItemToMarketCartItem,
} from '@/utils/marketCart.mapper';
import { c, NU } from '@/utils/newUiCompact';

export function MarketCheckoutBody() {
  const router = useRouter();
  const { isLoading: isAddressesLoading } = useAddresses();
  const { cart, isLoading: isCartLoading, isError, refetch } = useCart();
  const address = useMarketCheckoutAddressStore((s) => {
    return (
      s.savedAddresses.find((item) => item.id === s.selectedAddressId) ??
      s.savedAddresses[0]
    );
  });

  const lines = useMemo(
    () => (cart?.items ?? []).map(mapCartItemToMarketCartItem),
    [cart],
  );
  const summary = useMemo(() => buildMarketCartSummary(cart), [cart]);

  return (
    <View style={styles.body}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Deliver to</Text>
        <Pressable
          style={styles.card}
          onPress={() => router.push('/(main)/market/address')}
          accessibilityRole="button"
          accessibilityLabel={
            address ? 'Change delivery address' : 'Add delivery address'
          }
        >
          <MarketCheckoutPinIcon />
          <View style={styles.cardCopy}>
            {isAddressesLoading && !address ? (
              <ActivityIndicator color={MARKET_CHECKOUT_GREEN} />
            ) : address ? (
              <>
                <Text style={styles.cardTitle}>{address.label}</Text>
                <Text style={styles.cardMeta}>
                  {formatMarketAddressLine(address)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Add delivery address</Text>
                <Text style={styles.cardMeta}>
                  Choose a saved address or add a new one
                </Text>
              </>
            )}
          </View>
          <Text style={styles.link}>{address ? 'Change' : 'Add'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Payment method</Text>
        <View style={styles.paymentSelected}>
          <View style={styles.visaBadge}>
            <Text style={styles.visaText}>VISA</Text>
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>{MARKET_CHECKOUT.cardLabel}</Text>
            <Text style={styles.cardMeta}>{MARKET_CHECKOUT.cardExpiry}</Text>
          </View>
          <View style={styles.check}>
            <MarketCheckoutCheckIcon />
          </View>
        </View>
        <Pressable style={styles.card} accessibilityRole="button">
          <View style={styles.addBadge}>
            <MarketCartPlusIcon color="#7c9585" size={16} />
          </View>
          <Text style={styles.addText}>Add a card</Text>
          <MarketCartChevronIcon />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Order summary</Text>
        <View style={styles.summaryCard}>
          {isCartLoading && lines.length === 0 ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={MARKET_CHECKOUT_GREEN} />
            </View>
          ) : null}

          {isError && lines.length === 0 ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>Could not load cart items.</Text>
              <Pressable
                style={styles.retryBtn}
                onPress={() => refetch()}
                accessibilityRole="button"
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {!isCartLoading && !isError && lines.length === 0 ? (
            <Text style={styles.stateText}>Your cart is empty.</Text>
          ) : null}

          {lines.map((line) => {
            const cartItem = cart?.items.find((item) => item.id === line.id);
            const linePrice = cartItem
              ? formatMoney(cartItem.lineTotal, cartItem.currency)
              : line.price;

            return (
              <View key={line.id} style={styles.lineRow}>
                <View style={[styles.swatch, { backgroundColor: line.iconBg }]}>
                  {line.imageUrl ? (
                    <Image
                      source={{ uri: line.imageUrl }}
                      style={styles.swatchImage}
                      contentFit="cover"
                      transition={0}
                    />
                  ) : null}
                </View>
                <View style={styles.lineCopy}>
                  <Text style={styles.lineTitle} numberOfLines={2}>
                    {line.title}
                  </Text>
                  <Text style={styles.lineMeta}>Qty {line.qty}</Text>
                </View>
                <Text style={styles.linePrice}>{linePrice}</Text>
              </View>
            );
          })}

          {lines.length > 0 ? (
            <>
              <View style={styles.divider} />
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Subtotal</Text>
                <Text style={styles.feeValue}>{summary.subtotal}</Text>
              </View>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Delivery</Text>
                <Text style={styles.feeFree}>{summary.delivery}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total due today</Text>
                <Text style={styles.totalValue}>{summary.total}</Text>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: c(20, 16),
    paddingBottom: NU.bodyPadBottom,
    gap: c(20, 16),
  },
  section: {
    gap: c(10, 8),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: MARKET_CHECKOUT_MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: MARKET_CHECKOUT_TEAL,
  },
  cardMeta: {
    marginTop: c(2, 1),
    fontSize: c(12.5, 11.5),
    color: MARKET_CHECKOUT_MUTED,
  },
  link: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: MARKET_CHECKOUT_GREEN,
  },
  paymentSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: MARKET_CHECKOUT_GREEN,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  visaBadge: {
    width: NU.iconBtn,
    height: c(28, 24),
    borderRadius: c(6, 5),
    backgroundColor: MARKET_CHECKOUT_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    fontSize: c(9.5, 9),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  check: {
    width: c(22, 20),
    height: c(22, 20),
    borderRadius: c(11, 10),
    backgroundColor: MARKET_CHECKOUT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBadge: {
    width: NU.iconBtn,
    height: c(28, 24),
    borderRadius: c(6, 5),
    backgroundColor: MARKET_CHECKOUT_TRACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    flex: 1,
    fontSize: NU.link,
    fontWeight: '600',
    color: MARKET_CHECKOUT_TEAL,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CHECKOUT_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: NU.cardGap,
  },
  stateBox: {
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: c(8, 6),
  },
  stateText: {
    fontSize: NU.body,
    color: MARKET_CHECKOUT_MUTED,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: c(14, 12),
    paddingVertical: c(8, 7),
    borderRadius: 99,
    backgroundColor: MARKET_CHECKOUT_TEAL,
  },
  retryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(11, 9),
  },
  swatch: {
    width: c(38, 32),
    height: c(38, 32),
    borderRadius: c(10, 8),
    overflow: 'hidden',
  },
  swatchImage: {
    width: '100%',
    height: '100%',
  },
  lineCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  lineTitle: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: MARKET_CHECKOUT_TEAL,
  },
  lineMeta: {
    fontSize: c(12, 11),
    color: MARKET_CHECKOUT_MUTED,
  },
  linePrice: {
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: MARKET_CHECKOUT_TEAL,
  },
  divider: {
    height: 1,
    backgroundColor: MARKET_CHECKOUT_TRACK,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: NU.body,
    color: '#5d7a67',
  },
  feeFree: {
    fontSize: NU.body,
    fontWeight: '600',
    color: MARKET_CHECKOUT_GREEN,
  },
  feeValue: {
    fontSize: NU.body,
    fontWeight: '600',
    color: MARKET_CHECKOUT_TEAL,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: MARKET_CHECKOUT_TEAL,
  },
  totalValue: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: MARKET_CHECKOUT_TEAL,
  },
});
