import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  MarketBagIcon,
  MarketBowlIcon,
  MarketHeartIcon,
  MarketPulseIcon,
  MarketUserIcon,
} from '@/components/market/MarketIcons';
import {
  ACTIVE_PRODUCT_SUB,
  ACTIVE_SERVICE_SUB,
  ORDERS_BORDER,
  ORDERS_GREEN,
  ORDERS_MUTED,
  ORDERS_TEAL,
  ORDERS_TRACK,
  PAST_ORDERS,
  type PastOrder,
} from '@/components/market/marketOrdersData';
import { c, NU } from '@/utils/newUiCompact';

function PastOrderIcon({ order }: { order: PastOrder }) {
  const props = { color: order.iconColor, size: 19 };
  switch (order.icon) {
    case 'pulse':
      return <MarketPulseIcon {...props} />;
    case 'bowl':
      return <MarketBowlIcon {...props} />;
    case 'heart':
      return <MarketHeartIcon {...props} />;
  }
}

export function MarketOrdersBody() {
  const router = useRouter();

  return (
    <View style={styles.body}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Active subscriptions</Text>

        <View style={styles.subCard}>
          <View style={styles.subTop}>
            <View style={styles.subIconGreen}>
              <MarketBagIcon color={ORDERS_GREEN} size={22} />
            </View>
            <View style={styles.subCopy}>
              <Text style={styles.subTitle}>{ACTIVE_PRODUCT_SUB.title}</Text>
              <Text style={styles.subVendor}>{ACTIVE_PRODUCT_SUB.vendor}</Text>
            </View>
            <Text style={styles.activeBadge}>ACTIVE</Text>
          </View>

          <View style={styles.detailBox}>
            <View>
              <Text style={styles.detailLabel}>Next delivery</Text>
              <Text style={styles.detailValue}>
                {ACTIVE_PRODUCT_SUB.nextDelivery}
              </Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={styles.detailLabel}>Renews at</Text>
              <Text style={styles.detailValue}>{ACTIVE_PRODUCT_SUB.renewsAt}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} accessibilityRole="button">
              <Text style={styles.actionText}>Skip a week</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} accessibilityRole="button">
              <Text style={styles.actionText}>Manage</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.serviceCard}
          accessibilityRole="button"
          onPress={() => router.push('/(main)/market/course-learning')}
        >
          <View style={styles.subIconPurple}>
            <MarketUserIcon color="#8352c0" size={22} />
          </View>
          <View style={styles.serviceCopy}>
            <Text style={styles.subTitle}>{ACTIVE_SERVICE_SUB.title}</Text>
            <Text style={styles.subVendor}>{ACTIVE_SERVICE_SUB.vendorProgress}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${ACTIVE_SERVICE_SUB.progress}%` },
                ]}
              />
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Past orders</Text>
        <View style={styles.pastCard}>
          {PAST_ORDERS.map((order, index) => (
            <View
              key={order.id}
              style={[
                styles.pastRow,
                index < PAST_ORDERS.length - 1 && styles.pastRowBorder,
              ]}
            >
              <View style={[styles.pastIcon, { backgroundColor: order.iconBg }]}>
                <PastOrderIcon order={order} />
              </View>
              <View style={styles.pastCopy}>
                <Text style={styles.pastTitle}>{order.title}</Text>
                <Text style={styles.pastDetail}>{order.detail}</Text>
              </View>
              <View style={styles.pastRight}>
                <Text style={styles.pastPrice}>{order.price}</Text>
                <Text style={styles.pastAction}>{order.action}</Text>
              </View>
            </View>
          ))}
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
    gap: c(22, 18),
  },
  section: {
    gap: NU.cardGap,
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: ORDERS_MUTED,
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ORDERS_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(13, 11),
  },
  subTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.cardGap,
  },
  subIconGreen: {
    width: c(52, 44),
    height: c(52, 44),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subIconPurple: {
    width: c(52, 44),
    height: c(52, 44),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#f2e9fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCopy: {
    flex: 1,
  },
  subTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: ORDERS_TEAL,
  },
  subVendor: {
    marginTop: c(2, 1),
    fontSize: c(12.5, 11.5),
    color: ORDERS_MUTED,
  },
  activeBadge: {
    fontSize: NU.label,
    fontWeight: '700',
    color: ORDERS_GREEN,
    backgroundColor: '#e6f4e8',
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(5, 4),
    overflow: 'hidden',
  },
  detailBox: {
    backgroundColor: '#f5faf3',
    borderRadius: NU.cardRadiusSm,
    paddingVertical: c(11, 9),
    paddingHorizontal: c(13, 11),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: c(11.5, 10.5),
    color: ORDERS_MUTED,
  },
  detailValue: {
    marginTop: c(2, 1),
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: ORDERS_TEAL,
  },
  detailRight: {
    alignItems: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    gap: c(9, 7),
  },
  actionBtn: {
    flex: 1,
    paddingVertical: c(11, 9),
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#c8e0cc',
    alignItems: 'center',
  },
  actionText: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: ORDERS_TEAL,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ORDERS_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  serviceCopy: {
    flex: 1,
  },
  track: {
    marginTop: c(7, 5),
    height: c(5, 4),
    borderRadius: 99,
    backgroundColor: ORDERS_TRACK,
    overflow: 'hidden',
  },
  fill: {
    height: c(5, 4),
    borderRadius: 99,
    backgroundColor: '#8352c0',
  },
  pastCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ORDERS_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  pastRow: {
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  pastRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: ORDERS_TRACK,
  },
  pastIcon: {
    width: c(44, 38),
    height: c(44, 38),
    borderRadius: c(11, 9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastCopy: {
    flex: 1,
  },
  pastTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: ORDERS_TEAL,
  },
  pastDetail: {
    marginTop: c(2, 1),
    fontSize: NU.bodySm,
    color: ORDERS_MUTED,
  },
  pastRight: {
    alignItems: 'flex-end',
  },
  pastPrice: {
    fontSize: NU.link,
    fontWeight: '800',
    color: ORDERS_TEAL,
  },
  pastAction: {
    marginTop: c(2, 1),
    fontSize: c(11.5, 10.5),
    fontWeight: '600',
    color: ORDERS_GREEN,
  },
});
