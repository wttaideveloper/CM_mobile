import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ClockIcon,
  MapPinIcon,
} from '@/components/dashboard/DashboardIcons';
import {
  EVENT_FILTERS,
  filterEvents,
  type Event,
} from '@/constants/events';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const H_PAD = 20;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_IMAGE_HEIGHT = Math.round(((SCREEN_WIDTH - H_PAD * 2) * 170) / 375);

function EventCard({ event }: { event: Event }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(main)/event/${event.id}`)}
      style={({ pressed }) => [styles.eventCard, pressed && styles.cardPressed]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: event.image }}
          style={styles.eventImage}
          contentFit="cover"
        />
        <View style={styles.imageOverlay} />

        <View
          style={[
            styles.priceBadge,
            event.isFree && styles.priceBadgeFree,
          ]}
        >
          <Text
            style={[
              styles.priceBadgeText,
              event.isFree && styles.priceBadgeTextFree,
            ]}
          >
            {event.priceLabel}
          </Text>
        </View>

        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.name}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <ClockIcon size={14} color={TEXT_MUTED} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.dateTime}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPinIcon size={14} color={TEXT_MUTED} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.joinBtn, pressed && styles.joinBtnPressed]}
        >
          <Text style={styles.joinBtnText}>Join</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export function EventsScreen() {
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredEvents = useMemo(
    () => filterEvents(activeFilter),
    [activeFilter],
  );

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <Text style={styles.title}>Events</Text>

        <ScrollView
          horizontal
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

      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 24 },
        ]}
      >
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: BODY_BG,
    paddingHorizontal: H_PAD,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 32,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 12 :  16,
  },
  filtersScroll: {
    gap: isSmallDevice ? 6 :  8,
    paddingBottom: isSmallDevice ? 12 :  16,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 12 :  16,
    paddingVertical: isSmallDevice ? 4 :  6,
    borderRadius: 20,
    backgroundColor: MINT,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  filterChipTextActive: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 16 :  20,
    borderWidth: 1,
    borderColor: BORDER,
    ...shadowSm,
  },
  imageWrap: {
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: '#E8EDEA',
    borderTopLeftRadius: isSmallDevice ? 16 :  19,
    borderTopRightRadius: isSmallDevice ? 16 :  19,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  priceBadge: {
    position: 'absolute',
    top: isSmallDevice ? 12 :  14,
    right: isSmallDevice ? 12 :  14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: isSmallDevice ? 4 :  6,
    borderRadius: 20,
  },
  priceBadgeFree: {
    backgroundColor:  '#4caf50',
  },
  priceBadgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  priceBadgeTextFree: {
    color: '#FFFFFF',
  },
  eventTitle: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    fontSize: isSmallDevice ? 16 : 17,
    lineHeight: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: isSmallDevice ? 12 :  16,
    paddingVertical: isSmallDevice ? 12 :  14,
  },
  metaBlock: {
    flex: 1,
    minWidth: 0,
    gap: isSmallDevice ? 3 :  4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 6 :  8,
  },
  metaText: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '400',
    color: TEXT_MUTED,
  },
  joinBtn: {
    paddingHorizontal:  isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 4 : 6,
    borderRadius: 20,
    backgroundColor: isSmallDevice ? '#1f5d4e' : '#1f5d4e',
    flexShrink: isSmallDevice ? 0 : 0,
    flexGrow: isSmallDevice ? 0 : 0,
  },
  joinBtnPressed: {
    opacity: isSmallDevice ? 0.9 :  0.9,
  },
  joinBtnText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardPressed: {
    opacity: 0.92,
  },
});
