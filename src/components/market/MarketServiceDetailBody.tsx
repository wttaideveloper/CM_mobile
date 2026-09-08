import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BizProfileMonitorIcon } from '@/components/market/MarketBusinessProfileIcons';
import { ListingChevronIcon } from '@/components/market/MarketListingIcons';
import { MarketServiceDetailSections } from '@/components/market/MarketServiceDetailSections';
import {
  MarketBowlIcon,
  MarketUserIcon,
} from '@/components/market/MarketIcons';
import {
  SERVICE_DETAIL_BODY,
  SERVICE_DETAIL_BORDER,
  SERVICE_DETAIL_GREEN,
  SERVICE_DETAIL_MUTED,
  SERVICE_DETAIL_SOFT,
  SERVICE_DETAIL_TEAL,
  type MarketServiceDetail,
} from '@/components/market/marketServiceDetailData';
import { c, NU } from '@/utils/newUiCompact';

type MarketServiceDetailBodyProps = {
  service: MarketServiceDetail;
};

export function MarketServiceDetailBody({
  service,
}: MarketServiceDetailBodyProps) {
  const router = useRouter();

  return (
    <View>
      <View style={[styles.media, { backgroundColor: service.mediaBg }]}>
        {service.icon === 'bowl' ? (
          <MarketBowlIcon color={service.mediaIcon} size={56} />
        ) : service.icon === 'monitor' ? (
          <BizProfileMonitorIcon color={service.mediaIcon} size={56} />
        ) : (
          <MarketUserIcon color={service.mediaIcon} size={56} />
        )}
        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <View style={styles.kindRow}>
            <Text style={styles.kind}>{service.kind}</Text>
            <Text style={styles.kindMeta}>{service.kindMeta}</Text>
          </View>
          <Text style={styles.title}>{service.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{service.price}</Text>
            <Text style={styles.priceMeta}>{service.priceMeta}</Text>
          </View>
        </View>

        <Pressable
          style={styles.vendor}
          onPress={() =>
            router.push(
              service.enterpriseId
                ? {
                    pathname: '/(main)/market/business-profile',
                    params: { id: service.enterpriseId },
                  }
                : '/(main)/market/business-profile',
            )
          }
          accessibilityRole="button"
        >
          <View style={styles.vendorAvatar}>
            <Text style={styles.vendorInitials}>{service.vendorInitials}</Text>
          </View>
          <View style={styles.vendorCopy}>
            <Text style={styles.vendorName}>{service.vendorName}</Text>
            <Text style={styles.vendorMeta}>{service.vendorMeta}</Text>
          </View>
          <ListingChevronIcon />
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        <MarketServiceDetailSections service={service} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    height: c(230, 200),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: c(12, 10),
    flexDirection: 'row',
    gap: c(6, 5),
  },
  dotActive: {
    width: c(18, 14),
    height: c(5, 4),
    borderRadius: 99,
    backgroundColor: SERVICE_DETAIL_GREEN,
  },
  dot: {
    width: c(5, 4),
    height: c(5, 4),
    borderRadius: 99,
    backgroundColor: '#b9d5be',
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(20, 16),
  },
  titleBlock: {
    gap: c(8, 6),
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  kind: {
    fontSize: NU.label,
    fontWeight: '700',
    color: '#8352c0',
    backgroundColor: '#f2e9fb',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: c(4, 3),
    overflow: 'hidden',
  },
  kindMeta: {
    fontSize: c(11.5, 10.5),
    color: SERVICE_DETAIL_SOFT,
  },
  title: {
    fontSize: c(23, 20),
    fontWeight: '800',
    color: SERVICE_DETAIL_TEAL,
    letterSpacing: -0.4,
    lineHeight: c(28, 24),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: c(8, 6),
  },
  price: {
    fontSize: NU.title,
    fontWeight: '800',
    color: SERVICE_DETAIL_TEAL,
  },
  priceMeta: {
    fontSize: NU.body,
    color: SERVICE_DETAIL_MUTED,
  },
  vendor: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SERVICE_DETAIL_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(13, 11),
    paddingHorizontal: NU.cardPadSm,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  vendorAvatar: {
    width: c(44, 40),
    height: c(44, 40),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInitials: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: SERVICE_DETAIL_GREEN,
  },
  vendorCopy: {
    flex: 1,
  },
  vendorName: {
    fontSize: NU.link,
    fontWeight: '700',
    color: SERVICE_DETAIL_TEAL,
  },
  vendorMeta: {
    fontSize: NU.bodySm,
    color: SERVICE_DETAIL_MUTED,
    marginTop: c(2, 1),
  },
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
  description: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
    color: SERVICE_DETAIL_BODY,
  },
});
