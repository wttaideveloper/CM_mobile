import { StyleSheet, Text, View } from 'react-native';

import {
  OrderConfirmedCalendarIcon,
  OrderConfirmedCheckIcon,
  OrderConfirmedTruckIcon,
} from '@/components/market/MarketOrderConfirmedIcons';
import {
  MARKET_ORDER_CONFIRMED,
  ORDER_CONFIRMED_DETAILS,
  ORDER_CONFIRMED_MUTED,
  ORDER_CONFIRMED_TEAL,
  ORDER_CONFIRMED_TRACK,
} from '@/components/market/marketOrderConfirmedData';
import { c, NU } from '@/utils/newUiCompact';

export function MarketOrderConfirmedBody() {
  return (
    <View style={styles.body}>
      <View style={styles.checkOuter}>
        <View style={styles.checkInner}>
          <OrderConfirmedCheckIcon />
        </View>
      </View>

      <Text style={styles.title}>{MARKET_ORDER_CONFIRMED.title}</Text>
      <Text style={styles.subtitle}>{MARKET_ORDER_CONFIRMED.subtitle}</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{MARKET_ORDER_CONFIRMED.orderNumber}</Text>
      </View>

      <View style={styles.card}>
        {ORDER_CONFIRMED_DETAILS.map((item, index) => (
          <View key={item.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                {item.icon === 'truck' ? (
                  <OrderConfirmedTruckIcon color={item.iconColor} />
                ) : (
                  <OrderConfirmedCalendarIcon color={item.iconColor} />
                )}
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: c(32, 24),
    gap: NU.sectionGap,
  },
  checkOuter: {
    width: c(108, 92),
    height: c(108, 92),
    borderRadius: c(54, 46),
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: c(78, 66),
    height: c(78, 66),
    borderRadius: c(39, 33),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: c(28, 24),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: NU.cardTitle,
    lineHeight: c(24, 20),
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
  badge: {
    marginTop: c(4, 3),
    paddingVertical: c(8, 6),
    paddingHorizontal: NU.chipPadH,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  badgeText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  card: {
    marginTop: NU.rowGap,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: c(20, 16),
    padding: NU.cardPad,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.cardGap,
  },
  iconBox: {
    width: c(42, 36),
    height: c(42, 36),
    borderRadius: NU.cardRadiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: ORDER_CONFIRMED_TEAL,
  },
  rowSubtitle: {
    fontSize: NU.bodySm,
    color: ORDER_CONFIRMED_MUTED,
    marginTop: c(2, 1),
  },
  divider: {
    height: 1,
    backgroundColor: ORDER_CONFIRMED_TRACK,
    marginVertical: NU.cardPadSm,
  },
});
