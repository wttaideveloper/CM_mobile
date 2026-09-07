import type { Event } from '@/constants/events';
import { detailHref } from '@/utils/searchNavigation';
import {
  FEATURED_HEIGHT,
  H_PAD,
  SCREEN_WIDTH_EXPORT,
  styles,
} from '@/screens/events/EventsScreen.styles';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export function eventProgress(event: Event): number {
  if (!event.capacity) {
    return 0;
  }
  return Math.min(1, event.registered / event.capacity);
}

export function FeaturedEventCard({ event }: { event: Event }) {
  const router = useRouter();
  const cardWidth = SCREEN_WIDTH_EXPORT - H_PAD * 2;

  return (
    <Pressable
      onPress={() => router.push(detailHref('/(main)/event', event.id))}
      accessibilityRole="button"
      accessibilityLabel={event.name}
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
          accessibilityRole="button"
          accessibilityLabel="Register"
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
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${event.priceLabel}`}
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

export function matchesEventSearch(event: Event, query: string) {
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
