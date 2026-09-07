import { Image } from 'expo-image';
import {
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';

import {
  ChevronLeftIcon,
  HeartIcon,
  LucideStarIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import {
  EMPTY_STAR_COLOR,
  HERO_HEIGHT,
  PRIMARY,
  RATING_STAR_COLOR,
  SCREEN_WIDTH,
  styles,
} from '@/screens/shop/products/ProductDetailScreen.styles';

function ProductStarRating({ rating }: { rating: string }) {
  const value = Math.max(0, Math.min(5, Number.parseFloat(rating) || 0));
  const filledCount = Math.round(value);

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, index) =>
        index < filledCount ? (
          <StarIcon key={index} size={13} color={RATING_STAR_COLOR} />
        ) : (
          <LucideStarIcon key={index} size={13} color={EMPTY_STAR_COLOR} />
        ),
      )}
    </View>
  );
}

function ImagePagination({ count, activeIndex }: { count: number; activeIndex: number }) {
  return (
    <View style={styles.pagination}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === activeIndex ? styles.paginationDotActive : styles.paginationDotInactive,
          ]}
        />
      ))}
    </View>
  );
}

export function ProductDetailHero({
  carouselRef,
  carouselImages,
  activeImageIndex,
  onBack,
  onCarouselScroll,
}: {
  carouselRef: React.RefObject<ScrollViewType | null>;
  carouselImages: string[];
  activeImageIndex: number;
  onBack: () => void;
  onCarouselScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const showPagination = carouselImages.length > 1;

  return (
    <View style={[styles.hero, { height: HERO_HEIGHT }]}>
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onCarouselScroll}
        scrollEventThrottle={16}
      >
        {carouselImages.map((uri, index) => (
          <Image
            key={`${uri}-${index}`}
            source={{ uri }}
            style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
            contentFit="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.heroActions}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={20} color={PRIMARY} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save to favorites"
          style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <HeartIcon size={20} color={PRIMARY} />
        </Pressable>
      </View>

      {showPagination ? (
        <ImagePagination count={carouselImages.length} activeIndex={activeImageIndex} />
      ) : null}
    </View>
  );
}

export { ProductStarRating };
