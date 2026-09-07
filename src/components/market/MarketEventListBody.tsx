import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  EVENT_LIST_BORDER,
  EVENT_LIST_FILTERS,
  EVENT_LIST_MUTED,
  EVENT_LIST_SOFT,
  EVENT_LIST_TEAL,
  MARKET_EVENTS_ALL,
} from '@/components/market/marketEventListData';
import { c, NU } from '@/utils/newUiCompact';

type MarketEventListBodyProps = {
  filter: string;
  onFilterChange: (filter: string) => void;
};

export function MarketEventListBody({
  filter,
  onFilterChange,
}: MarketEventListBodyProps) {
  const router = useRouter();
  const items = MARKET_EVENTS_ALL.filter((item) => {
    if (filter === 'Events') return item.kind === 'event';
    if (filter === 'Courses') return item.kind === 'course';
    return true;
  });

  return (
    <View style={styles.body}>
      <View style={styles.filterBlock}>
        <Text style={styles.filterLabel}>Filter</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {EVENT_LIST_FILTERS.map((item) => {
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

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() =>
              router.push(
                item.kind === 'course'
                  ? '/(main)/market/course-learning'
                  : '/(main)/market/event-detail',
              )
            }
            accessibilityRole="button"
          >
            <View style={[styles.side, { backgroundColor: item.sideBg }]}>
              <Text style={[styles.sideTop, { color: item.sideTopColor }]}>
                {item.sideTop}
              </Text>
              <Text style={[styles.sideBottom, { color: item.sideBottomColor }]}>
                {item.sideBottom}
              </Text>
            </View>
            <View style={styles.copy}>
              <View style={styles.badgeRow}>
                <Text
                  style={[
                    styles.badge,
                    {
                      color: item.badgeColor,
                      backgroundColor: item.badgeBg,
                    },
                  ]}
                >
                  {item.badge}
                </Text>
                <Text style={styles.when}>{item.when}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
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
  filterBlock: {
    gap: c(10, 8),
  },
  filterLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: EVENT_LIST_MUTED,
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
    borderColor: EVENT_LIST_BORDER,
  },
  chipActive: {
    backgroundColor: EVENT_LIST_TEAL,
    borderColor: EVENT_LIST_TEAL,
  },
  chipText: {
    fontSize: NU.chipFont,
    fontWeight: '600',
    color: EVENT_LIST_MUTED,
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
    borderColor: EVENT_LIST_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: c(13, 11),
    alignItems: 'center',
  },
  side: {
    width: c(58, 50),
    borderRadius: c(13, 11),
    paddingVertical: NU.chipPadV,
    alignItems: 'center',
  },
  sideTop: {
    fontSize: c(10.5, 10),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sideBottom: {
    fontSize: c(21, 18),
    fontWeight: '800',
    lineHeight: c(24, 20),
  },
  copy: {
    flex: 1,
    gap: c(4, 3),
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(7, 5),
    flexWrap: 'wrap',
  },
  badge: {
    paddingVertical: c(3, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: c(4, 3),
    overflow: 'hidden',
    fontSize: NU.label,
    fontWeight: '700',
  },
  when: {
    fontSize: c(11.5, 10.5),
    color: EVENT_LIST_SOFT,
  },
  title: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: EVENT_LIST_TEAL,
  },
  detail: {
    fontSize: c(12.5, 11.5),
    color: EVENT_LIST_MUTED,
  },
});
