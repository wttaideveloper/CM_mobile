import type { ReactElement, ReactNode, RefObject } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { TrainingHeader } from '@/components/trainingsAndCourses/TrainingHeader';
import {
  TRAINING_BG,
  TRAINING_GREEN,
} from '@/components/trainingsAndCourses/trainingData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { c, NU } from '@/utils/newUiCompact';

type Props = {
  eyebrow: string;
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
  refreshControl?: ReactElement;
  /** Extra bottom space + keep focused inputs above the keyboard */
  keyboardAware?: boolean;
  scrollViewRef?: RefObject<ScrollView | null>;
  /** Stays fixed under the header (e.g. Udemy-style course video). */
  stickyBelowHeader?: ReactNode;
  /** Square bottom edge on the green header (no bottom radius). */
  flatBottom?: boolean;
  /** Track vertical content offset (for scroll-into-view after expand). */
  onScrollOffsetChange?: (y: number) => void;
  /**
   * Extra scroll content padding (e.g. live keyboard height) so focused
   * inputs near the bottom can scroll above the keyboard without enabling
   * iOS automaticallyAdjustKeyboardInsets (unsafe with sticky video).
   */
  keyboardBottomInset?: number;
  children: ReactNode;
};

export function TrainingScreenShell({
  eyebrow,
  title,
  rightLabel,
  onRightPress,
  refreshControl,
  keyboardAware = false,
  scrollViewRef,
  stickyBelowHeader,
  flatBottom = false,
  onScrollOffsetChange,
  keyboardBottomInset = 0,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const localScrollRef = useScrollToTopOnFocus();

  const assignRef = (node: ScrollView | null) => {
    localScrollRef.current = node;
    if (scrollViewRef) {
      scrollViewRef.current = node;
    }
  };

  const bottomPad =
    (keyboardAware
      ? Math.max(insets.bottom + c(88, 72), 48)
      : Math.max(insets.bottom + c(40, 32), 40)) +
    Math.max(0, keyboardBottomInset);

  const body = <View style={styles.body}>{children}</View>;
  const scrollProps = {
    style: styles.scroll,
    showsVerticalScrollIndicator: true,
    contentContainerStyle: [styles.content, { paddingBottom: bottomPad }],
    refreshControl,
    keyboardShouldPersistTaps: 'handled' as const,
    delayContentTouches: false,
    canCancelContentTouches: true,
    nestedScrollEnabled: true,
    bounces: true,
    alwaysBounceVertical: true,
    scrollEventThrottle: 16,
    directionalLockEnabled: true,
    // Only when this screen owns the keyboard (reviews/exam). On My Learning the
    // sticky expo-video view sits outside the ScrollView — iOS keyboard inset
    // resize kills AVPlayer and the app quits. Android ignores this prop.
    automaticallyAdjustKeyboardInsets: keyboardAware && Platform.OS === 'ios',
    onScroll: onScrollOffsetChange
      ? (event: { nativeEvent: { contentOffset: { y: number } } }) => {
          onScrollOffsetChange(event.nativeEvent.contentOffset.y);
        }
      : undefined,
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={TRAINING_GREEN} />
      <StatusBarFill lightColor={TRAINING_GREEN} darkColor={TRAINING_GREEN} />
      <View style={styles.flex}>
        <TrainingHeader
          eyebrow={eyebrow}
          title={title}
          rightLabel={rightLabel}
          onRightPress={onRightPress}
          flatBottom={flatBottom}
        />
        {stickyBelowHeader ? (
          <View style={styles.stickySlot}>{stickyBelowHeader}</View>
        ) : null}
        {keyboardAware ? (
          <KeyboardAwareScrollView
            ref={assignRef}
            {...scrollProps}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            bottomOffset={c(28, 22)}
            extraKeyboardSpace={c(72, 56)}
            enabled
          >
            {body}
          </KeyboardAwareScrollView>
        ) : (
          <ScrollView
            ref={assignRef}
            {...scrollProps}
            keyboardDismissMode={stickyBelowHeader ? 'none' : 'on-drag'}
          >
            {body}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TRAINING_BG,
  },
  flex: {
    flex: 1,
    minHeight: 0,
  },
  stickySlot: {
    zIndex: 30,
    elevation: 30,
    overflow: 'hidden',
    flexGrow: 0,
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    gap: 18,
  },
});
