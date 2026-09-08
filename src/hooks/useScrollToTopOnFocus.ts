import { useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';

/**
 * Resets a screen ScrollView to the top whenever the screen gains focus
 * (e.g. returning from Check-in → HWI should start at the header, not old offset).
 */
export function useScrollToTopOnFocus() {
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
    }, []),
  );

  return scrollRef;
}
