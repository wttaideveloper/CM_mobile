import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  MarketCartChevronIcon,
  MarketCartPlusIcon,
} from '@/components/market/MarketCartIcons';
import {
  MarketCheckoutCheckIcon,
  MarketCheckoutPinIcon,
  MarketCheckoutShieldIcon,
} from '@/components/market/MarketCheckoutIcons';
import {
  MARKET_CHECKOUT,
  MARKET_CHECKOUT_BORDER,
  MARKET_CHECKOUT_GREEN,
  MARKET_CHECKOUT_LINES,
  MARKET_CHECKOUT_MUTED,
  MARKET_CHECKOUT_TEAL,
  MARKET_CHECKOUT_TRACK,
} from '@/components/market/marketCheckoutData';
import { c, NU } from '@/utils/newUiCompact';

export function MarketCheckoutBody() {
  return (
    <View style={styles.body}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Deliver to</Text>
        <View style={styles.card}>
          <MarketCheckoutPinIcon />
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>{MARKET_CHECKOUT.addressLabel}</Text>
            <Text style={styles.cardMeta}>{MARKET_CHECKOUT.addressLine}</Text>
          </View>
          <Text style={styles.link}>Change</Text>
        </View>
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
          {MARKET_CHECKOUT_LINES.map((line) => (
            <View key={line.id} style={styles.lineRow}>
              <View style={[styles.swatch, { backgroundColor: line.swatch }]} />
              <Text style={styles.lineTitle}>{line.title}</Text>
              <Text style={styles.linePrice}>{line.price}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Delivery</Text>
            <Text style={styles.feeFree}>{MARKET_CHECKOUT.delivery}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Tax</Text>
            <Text style={styles.feeValue}>{MARKET_CHECKOUT.tax}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total due today</Text>
            <Text style={styles.totalValue}>{MARKET_CHECKOUT.total}</Text>
          </View>
        </View>
      </View>

      <View style={styles.note}>
        <MarketCheckoutShieldIcon />
        <Text style={styles.noteText}>{MARKET_CHECKOUT.renewNote}</Text>
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
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(11, 9),
  },
  swatch: {
    width: c(38, 32),
    height: c(38, 32),
    borderRadius: c(10, 8),
  },
  lineTitle: {
    flex: 1,
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: MARKET_CHECKOUT_TEAL,
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
  note: {
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: c(12.5, 11.5),
    lineHeight: c(19, 17),
    color: '#3c6b47',
  },
});
