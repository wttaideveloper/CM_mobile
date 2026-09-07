import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  MarketBarbellIcon,
  MarketFlaskIcon,
  MarketHeartIcon,
  MarketSunIcon,
} from '@/components/market/MarketIcons';
import { MarketPillarListings } from '@/components/market/MarketPillarListings';
import {
  PILLAR_BORDER,
  PILLAR_BODY,
  PILLAR_FILTERS,
  PILLAR_MUTED,
  PILLAR_TEAL,
  type PillarBrowseContent,
} from '@/components/market/marketPillarData';
import { c, NU } from '@/utils/newUiCompact';

type MarketPillarBodyProps = {
  pillar: PillarBrowseContent;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
};

function PillarGlyph({
  icon,
  color,
  size = 28,
}: {
  icon: PillarBrowseContent['icon'];
  color: string;
  size?: number;
}) {
  const props = { color, size };
  switch (icon) {
    case 'heart':
      return <MarketHeartIcon {...props} />;
    case 'barbell':
      return <MarketBarbellIcon {...props} />;
    case 'sun':
      return <MarketSunIcon {...props} />;
    case 'flask':
      return <MarketFlaskIcon {...props} />;
  }
}

export function MarketPillarBody({
  pillar,
  activeFilter,
  onFilterChange,
}: MarketPillarBodyProps) {
  const showBiz = activeFilter === 'All' || activeFilter === 'Businesses';
  const showOffers =
    activeFilter === 'All' ||
    activeFilter === 'Products' ||
    activeFilter === 'Services';
  const showEvents = activeFilter === 'All' || activeFilter === 'Events';

  const offers = pillar.offers.filter((offer) => {
    if (activeFilter === 'Products') return offer.kind === 'PRODUCT';
    if (activeFilter === 'Services') return offer.kind === 'SERVICE';
    return true;
  });

  return (
    <View style={styles.body}>
      <View style={[styles.hero, { borderColor: pillar.bg }]}>
        <View style={[styles.heroIcon, { backgroundColor: pillar.bg }]}>
          <PillarGlyph icon={pillar.icon} color={pillar.color} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{pillar.title}</Text>
          <Text style={styles.heroTagline}>{pillar.tagline}</Text>
          <Text style={[styles.heroStats, { color: pillar.color }]}>
            {pillar.stats}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {PILLAR_FILTERS.map((filter) => {
          const active = filter === activeFilter;
          return (
            <Pressable
              key={filter}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onFilterChange(filter)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <MarketPillarListings
        pillar={pillar}
        showBiz={showBiz}
        showOffers={showOffers}
        showEvents={showEvents}
        offers={offers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(20, 16),
  },
  hero: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: c(18, 16),
    padding: NU.cardPad,
    flexDirection: 'row',
    gap: NU.rowGap,
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: c(58, 50),
    height: c(58, 50),
    borderRadius: NU.cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: c(6, 4),
  },
  heroTitle: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: PILLAR_TEAL,
  },
  heroTagline: {
    fontSize: c(13.5, 12.5),
    lineHeight: c(20, 18),
    color: PILLAR_BODY,
  },
  heroStats: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    marginTop: c(2, 1),
  },
  filters: {
    gap: c(8, 6),
    paddingRight: c(4, 3),
  },
  chip: {
    paddingVertical: c(8, 6),
    paddingHorizontal: NU.rowGap,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: PILLAR_BORDER,
  },
  chipActive: {
    backgroundColor: PILLAR_TEAL,
    borderColor: PILLAR_TEAL,
  },
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: PILLAR_MUTED,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
