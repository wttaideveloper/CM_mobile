import { Image, type ImageContentFit } from 'expo-image';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

const SPRING = {
  damping: 20,
  stiffness: 220,
  mass: 0.7,
};

type ZoomableImageSurfaceProps = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
};

export function ZoomableImageSurface({
  uri,
  style,
  contentFit = 'contain',
}: ZoomableImageSurfaceProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetTransform = () => {
    'worklet';
    scale.value = withSpring(1, SPRING);
    savedScale.value = 1;
    translateX.value = withSpring(0, SPRING);
    translateY.value = withSpring(0, SPRING);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const nextScale = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    })
    .onEnd(() => {
      if (scale.value <= MIN_SCALE) {
        resetTransform();
        return;
      }
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (savedScale.value <= 1 && scale.value <= 1) return;
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      if (scale.value > 1.05) {
        resetTransform();
        return;
      }
      scale.value = withSpring(DOUBLE_TAP_SCALE, SPRING);
      savedScale.value = DOUBLE_TAP_SCALE;
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan)),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <Image source={{ uri }} style={styles.image} contentFit={contentFit} transition={120} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
