import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  PROGRESS_GRADIENT_END,
  PROGRESS_GRADIENT_START,
  PROGRESS_HEIGHT,
  ORGANIZER_AVATAR_SIZE,
  styles,
} from '@/screens/events/EventDetailScreen.styles';

function InfoCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoEmoji}>{emoji}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function HeroFadeOverlay({ width, height }: { width: number; height: number }) {
  const fadeHeight = Math.round(height * 0.55);

  return (
    <Svg
      width={width}
      height={fadeHeight}
      style={[styles.heroFade, { height: fadeHeight }]}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="eventHeroFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.6} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={fadeHeight} fill="url(#eventHeroFade)" />
    </Svg>
  );
}

function GradientProgressBar({ percent }: { percent: number }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = Math.max(0, Math.round((trackWidth * percent) / 100));
  const radius = PROGRESS_HEIGHT / 2;

  return (
    <View
      style={styles.progressTrack}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      {fillWidth > 0 ? (
        <Svg width={fillWidth} height={PROGRESS_HEIGHT}>
          <Defs>
            <LinearGradient id="eventProgressGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={PROGRESS_GRADIENT_START} />
              <Stop offset="1" stopColor={PROGRESS_GRADIENT_END} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={fillWidth}
            height={PROGRESS_HEIGHT}
            rx={radius}
            fill="url(#eventProgressGrad)"
          />
        </Svg>
      ) : null}
    </View>
  );
}

function OrganizerAvatar({ initial }: { initial: string }) {
  return (
    <View style={styles.organizerAvatar}>
      <Svg
        width={ORGANIZER_AVATAR_SIZE}
        height={ORGANIZER_AVATAR_SIZE}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="organizerAvatarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F5D4E" />
            <Stop offset="1" stopColor="#3E7041" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={ORGANIZER_AVATAR_SIZE}
          height={ORGANIZER_AVATAR_SIZE}
          rx={10}
          fill="url(#organizerAvatarGrad)"
        />
      </Svg>
      <Text style={styles.organizerAvatarText}>{initial}</Text>
    </View>
  );
}

export {
  GradientProgressBar,
  HeroFadeOverlay,
  InfoCard,
  OrganizerAvatar,
};
