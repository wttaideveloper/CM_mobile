import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  GRADIENT_IDS,
  LEAFY_BUTTON_GRADIENT_COLORS,
} from '@/constants/gradients';

type LeafyGradientButtonProps = {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  disabled?: boolean;
};

export function LeafyGradientButton({
  onPress,
  children,
  style,
  borderRadius = 14,
  disabled = false,
}: LeafyGradientButtonProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setLayout({ width, height });
        }
      }}
      style={({ pressed }) => [
        styles.wrapper,
        { borderRadius },
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {layout.width > 0 && layout.height > 0 ? (
        <Svg
          width={layout.width}
          height={layout.height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id={GRADIENT_IDS.leafyButton} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={LEAFY_BUTTON_GRADIENT_COLORS[0]} />
              <Stop offset="0.5" stopColor={LEAFY_BUTTON_GRADIENT_COLORS[1]} />
              <Stop offset="1" stopColor={LEAFY_BUTTON_GRADIENT_COLORS[2]} />
            </LinearGradient>
          </Defs>
          <Rect
            width={layout.width}
            height={layout.height}
            rx={borderRadius}
            fill={`url(#${GRADIENT_IDS.leafyButton})`}
          />
        </Svg>
      ) : null}
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.55,
  },
});
