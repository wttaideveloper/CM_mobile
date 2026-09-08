import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
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
} from '@/components/market/marketListingData';
import type { MarketListingView } from '@/utils/marketListing.mapper';
import { c, NU } from '@/utils/newUiCompact';

type MarketListingBodyProps = {
  listing: MarketListingView;
};

export function MarketListingBody({ listing }: MarketListingBodyProps) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(listing.imageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [listing.imageUrl, listing.id]);

  return (
    <View>
      <View style={[styles.media, { backgroundColor: listing.mediaBg }]}>
        {showImage ? (
          <Image
            source={{ uri: listing.imageUrl! }}
            style={styles.mediaImage}
            contentFit="cover"
            transition={0}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <MarketBagIcon color={listing.mediaIcon} size={56} />
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
            <Text style={styles.kind}>{listing.kind}</Text>
            <Text style={styles.kindMeta}>{listing.kindMeta}</Text>
          </View>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{listing.price}</Text>
            <Text style={styles.priceMeta}>{listing.priceMeta}</Text>
          </View>
        </View>

        <Pressable
          style={styles.vendor}
          onPress={() =>
            router.push(
              listing.enterpriseId
                ? {
                    pathname: '/(main)/market/business-profile',
                    params: { id: listing.enterpriseId },
                  }
                : '/(main)/market/business-profile',
            )
          }
          accessibilityRole="button"
        >
          <View style={styles.vendorAvatar}>
            <Text style={styles.vendorInitials}>{listing.vendorInitials}</Text>
          </View>
          <View style={styles.vendorCopy}>
            <Text style={styles.vendorName}>{listing.vendorName}</Text>
            <Text style={styles.vendorMeta}>{listing.vendorMeta}</Text>
          </View>
          <ListingChevronIcon />
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        <MarketListingSections listing={listing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    height: c(230, 200),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaImage: {
    ...StyleSheet.absoluteFillObject,
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
    flexWrap: 'wrap',
  },
  kind: {
    fontSize: c(11, 10),
    fontWeight: '800',
    letterSpacing: 1.1,
    color: LISTING_GREEN,
  },
  kindMeta: {
    fontSize: c(12.5, 11.5),
    color: LISTING_MUTED,
  },
  title: {
    fontSize: c(26, 22),
    fontWeight: '800',
    color: LISTING_TEAL,
    letterSpacing: -0.4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: c(8, 6),
    flexWrap: 'wrap',
  },
  price: {
    fontSize: c(22, 19),
    fontWeight: '800',
    color: LISTING_TEAL,
  },
  priceMeta: {
    fontSize: c(13, 12),
    color: LISTING_SOFT,
  },
  vendor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.cardGap,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LISTING_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
  },
  vendorAvatar: {
    width: c(44, 40),
    height: c(44, 40),
    borderRadius: c(14, 12),
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorInitials: {
    fontSize: c(14, 13),
    fontWeight: '800',
    color: LISTING_GREEN,
  },
  vendorCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  vendorName: {
    fontSize: NU.link,
    fontWeight: '700',
    color: LISTING_TEAL,
  },
  vendorMeta: {
    fontSize: NU.bodySm,
    color: LISTING_MUTED,
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
