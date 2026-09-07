import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BizProfileMonitorIcon } from '@/components/market/MarketBusinessProfileIcons';
import {
  MarketBagIcon,
  MarketBowlIcon,
  MarketUserIcon,
} from '@/components/market/MarketIcons';
import {
  MARKET_OFFERS_ALL,
  OFFER_LIST_BORDER,
  OFFER_LIST_FILTERS,
  OFFER_LIST_MUTED,
  OFFER_LIST_SOFT,
  OFFER_LIST_TEAL,
  type OfferListItem,
} from '@/components/market/marketOfferListData';
import { c, NU } from '@/utils/newUiCompact';

type MarketOfferListBodyProps = {
  filter: string;
  onFilterChange: (filter: string) => void;
};

function OfferGlyph({ item }: { item: OfferListItem }) {
  if (item.icon === 'bag') {
    return <MarketBagIcon color={item.iconColor} />;
  }
  if (item.icon === 'bowl') {
    return <MarketBowlIcon color={item.iconColor} size={30} />;
  }
  if (item.icon === 'monitor') {
    return <BizProfileMonitorIcon color={item.iconColor} size={30} />;
  }
  return <MarketUserIcon color={item.iconColor} />;
}

function chunkPairs(items: OfferListItem[]) {
  const rows: OfferListItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

export function MarketOfferListBody({
  filter,
  onFilterChange,
}: MarketOfferListBodyProps) {
  const router = useRouter();
  const offers = MARKET_OFFERS_ALL.filter((offer) => {
    if (filter === 'Products') return offer.kind === 'PRODUCT';
    if (filter === 'Services') return offer.kind === 'SERVICE';
    return true;
  });
  const rows = chunkPairs(offers);

  return (
    <View style={styles.body}>
      <View style={styles.filterBlock}>
        <Text style={styles.filterLabel}>Filter</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {OFFER_LIST_FILTERS.map((item) => {
            const active = item === filter;
            return (
              <Pressable
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onFilterChange(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row.map((item) => item.id).join('-')} style={styles.row}>
            {row.map((offer) => (
              <Pressable
                key={offer.id}
                style={styles.card}
                onPress={() =>
                  router.push(
                    offer.route === 'service'
                      ? {
                          pathname: '/(main)/market/service-detail',
                          params: { id: offer.id },
                        }
                      : '/(main)/market/listing',
                  )
                }
                accessibilityRole="button"
              >
                <View style={[styles.media, { backgroundColor: offer.mediaBg }]}>
                  <OfferGlyph item={offer} />
                </View>
                <View style={styles.copy}>
                  <Text
                    style={[
                      styles.kind,
                      {
                        color: offer.kindColor,
                        backgroundColor: offer.kindBg,
                      },
                    ]}
                  >
                    {offer.kind}
                  </Text>
                  <Text style={styles.title}>{offer.title}</Text>
                  <Text style={styles.vendor}>{offer.vendor}</Text>
                  <Text style={styles.price}>
                    {offer.price}
                    {offer.priceSuffix ? (
                      <Text style={styles.suffix}>{offer.priceSuffix}</Text>
                    ) : null}
                  </Text>
                </View>
              </Pressable>
            ))}
            {row.length === 1 ? <View style={styles.cardSpacer} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: NU.cardPad,
  },
  filterBlock: {
    gap: c(10, 8),
  },
  filterLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: OFFER_LIST_MUTED,
  },
  chips: {
    gap: c(8, 6),
  },
  chip: {
    paddingVertical: c(8, 6),
    paddingHorizontal: NU.rowGap,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: OFFER_LIST_BORDER,
  },
  chipActive: {
    backgroundColor: OFFER_LIST_TEAL,
    borderColor: OFFER_LIST_TEAL,
  },
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: OFFER_LIST_MUTED,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    gap: NU.cardGap,
  },
  row: {
    flexDirection: 'row',
    gap: NU.cardGap,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: OFFER_LIST_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  cardSpacer: {
    flex: 1,
  },
  media: {
    height: c(96, 84),
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    paddingTop: c(11, 9),
    paddingHorizontal: NU.cardPadXs,
    paddingBottom: c(13, 11),
    gap: c(4, 3),
  },
  kind: {
    fontSize: c(10.5, 10),
    fontWeight: '700',
    paddingVertical: c(2, 2),
    paddingHorizontal: c(6, 5),
    borderRadius: c(4, 3),
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: OFFER_LIST_TEAL,
    lineHeight: c(18, 16),
  },
  vendor: {
    fontSize: c(11.5, 10.5),
    color: OFFER_LIST_MUTED,
  },
  price: {
    marginTop: c(2, 1),
    fontSize: NU.link,
    fontWeight: '800',
    color: OFFER_LIST_TEAL,
  },
  suffix: {
    fontSize: NU.label,
    fontWeight: '500',
    color: OFFER_LIST_SOFT,
  },
});
