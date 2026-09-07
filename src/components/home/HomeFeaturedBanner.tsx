import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
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
import { EVENTS } from '@/constants/events';

const featuredEvent = EVENTS[0];
const featuredBannerImage = featuredEvent.detailImage || featuredEvent.image;
const featuredDateLabel = featuredEvent.dateTime.split(' · ')[0] ?? featuredEvent.dateTime;

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

export function HomeFeaturedBanner() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(main)/event/${featuredEvent.id}`)}
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
