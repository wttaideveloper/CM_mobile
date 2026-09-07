import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  MarketCartChevronIcon,
  MarketCartMinusIcon,
  MarketCartPlusIcon,
  MarketCartPromoIcon,
} from '@/components/market/MarketCartIcons';
import {
  MarketBagIcon,
  MarketBowlIcon,
  MarketPulseIcon,
} from '@/components/market/MarketIcons';
import {
  MARKET_CART_BORDER,
  MARKET_CART_GREEN,
  MARKET_CART_GROUPS,
  MARKET_CART_MUTED,
  MARKET_CART_SUMMARY,
  MARKET_CART_TEAL,
  MARKET_CART_TRACK,
  type MarketCartItem,
} from '@/components/market/marketCartData';
import { c, NU } from '@/utils/newUiCompact';

function ItemIcon({ item }: { item: MarketCartItem }) {
  const props = { color: item.iconColor, size: 22 };
  switch (item.icon) {
    case 'bag':
      return <MarketBagIcon {...props} />;
    case 'bowl':
      return <MarketBowlIcon {...props} />;
    case 'pulse':
      return <MarketPulseIcon {...props} />;
  }
}

function QtyStepper({
  qty,
  onChange,
}: {
  qty: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={styles.qty}>
      <Pressable
        onPress={() => onChange(Math.max(1, qty - 1))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <MarketCartMinusIcon />
      </Pressable>
      <Text style={styles.qtyText}>{qty}</Text>
      <Pressable
        onPress={() => onChange(qty + 1)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <MarketCartPlusIcon />
      </Pressable>
    </View>
  );
}

export function MarketCartBody() {
  const [qtyById, setQtyById] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    MARKET_CART_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        initial[item.id] = item.qty;
      });
    });
    return initial;
  });

  return (
    <View style={styles.body}>
      {MARKET_CART_GROUPS.map((group) => (
        <View key={group.id} style={styles.group}>
          <View style={styles.bizRow}>
            <View style={[styles.avatar, { backgroundColor: group.avatarBg }]}>
              <Text style={[styles.initials, { color: group.avatarColor }]}>
                {group.initials}
              </Text>
            </View>
            <Text style={styles.bizName}>{group.name}</Text>
          </View>

          <View style={styles.card}>
            {group.items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index < group.items.length - 1 && styles.itemBorder,
                ]}
              >
                <View style={[styles.itemIcon, { backgroundColor: item.iconBg }]}>
                  <ItemIcon item={item} />
                </View>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
                <QtyStepper
                  qty={qtyById[item.id] ?? item.qty}
                  onChange={(next) =>
                    setQtyById((prev) => ({ ...prev, [item.id]: next }))
                  }
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      <Pressable style={styles.promo} accessibilityRole="button">
        <MarketCartPromoIcon />
        <Text style={styles.promoText}>Add a promo code</Text>
        <MarketCartChevronIcon />
      </Pressable>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{MARKET_CART_SUMMARY.subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.summaryFree}>{MARKET_CART_SUMMARY.delivery}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>{MARKET_CART_SUMMARY.tax}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{MARKET_CART_SUMMARY.total}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(20, 16),
  },
  group: {
    gap: c(11, 9),
  },
  bizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(9, 7),
  },
  avatar: {
    width: c(26, 22),
    height: c(26, 22),
    borderRadius: c(8, 6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: c(10.5, 9.5),
    fontWeight: '800',
  },
  bizName: {
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: MARKET_CART_TEAL,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CART_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  itemRow: {
    paddingVertical: c(13, 11),
    paddingHorizontal: NU.cardPadSm,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MARKET_CART_TRACK,
  },
  itemIcon: {
    width: c(56, 48),
    height: c(56, 48),
    borderRadius: NU.cardRadiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  itemTitle: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: MARKET_CART_TEAL,
  },
  itemSubtitle: {
    fontSize: c(11.5, 10.5),
    color: MARKET_CART_MUTED,
  },
  itemPrice: {
    marginTop: c(2, 1),
    fontSize: c(14.5, 13.5),
    fontWeight: '800',
    color: MARKET_CART_TEAL,
  },
  qty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(9, 7),
    borderWidth: 1,
    borderColor: MARKET_CART_BORDER,
    borderRadius: 99,
    paddingVertical: c(5, 4),
    paddingHorizontal: c(9, 7),
  },
  qtyText: {
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: MARKET_CART_TEAL,
  },
  promo: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CART_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.cardGap,
  },
  promoText: {
    flex: 1,
    fontSize: NU.link,
    fontWeight: '600',
    color: MARKET_CART_TEAL,
  },
  summary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_CART_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(10, 8),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: c(13.5, 12.5),
    color: '#5d7a67',
  },
  summaryValue: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: MARKET_CART_TEAL,
  },
  summaryFree: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: MARKET_CART_GREEN,
  },
  divider: {
    height: 1,
    backgroundColor: MARKET_CART_TRACK,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: MARKET_CART_TEAL,
  },
  totalValue: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: MARKET_CART_TEAL,
  },
});
