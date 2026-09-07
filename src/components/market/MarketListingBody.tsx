import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ListingChevronIcon } from '@/components/market/MarketListingIcons';
import { MarketListingSections } from '@/components/market/MarketListingSections';
import { MarketBagIcon } from '@/components/market/MarketIcons';
import {
  LISTING_BODY,
  LISTING_BORDER,
  LISTING_GREEN,
  LISTING_MUTED,
  LISTING_SOFT,
  LISTING_TEAL,
  MARKET_LISTING,
} from '@/components/market/marketListingData';
import { c, NU } from '@/utils/newUiCompact';

export function MarketListingBody() {
  const router = useRouter();

  return (
    <View>
      <View style={styles.media}>
        <MarketBagIcon color={MARKET_LISTING.mediaIcon} size={56} />
        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <View style={styles.kindRow}>
            <Text style={styles.kind}>{MARKET_LISTING.kind}</Text>
            <Text style={styles.kindMeta}>{MARKET_LISTING.kindMeta}</Text>
          </View>
          <Text style={styles.title}>{MARKET_LISTING.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{MARKET_LISTING.price}</Text>
            <Text style={styles.priceMeta}>{MARKET_LISTING.priceMeta}</Text>
          </View>
        </View>

        <Pressable
          style={styles.vendor}
          onPress={() => router.push('/(main)/market/business-profile')}
          accessibilityRole="button"
        >
          <View style={styles.vendorAvatar}>
            <Text style={styles.vendorInitials}>
              {MARKET_LISTING.vendorInitials}
            </Text>
          </View>
          <View style={styles.vendorCopy}>
            <Text style={styles.vendorName}>{MARKET_LISTING.vendorName}</Text>
            <Text style={styles.vendorMeta}>{MARKET_LISTING.vendorMeta}</Text>
          </View>
          <ListingChevronIcon />
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{MARKET_LISTING.description}</Text>
        </View>

        <MarketListingSections />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    height: c(230, 200),
    backgroundColor: MARKET_LISTING.mediaBg,
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
    backgroundColor: LISTING_GREEN,
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
    color: LISTING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: c(4, 3),
    overflow: 'hidden',
  },
  kindMeta: {
    fontSize: c(11.5, 10.5),
    color: LISTING_SOFT,
  },
  title: {
    fontSize: c(23, 20),
    fontWeight: '800',
    color: LISTING_TEAL,
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
    color: LISTING_TEAL,
  },
  priceMeta: {
    fontSize: NU.body,
    color: LISTING_MUTED,
  },
  vendor: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LISTING_BORDER,
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
    color: LISTING_GREEN,
  },
  vendorCopy: {
    flex: 1,
  },
  vendorName: {
    fontSize: NU.link,
    fontWeight: '700',
    color: LISTING_TEAL,
  },
  vendorMeta: {
    fontSize: NU.bodySm,
    color: LISTING_MUTED,
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
    color: LISTING_MUTED,
  },
  description: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
    color: LISTING_BODY,
  },
});
