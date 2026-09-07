import { StyleSheet, Text, View } from 'react-native';

import {
  EVENT_DETAIL_BORDER,
  EVENT_DETAIL_MUTED,
  EVENT_DETAIL_TEAL,
  EVENT_DETAIL_TRACK,
  EVENT_HOST_SESSIONS,
} from '@/components/market/marketEventDetailData';
import { c, NU } from '@/utils/newUiCompact';

export function MarketEventDetailSessions() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Other sessions from this host</Text>
      <View style={styles.sessionsCard}>
        {EVENT_HOST_SESSIONS.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.sessionRow,
              index < EVENT_HOST_SESSIONS.length - 1 && styles.sessionBorder,
            ]}
          >
            <View style={[styles.sessionSide, { backgroundColor: item.sideBg }]}>
              <Text style={[styles.sessionTop, { color: item.sideTopColor }]}>
                {item.sideTop}
              </Text>
              <Text
                style={[styles.sessionBottom, { color: item.sideBottomColor }]}
              >
                {item.sideBottom}
              </Text>
            </View>
            <View style={styles.sessionCopy}>
              <Text style={styles.sessionTitle}>{item.title}</Text>
              <Text style={styles.sessionSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={[styles.sessionPrice, { color: item.priceColor }]}>
              {item.price}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: NU.cardGap,
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: EVENT_DETAIL_MUTED,
  },
  sessionsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: EVENT_DETAIL_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  sessionRow: {
    paddingVertical: c(13, 11),
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  sessionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: EVENT_DETAIL_TRACK,
  },
  sessionSide: {
    width: c(46, 40),
    borderRadius: c(11, 9),
    paddingVertical: c(6, 5),
    alignItems: 'center',
  },
  sessionTop: {
    fontSize: c(9.5, 8.5),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sessionBottom: {
    fontSize: NU.cardTitleLg,
    fontWeight: '800',
    lineHeight: c(18, 16),
  },
  sessionCopy: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: EVENT_DETAIL_TEAL,
  },
  sessionSubtitle: {
    fontSize: NU.bodySm,
    color: EVENT_DETAIL_MUTED,
    marginTop: c(2, 1),
  },
  sessionPrice: {
    fontSize: NU.link,
    fontWeight: '800',
  },
});
