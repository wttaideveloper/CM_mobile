import { useFocusEffect } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Light mode: white bar, black icons. Dark mode: black bar, white icons. */
export const STATUS_BAR_LIGHT_BG = '#FFFFFF';
export const STATUS_BAR_DARK_BG = '#000000';

type AppStatusBarProps = {
  /** Splash / full-screen dark only — keeps light status icons */
  variant?: 'auto' | 'light';
  backgroundColor?: string;
};

export function useStatusBarTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    backgroundColor: isDark ? STATUS_BAR_DARK_BG : STATUS_BAR_LIGHT_BG,
    style: (isDark ? 'light' : 'dark') as StatusBarStyle,
  };
}

export function AppStatusBar({
  variant = 'auto',
  backgroundColor,
}: AppStatusBarProps) {
  const theme = useStatusBarTheme();
  const style: StatusBarStyle = variant === 'light' ? 'light' : theme.style;
  const bg = backgroundColor ?? theme.backgroundColor;

  const applyNativeStatusBar = useCallback(() => {
    if (Platform.OS === 'android') {
      const isTransparent = bg === 'transparent';
      RNStatusBar.setTranslucent(isTransparent);
      RNStatusBar.setBackgroundColor(bg, true);
      RNStatusBar.setBarStyle(style === 'light' ? 'light-content' : 'dark-content', true);
    }
  }, [bg, style]);

  // Cold start (session restore → home) may not fire focus; apply on mount too.
  useEffect(() => {
    applyNativeStatusBar();
  }, [applyNativeStatusBar]);

  useFocusEffect(
    useCallback(() => {
      applyNativeStatusBar();
    }, [applyNativeStatusBar]),
  );

  return <StatusBar style={style} animated backgroundColor={bg} />;
}

export function StatusBarFill({
  lightColor,
  darkColor,
}: { lightColor?: string; darkColor?: string } = {}) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useStatusBarBackground(lightColor, darkColor);

  if (insets.top === 0) {
    return null;
  }

  return <View style={{ height: insets.top, backgroundColor }} />;
}

export function useStatusBarBackground(
  lightColor = STATUS_BAR_LIGHT_BG,
  darkColor = STATUS_BAR_DARK_BG,
) {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColor : lightColor;
}
