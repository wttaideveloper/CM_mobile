import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type HwiScoreRingProps = {
  score: number;
  size: number;
  strokeWidth: number;
  scoreFontSize: number;
  labelFontSize?: number;
  trackColor?: string;
  progressColor?: string;
  labelColor?: string;
};

export function HwiScoreRing({
  score,
  size,
  strokeWidth,
  scoreFontSize,
  labelFontSize = 10,
  trackColor = 'rgba(255,255,255,0.25)',
  progressColor = '#FFFFFF',
  labelColor = '#a1ffa7',
}: HwiScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.labelWrap} pointerEvents="none">
        <Text
          style={[
            styles.score,
            { fontSize: scoreFontSize, lineHeight: scoreFontSize + 2 },
          ]}
        >
          {Math.round(clamped)}
        </Text>
        <Text style={[styles.label, { fontSize: labelFontSize, color: labelColor }]}>
          HWI™
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  label: {
    fontWeight: '600',
  },
});
