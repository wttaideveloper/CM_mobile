import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  ORDERS_BORDER,
  ORDERS_GREEN,
  ORDERS_MUTED,
  ORDERS_TEAL,
  ORDERS_TRACK,
  type OrdersTab,
} from '@/components/market/marketOrdersData';
// import { MY_ENROLLED_TRAININGS } from '@/components/trainingsAndCourses/trainingMyEnrollData'; // static samples hidden
import { c, NU } from '@/utils/newUiCompact';

/* Past orders helpers — tab removed for client build.
function PastOrderIcon({ order }: { order: PastOrder }) { ... }
function PastOrdersBody() { ... PAST_ORDERS ... }
function SubscriptionsBody() { ... }
*/

function TrainingsBody() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>My enrolled trainings</Text>
      <Text style={styles.helper}>
        Open My Learning from Market → My trainings for live enrolments.
      </Text>
      <Pressable
        onPress={() => router.push('/(main)/market/training-wishlist')}
        accessibilityRole="button"
      >
        <Text style={styles.wishlistLink}>Open wishlist ›</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/(main)/market/my-trainings')}
        accessibilityRole="button"
      >
        <Text style={styles.wishlistLink}>Open my enrolments ›</Text>
      </Pressable>

      {/* Static enrolment samples — hide for now (keep MY_ENROLLED_TRAININGS).
      {MY_ENROLLED_TRAININGS.map((item) => (
        ...
      ))}
      */}
    </View>
  );
}

export function MarketOrdersBody({ activeTab }: { activeTab: OrdersTab }) {
  return (
    <View style={styles.body}>
      {activeTab === 'Trainings and Courses' ? <TrainingsBody /> : null}
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ORDERS_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(28, 22),
    paddingHorizontal: c(18, 14),
    gap: c(8, 6),
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: ORDERS_TEAL,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: NU.body,
    lineHeight: c(20, 18),
    color: ORDERS_MUTED,
    textAlign: 'center',
  },
  helper: {
    marginTop: -c(4, 2),
    fontSize: c(12.5, 11.5),
    color: ORDERS_MUTED,
    lineHeight: c(18, 16),
  },
  wishlistLink: {
    fontSize: NU.link,
    fontWeight: '700',
    color: ORDERS_GREEN,
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ORDERS_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(13, 11),
  },
  trainingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ORDERS_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(8, 6),
  },
  trainingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modePill: {
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(5, 4),
  },
  modePillText: {
    fontSize: NU.label,
    fontWeight: '700',
  },
  enrollCode: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: ORDERS_MUTED,
  },
  attendCta: {
    fontSize: NU.link,
    fontWeight: '800',
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
    gap: c(10, 8),
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
