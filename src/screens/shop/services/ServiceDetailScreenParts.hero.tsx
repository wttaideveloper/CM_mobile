import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import {
  AVATAR_SIZE,
  HERO_HEIGHT,
  PRIMARY,
  SCREEN_WIDTH,
  styles,
} from '@/screens/shop/services/ServiceDetailScreen.styles';

import type { ServiceViewModel } from '@/screens/shop/services/ServiceDetailScreenParts.types';

function ProviderAvatar({ initial }: { initial: string }) {
  return (
    <View style={styles.providerAvatar}>
      <Svg width={AVATAR_SIZE} height={AVATAR_SIZE} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="providerAvatarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F5D4E" />
            <Stop offset="1" stopColor="#3E7041" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          rx={12}
          fill="url(#providerAvatarGrad)"
        />
      </Svg>
      <Text style={styles.providerAvatarText}>{initial}</Text>
    </View>
  );
}

function HeroFadeOverlay({ width, height }: { width: number; height: number }) {
  const fadeHeight = Math.round(height * 0.5);

  return (
    <Svg
      width={width}
      height={fadeHeight}
      style={[styles.heroFade, { height: fadeHeight }]}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="serviceHeroFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.55} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={fadeHeight} fill="url(#serviceHeroFade)" />
    </Svg>
  );
}

export function ServiceDetailHero({
  service,
  onBack,
}: {
  service: ServiceViewModel;
  onBack: () => void;
}) {
  return (
    <View style={[styles.hero, { height: HERO_HEIGHT }]}>
      {service.image ? (
        <Image
          source={{ uri: service.image }}
          style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.heroPlaceholder, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]} />
      )}

      <HeroFadeOverlay width={SCREEN_WIDTH} height={HERO_HEIGHT} />

      <View style={styles.heroActions}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={22} color={PRIMARY} />
        </Pressable>
      </View>

      <View style={styles.heroOverlay}>
        {service.category !== 'NA' ? (
          <View style={styles.heroCategoryBadge}>
            <Text style={styles.heroCategoryText}>{service.category}</Text>
          </View>
        ) : null}
        <Text style={styles.heroTitle}>{service.name}</Text>
      </View>
    </View>
  );
}

export { ProviderAvatar };
