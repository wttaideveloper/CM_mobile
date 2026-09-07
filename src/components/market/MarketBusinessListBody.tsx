import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  MarketStarIcon,
  MarketVerifiedIcon,
} from '@/components/market/MarketIcons';
import {
  BIZ_LIST_BORDER,
  BIZ_LIST_MUTED,
  BIZ_LIST_SOFT,
  BIZ_LIST_SORTS,
  BIZ_LIST_TEAL,
  FEATURED_BUSINESSES_ALL,
} from '@/components/market/marketBusinessListData';
import { c, NU } from '@/utils/newUiCompact';

type MarketBusinessListBodyProps = {
  sort: string;
  onSortChange: (sort: string) => void;
};

function sortedBusinesses(sort: string) {
  const list = [...FEATURED_BUSINESSES_ALL];
  if (sort === 'Top rated') {
    return list.sort((a, b) => Number(b.rating) - Number(a.rating));
  }
  if (sort === 'Verified') {
    return list.sort((a, b) => Number(!!b.verified) - Number(!!a.verified));
  }
  // Closest — keep Online last, otherwise leave mock order
  return list.sort((a, b) => {
    const aOnline = a.meta === 'Online' ? 1 : 0;
    const bOnline = b.meta === 'Online' ? 1 : 0;
    if (aOnline !== bOnline) return aOnline - bOnline;
    return 0;
  });
}

export function MarketBusinessListBody({
  sort,
  onSortChange,
}: MarketBusinessListBodyProps) {
  const router = useRouter();
  const businesses = sortedBusinesses(sort);

  return (
    <View style={styles.body}>
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortChips}
        >
          {BIZ_LIST_SORTS.map((item) => {
            const active = item === sort;
            return (
              <Pressable
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onSortChange(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.list}>
        {businesses.map((biz) => (
          <Pressable
            key={biz.id}
            style={styles.card}
            onPress={() => router.push('/(main)/market/business-profile')}
            accessibilityRole="button"
          >
            <View style={[styles.avatar, { backgroundColor: biz.avatarBg }]}>
              <Text style={[styles.initials, { color: biz.avatarColor }]}>
                {biz.initials}
              </Text>
            </View>
            <View style={styles.copy}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{biz.name}</Text>
                {biz.verified ? <MarketVerifiedIcon /> : null}
              </View>
              <Text style={styles.subtitle}>{biz.subtitle}</Text>
              <View style={styles.meta}>
                <MarketStarIcon />
                <Text style={styles.rating}>{biz.rating}</Text>
                <Text style={styles.metaDot}>· {biz.reviews}</Text>
                <Text style={styles.metaDot}>· {biz.meta}</Text>
              </View>
            </View>
          </Pressable>
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
  sortRow: {
    gap: c(10, 8),
  },
  sortLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: BIZ_LIST_MUTED,
  },
  sortChips: {
    gap: c(8, 6),
  },
  chip: {
    paddingVertical: c(8, 6),
    paddingHorizontal: NU.rowGap,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BIZ_LIST_BORDER,
  },
  chipActive: {
    backgroundColor: BIZ_LIST_TEAL,
    borderColor: BIZ_LIST_TEAL,
  },
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: BIZ_LIST_MUTED,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    gap: NU.cardGap,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BIZ_LIST_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: c(13, 11),
    alignItems: 'center',
  },
  avatar: {
    width: c(56, 48),
    height: c(56, 48),
    borderRadius: NU.cardRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: c(19, 16),
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    gap: c(4, 3),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(7, 5),
  },
  name: {
    flexShrink: 1,
    fontSize: c(15.5, 14),
    fontWeight: '700',
    color: BIZ_LIST_TEAL,
  },
  subtitle: {
    fontSize: c(12.5, 11.5),
    color: BIZ_LIST_MUTED,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(4, 3),
    marginTop: c(2, 1),
  },
  rating: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: BIZ_LIST_TEAL,
  },
  metaDot: {
    fontSize: c(12.5, 11.5),
    color: BIZ_LIST_SOFT,
  },
});
