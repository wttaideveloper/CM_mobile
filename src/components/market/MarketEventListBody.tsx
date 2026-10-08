import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import {
  EVENT_LIST_BORDER,
  EVENT_LIST_FILTERS,
  EVENT_LIST_MUTED,
  EVENT_LIST_SOFT,
  EVENT_LIST_TEAL,
  MARKET_EVENTS_ALL,
  type EventListItem,
} from '@/components/market/marketEventListData';
import { appColors } from '@/constants/designTokens';
import type { Event } from '@/constants/events';
import { useEvents } from '@/hooks/useEvents';
import { IST_TIMEZONE } from '@/utils/dateTime';
import { detailHref } from '@/utils/searchNavigation';
import { c, NU } from '@/utils/newUiCompact';

type MarketEventListBodyProps = {
  filter: string;
  onFilterChange: (filter: string) => void;
};

/**
 * Real Event -> this list's existing teaser-card shape (id/badge/side-badge/
 * when/title/detail) so the card UI stays exactly the same; only the
 * "Events" rows' data source changes, from the static mock array to the
 * real Events API.
 */
function toEventListItem(event: Event): EventListItem {
  const monthDay = event.startDate
    ? {
        top: event.startDate
          .toLocaleDateString('en-IN', { timeZone: IST_TIMEZONE, month: 'short' })
          .toUpperCase(),
        bottom: event.startDate.toLocaleDateString('en-IN', {
          timeZone: IST_TIMEZONE,
          day: 'numeric',
        }),
      }
    : { top: '', bottom: '—' };

  return {
    id: event.id,
    kind: 'event',
    badge: event.isFree ? 'FREE EVENT' : 'EVENT',
    badgeColor: event.isFree ? '#257d3f' : '#3c63c8',
    badgeBg: event.isFree ? '#e6f4e8' : '#eaf1ff',
    when: event.dateTime,
    title: event.name,
    detail: event.location || event.deliveryModeLabel || event.priceLabel,
    sideTop: monthDay.top,
    sideBottom: monthDay.bottom,
    sideBg: event.isFree ? '#e6f4e8' : '#eaf1ff',
    sideTopColor: event.isFree ? '#4d8a5c' : '#3c63c8',
    sideBottomColor: event.isFree ? '#257d3f' : '#3c63c8',
  };
}

export function MarketEventListBody({
  filter,
  onFilterChange,
}: MarketEventListBodyProps) {
  const router = useRouter();
  const { data: apiEvents, isLoading, isError, refetch } = useEvents();

  const courseItems: typeof MARKET_EVENTS_ALL = [];
  // Static course rows from MARKET_EVENTS_ALL — hide for now (keep data file).
  // const courseItems = MARKET_EVENTS_ALL.filter((item) => item.kind === 'course');
  const eventItems = (apiEvents ?? []).map(toEventListItem);

  const items =
    filter === 'Events' ? eventItems : filter === 'Courses' ? courseItems : [...eventItems, ...courseItems];

  const showEventsLoading = filter !== 'Courses' && isLoading;
  const showEventsError = filter !== 'Courses' && isError && eventItems.length === 0;

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
                accessibilityRole="button"
                accessibilityLabel={`Filter: ${item}`}
                accessibilityState={{ selected: active }}
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
        {showEventsLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={appColors.primary} />
          </View>
        ) : null}

        {showEventsError ? (
          <EmptyState
            variant="error"
            entity="events"
            compact
            onAction={() => void refetch()}
          />
        ) : null}

        {!showEventsLoading && !showEventsError && items.length === 0 ? (
          <EmptyState
            entity={filter === 'Courses' ? 'courses' : filter === 'Events' ? 'events' : 'events or courses'}
            compact
          />
        ) : null}

        {items.map((item) => (
          <Pressable
            key={`${item.kind}-${item.id}`}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
              router.push(
                item.kind === 'course'
                  ? '/(main)/market/course-learning'
                  : detailHref('/(main)/event', item.id),
              )
            }
            accessibilityRole="button"
            accessibilityLabel={`${item.badge}, ${item.title}, ${item.when}, ${item.detail}`}
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
  stateBox: {
    paddingVertical: c(20, 16),
    alignItems: 'center',
  },
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
  cardPressed: {
    opacity: 0.85,
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
