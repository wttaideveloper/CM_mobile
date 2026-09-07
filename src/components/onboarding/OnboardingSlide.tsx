import { Image } from 'expo-image';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingIcon } from '@/components/onboarding/OnboardingIcons';
import { authTheme, colors } from '@/constants/authTheme';
import {
  ONBOARDING_IMAGE_HEIGHT,
  type OnboardingSlideData,
} from '@/constants/onboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type OnboardingSlideProps = {
  slide: OnboardingSlideData;
  slideIndex: number;
  totalSlides: number;
  isLast: boolean;
  onContinue: () => void;
  onSkip: () => void;
};

function ImageFadeOverlay({ height }: { height: number }) {
  return (
    <Svg width={SCREEN_WIDTH} height={height} style={styles.imageFade}>
      <Defs>
        <LinearGradient id="onboardingFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={SCREEN_WIDTH} height={height} fill="url(#onboardingFade)" />
    </Svg>
  );
}

function PaginationDots({ activeIndex, total }: { activeIndex: number; total: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, index) =>
        index === activeIndex ? (
          <View key={index} style={styles.activeDot} />
        ) : (
          <View key={index} style={styles.dot} />
        ),
      )}
    </View>
  );
}

export function OnboardingSlide({
  slide,
  slideIndex,
  totalSlides,
  isLast,
  onContinue,
  onSkip,
}: OnboardingSlideProps) {
  const insets = useSafeAreaInsets();
  const heroHeight = ONBOARDING_IMAGE_HEIGHT;

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.safeArea,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          },
        ]}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image
            source={{ uri: slide.imageUri }}
            style={[styles.heroImage, { height: heroHeight }]}
            contentFit="cover"
            transition={200}
          />
          <ImageFadeOverlay height={heroHeight} />
        </View>

        <View style={styles.contentSection}>
          <View style={styles.iconBox}>
            <OnboardingIcon name={slide.icon} />
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.body}</Text>

          <PaginationDots activeIndex={slideIndex} total={totalSlides} />

          <View style={styles.actions}>
            <Pressable
              style={styles.primaryButton}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'Get Started' : 'Continue'}
            >
              <Text style={styles.primaryButtonText}>
                {isLast ? 'Get Started' : 'Continue'}
              </Text>
            </Pressable>

            {!isLast && (
              <Pressable
                onPress={onSkip}
                style={styles.skipButton}
                accessibilityRole="button"
                accessibilityLabel="Skip for now"
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  hero: {
    width: SCREEN_WIDTH,
    backgroundColor: colors.brandLightGray,
  },
  heroImage: {
    width: '100%',
  },
  imageFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    color: colors.brandDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.brandGray,
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brandDarkGreen,
  },
  dot: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brandLightGray,
  },
  actions: {
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: '#1F5D4E',
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: authTheme.primaryButtonText.color,
    fontSize: 16,
    fontWeight: authTheme.primaryButtonText.fontWeight,
  },
  skipButton: {
    alignItems: 'center',
    paddingTop: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5A7A70',
  },
});
