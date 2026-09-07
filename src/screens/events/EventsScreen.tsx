import { EmptyState } from '@/components/EmptyState';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { EventCard, FeaturedEventCard, matchesEventSearch } from '@/components/events/EventCards';
import {
  EVENT_FILTERS,
  filterEvents,
  getFeaturedEvent,
  getListEvents,
} from '@/constants/events';
import { useRouteSearchParam } from '@/hooks/useRouteSearchParam';
import { isFromSearchParam } from '@/utils/searchNavigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRIMARY, styles } from '@/screens/events/EventsScreen.styles';
import { isSmallDevice } from '@/utils/responsive';

export { EventCard } from '@/components/events/EventCards';

const LIST_GAP = isSmallDevice ? 10 : 12;

export function EventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routeSearch = useRouteSearchParam();
  const { fromSearch } = useLocalSearchParams<{ fromSearch?: string }>();
  const openedFromSearch = isFromSearchParam(fromSearch);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const featuredEvent = getFeaturedEvent();
  const filteredEvents = useMemo(() => {
    const byFilter = filterEvents(activeFilter);
    return byFilter.filter((event) => matchesEventSearch(event, routeSearch));
  }, [activeFilter, routeSearch]);
  const listEvents = useMemo(() => getListEvents(filteredEvents), [filteredEvents]);
  const showFeatured =
    featuredEvent &&
    (activeFilter === 'All' || filteredEvents.some((event) => event.id === featuredEvent.id));

  const listHeader = (
    <>
      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.titleRow}>
          {openedFromSearch ? (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.backBtn, pressed && styles.cardPressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color={PRIMARY} />
            </Pressable>
          ) : null}
          <Text style={styles.title}>Events</Text>
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {EVENT_FILTERS.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                accessibilityRole="button"
                accessibilityLabel={filter}
                accessibilityState={{ selected: isActive }}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {showFeatured && featuredEvent ? (
          <FeaturedEventCard event={featuredEvent} />
        ) : null}

        {listEvents.length > 0 ? (
          <Text style={styles.sectionTitle}>All Events</Text>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      {openedFromSearch ? (
        <>
          <AppStatusBar />
          <StatusBarFill />
        </>
      ) : null}
      <FlatList
        data={listEvents}
        keyExtractor={(item) => item.id}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={!showFeatured ? <EmptyState entity="events" /> : null}
        ItemSeparatorComponent={() => <View style={{ height: LIST_GAP }} />}
        renderItem={({ item }) => (
          <View style={styles.content}>
            <EventCard event={item} />
          </View>
        )}
      />
    </View>
  );
}
