import { StyleSheet, Text, View } from 'react-native';

import { MarketStarIcon } from '@/components/market/MarketIcons';
import {
  SERVICE_DETAIL_BORDER,
  SERVICE_DETAIL_MUTED,
  SERVICE_DETAIL_REVIEW,
  SERVICE_DETAIL_TEAL,
  type MarketServiceDetail,
} from '@/components/market/marketServiceDetailData';
import { c, NU } from '@/utils/newUiCompact';

type MarketServiceDetailSectionsProps = {
  service: MarketServiceDetail;
};

export function MarketServiceDetailSections({
  service,
}: MarketServiceDetailSectionsProps) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Details</Text>
        <View style={styles.detailsGrid}>
          {service.details.map((item) => (
            <View key={item.id} style={styles.detailCard}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.reviews}>
        <Text style={styles.sectionLabel}>Reviews</Text>
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View
              style={[
                styles.reviewAvatar,
                { backgroundColor: service.review.avatarBg },
              ]}
            >
              <Text
                style={[
                  styles.reviewInitials,
                  { color: service.review.avatarColor },
                ]}
              >
                {service.review.initials}
              </Text>
            </View>
            <Text style={styles.reviewName}>{service.review.name}</Text>
            <View style={styles.reviewRating}>
              <MarketStarIcon size={11} />
              <Text style={styles.reviewScore}>{service.review.rating}</Text>
            </View>
          </View>
          <Text style={styles.reviewBody}>{service.review.body}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: c(10, 8),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: SERVICE_DETAIL_MUTED,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: c(10, 8),
  },
  detailCard: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SERVICE_DETAIL_BORDER,
    borderRadius: c(13, 11),
    padding: NU.cardPadXs,
  },
  detailLabel: {
    fontSize: c(11.5, 10.5),
    color: SERVICE_DETAIL_MUTED,
  },
  detailValue: {
    fontSize: NU.link,
    fontWeight: '700',
    color: SERVICE_DETAIL_TEAL,
    marginTop: c(3, 2),
  },
  reviews: {
    gap: NU.cardGap,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SERVICE_DETAIL_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    gap: c(7, 5),
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(9, 7),
  },
  reviewAvatar: {
    width: c(32, 28),
    height: c(32, 28),
    borderRadius: c(16, 14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInitials: {
    fontSize: NU.bodySm,
    fontWeight: '700',
  },
  reviewName: {
    flex: 1,
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: SERVICE_DETAIL_TEAL,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(3, 2),
  },
  reviewScore: {
    fontSize: NU.bodySm,
    fontWeight: '700',
    color: '#c07c27',
  },
  reviewBody: {
    fontSize: c(13.5, 12.5),
    lineHeight: c(21, 19),
    color: SERVICE_DETAIL_REVIEW,
  },
});
