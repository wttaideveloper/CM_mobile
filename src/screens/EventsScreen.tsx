import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { useRouteSearchParam } from '@/hooks/useRouteSearchParam';
import { isFromSearchParam } from '@/utils/searchNavigation';

import {
  EVENT_FILTERS,
  filterEvents,
  getFeaturedEvent,
  getListEvents,
  type Event,
} from '@/constants/events';
import { detailHref } from '@/utils/searchNavigation';
import { shadowMd, shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const ACCENT_GREEN = '#4CAF50';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#9CA3AF';
const TEXT_BLACK = '#111111';
const CHIP_INACTIVE_BG = '#F3F4F6';
const MINT = '#EAF4EC';
const PRICE_CHIP_PAID_BG = '#FEF3E2';
const PRICE_CHIP_PAID_TEXT = '#B45309';
const H_PAD = isSmallDevice ? 16 : 20;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_HEIGHT = Math.round(((SCREEN_WIDTH - H_PAD * 2) * (isSmallDevice ? 180 / 375 : 200 / 375)));
const LIST_IMAGE_SIZE = isSmallDevice ? 80 : 88;

function eventProgress(event: Event): number {
  if (!event.capacity) {
    return 0;
  }
  return Math.min(1, event.registered / event.capacity);
}

function FeaturedEventCard({ event }: { event: Event }) {
  const router = useRouter();
  const cardWidth = SCREEN_WIDTH - H_PAD * 2;

  return (
    <Pressable
      onPress={() => router.push(detailHref('/(main)/event', event.id))}
      style={({ pressed }) => [styles.featuredCard, pressed && styles.cardPressed]}
    >
      <Image source={{ uri: event.image }} style={styles.featuredImage} contentFit="cover" />

      <Svg
        width={cardWidth}
        height={FEATURED_HEIGHT}
        style={styles.featuredFade}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="featuredEventFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0} />
            <Stop offset="0.45" stopColor="#000000" stopOpacity={0.15} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.72} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={cardWidth} height={FEATURED_HEIGHT} fill="url(#featuredEventFade)" />
      </Svg>

      <View style={styles.featuredBadge}>
        <Text style={styles.featuredBadgeText}>FEATURED</Text>
      </View>

      <View style={styles.featuredPriceBadge}>
        <Text style={styles.featuredPriceText}>{event.priceLabel}</Text>
      </View>

      <View style={styles.featuredBottom}>
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {event.name}
          </Text>
          <Text style={styles.featuredMeta}>📅 {event.dateTime}</Text>
          <Text style={styles.featuredMeta}>📍 {event.location}</Text>
        </View>

        <Pressable
          onPress={() => router.push(detailHref('/(main)/event', event.id))}
          style={({ pressed }) => [styles.registerBtn, pressed && styles.cardPressed]}
        >
          <Text style={styles.registerBtnText}>Register →</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export function EventCard({
  event,
  fromSearch,
}: {
  event: Event;
  fromSearch?: boolean;
}) {
  const router = useRouter();
  const progress = eventProgress(event);

  return (
    <Pressable
      onPress={() => router.push(detailHref('/(main)/event', event.id, fromSearch))}
      style={({ pressed }) => [styles.listCard, pressed && styles.cardPressed]}
    >
      <View style={styles.listImageWrap}>
        <Image source={{ uri: event.image }} style={styles.listImage} contentFit="cover" />
      </View>

      <View style={styles.listBody}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle} numberOfLines={2}>
            {event.name}
          </Text>
          <View
            style={[
              styles.listPriceChip,
              event.isFree ? styles.listPriceChipFree : styles.listPriceChipPaid,
            ]}
          >
            <Text
              style={[
                styles.listPrice,
                event.isFree ? styles.listPriceFree : styles.listPricePaid,
              ]}
            >
              {event.priceLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.listMeta}>📅 {event.dateTime}</Text>
        <Text style={[styles.listMeta, styles.listMetaLast]}>📍 {event.location}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </Pressable>
  );
}

function matchesEventSearch(event: Event, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return [
    event.name,
    event.location,
    event.description,
    event.status,
    event.priceLabel,
    ...event.filterTags,
  ].some((value) => value.toLowerCase().includes(normalized));
}

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

  return (
    <View style={styles.screen}>
      {openedFromSearch ? (
        <>
          <AppStatusBar />
          <StatusBarFill />
        </>
      ) : null}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View style={[styles.topSection, { paddingTop: 12 }]}>
          <View style={styles.titleRow}>
            {openedFromSearch ? (
              <Pressable
                onPress={() => router.back()}
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
            <>
              <Text style={styles.sectionTitle}>All Events</Text>
              <View style={styles.list}>
                {listEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </View>
            </>
          ) : !showFeatured ? (
            <EmptyState entity="events" />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersScroll: {
    gap: isSmallDevice ? 8 : 10,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 8 : 9,
    borderRadius: 20,
    backgroundColor: CHIP_INACTIVE_BG,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    ...shadowSm,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '600',
    color: PRIMARY,
  },
  filterChipTextActive: {
    color: PAGE_BG,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: H_PAD,
  },
  featuredCard: {
    height: FEATURED_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    marginBottom: isSmallDevice ? 18 : 22,
    ...shadowMd,
  },
  featuredImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2A2A2A',
  },
  featuredFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredBadge: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 14,
    left: isSmallDevice ? 12 : 14,
    backgroundColor: ACCENT_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: PAGE_BG,
    letterSpacing: 0.6,
  },
  featuredPriceBadge: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 14,
    right: isSmallDevice ? 12 : 14,
    backgroundColor: PAGE_BG,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  featuredPriceText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  featuredBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingBottom: isSmallDevice ? 14 : 16,
    gap: 12,
  },
  featuredInfo: {
    flex: 1,
    minWidth: 0,
  },
  featuredTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    lineHeight: 22,
    fontWeight: '800',
    color: PAGE_BG,
    marginBottom: 6,
  },
  featuredMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 3,
  },
  registerBtn: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: 12,
    flexShrink: 0,
  },
  registerBtnText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  list: {
    gap: isSmallDevice ? 10 : 12,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: PAGE_BG,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadowSm,
  },
  listImageWrap: {
    width: LIST_IMAGE_SIZE,
    alignSelf: 'stretch',
    overflow: 'hidden',
    flexShrink: 0,
  },
  listImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: LIST_IMAGE_SIZE,
    backgroundColor: '#E8EDEA',
  },
  listBody: {
    flex: 1,
    minWidth: 0,
    minHeight: LIST_IMAGE_SIZE,
    justifyContent: 'space-between',
    paddingVertical: isSmallDevice ? 11 : 13,
    paddingHorizontal: isSmallDevice ? 11 : 13,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 5,
  },
  listTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  listPriceChip: {
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  listPriceChipFree: {
    backgroundColor: MINT,
  },
  listPriceChipPaid: {
    backgroundColor: PRICE_CHIP_PAID_BG,
  },
  listPrice: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 14,
    fontWeight: '800',
  },
  listPriceFree: {
    color: PRIMARY,
  },
  listPricePaid: {
    color: PRICE_CHIP_PAID_TEXT,
  },
  listMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  listMetaLast: {
    marginBottom: 0,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: 7,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  cardPressed: {
    opacity: 0.92,
  },
});
