import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import {
  FEATURED_BANNER_HEIGHT,
  FEATURED_BANNER_WIDTH,
} from '@/components/home/homeData';
import { homePartsStyles as styles } from '@/components/home/homePartsStyles';
import { appColors } from '@/constants/designTokens';
import { useEvents } from '@/hooks/useEvents';
import { detailHref } from '@/utils/searchNavigation';

function BannerGradientOverlay() {
  return (
    <View style={styles.featuredOverlayWrap} pointerEvents="none">
      <Svg
        width={FEATURED_BANNER_WIDTH}
        height={FEATURED_BANNER_HEIGHT}
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgGradient id="homeFeaturedGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#1F5D4E" stopOpacity={0.85} />
            <Stop offset="1" stopColor="#1F5D4E" stopOpacity={0.4} />
          </SvgGradient>
        </Defs>
        <Rect
          width={FEATURED_BANNER_WIDTH}
          height={FEATURED_BANNER_HEIGHT}
          fill="url(#homeFeaturedGrad)"
        />
      </Svg>
    </View>
  );
}

/**
 * Featured event promo card. Sourced from the real Events API (the first
 * item of the published list stands in as "featured," same fallback rule
 * EventsScreen already uses — the backend has no explicit featured flag).
 * Not currently mounted anywhere in HomeScreen; kept correct against the
 * real API so it's safe to wire in later without another data-source fix.
 */
export function HomeFeaturedBanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: events, isLoading, isError } = useEvents();
  const featuredEvent = events?.[0];

  if (isLoading) {
    return (
      <View
        style={[
          styles.featuredBanner,
          { alignItems: 'center', justifyContent: 'center', backgroundColor: appColors.primaryLight },
        ]}
      >
        <ActivityIndicator color={appColors.primary} />
      </View>
    );
  }

  // No event to promote (none published, or the request failed) — a promo
  // banner with nothing to promote is simplest hidden, same as any other
  // "nothing to show" promo slot.
  if (isError || !featuredEvent) {
    return null;
  }

  const featuredBannerImage = featuredEvent.detailImage || featuredEvent.image;
  const featuredDateLabel = featuredEvent.dateTime.split(' · ')[0] ?? featuredEvent.dateTime;

  return (
    <Pressable
      onPress={() => router.push(detailHref('/(main)/event', featuredEvent.id))}
      style={({ pressed }) => [styles.featuredBanner, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Featured event, ${featuredEvent.name}`}
    >
      <Image
        source={{ uri: featuredBannerImage }}
        style={styles.featuredImage}
        contentFit="cover"
        contentPosition="center"
        cachePolicy="memory-disk"
        transition={200}
      />
      <BannerGradientOverlay />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTag}>{t('home.featuredThisWeek')}</Text>
        <Text style={styles.featuredTitle}>{featuredEvent.name}</Text>
        <Text style={styles.featuredMeta}>
          {featuredDateLabel} · {featuredEvent.location} · {featuredEvent.priceLabel}
        </Text>
      </View>
      <View style={styles.featuredJoinBtn}>
        <Text style={styles.featuredJoinText}>{t('home.join')}</Text>
      </View>
    </Pressable>
  );
}
