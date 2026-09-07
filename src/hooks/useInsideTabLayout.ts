import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Tab layout already renders a status-bar fill; offset nested screens under it. */
export function useInsideTabLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isInsideTabs = segments.some((segment) => segment === '(tabs)');

  return {
    isInsideTabs,
    topInset: insets.top,
    bottomInset: insets.bottom,
    screenOffsetStyle: isInsideTabs ? ({ marginTop: -insets.top } as const) : null,
  };
}

/** Hide bottom tab bar when Explore tab has pushed past its root list. */
export function isNestedExploreRoute(segments: string[]) {
  const exploreIndex = segments.indexOf('explore');
  if (exploreIndex === -1) {
    return false;
  }

  return segments.length > exploreIndex + 1;
}
