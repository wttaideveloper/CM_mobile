import { Platform, type ViewStyle } from 'react-native';

const SHADOW_COLOR = '#000000';

function iosShadow(offsetY: number, opacity: number, radius: number): ViewStyle {
  return {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}

/** Subtle card shadow — matches Android elevation 1 */
export const shadowSm: ViewStyle =
  Platform.select({
    ios: iosShadow(1, 0.04, 3),
    android: { elevation: 0.5 },
    default: {},
  }) ?? {};

/** Standard card shadow — matches Android elevation 2 */
export const shadowMd: ViewStyle =
  Platform.select({
    ios: iosShadow(2, 0.06, 4),
    android: { elevation: 2 },
    default: {},
  }) ?? {};

/** Raised card / FAB shadow — matches Android elevation 3 */
export const shadowLg: ViewStyle =
  Platform.select({
    ios: iosShadow(2, 0.12, 6),
    android: { elevation: 3 },
    default: {},
  }) ?? {};

/** Small control shadow — matches Android elevation 2, lighter on iOS */
export const shadowSoft: ViewStyle =
  Platform.select({
    ios: iosShadow(1, 0.05, 2),
    android: { elevation: 2 },
    default: {},
  }) ?? {};

/** Splash icon container */
export const shadowSplashIcon: ViewStyle =
  Platform.select({
    ios: iosShadow(10, 0.18, 20),
    android: { elevation: 0 },
    default: {},
  }) ?? {};
