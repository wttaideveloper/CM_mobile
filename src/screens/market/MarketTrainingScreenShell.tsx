import type { ReactElement, ReactNode, RefObject } from 'react';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketTrainingHeader } from '@/components/market/MarketTrainingHeader';
import {
  TRAINING_BG,
  TRAINING_GREEN,
} from '@/components/market/marketTrainingData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { NU } from '@/utils/newUiCompact';

type Props = {
  eyebrow: string;
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
  refreshControl?: ReactElement;
  /** Extra bottom space + avoid keyboard covering inputs */
  keyboardAware?: boolean;
  scrollViewRef?: RefObject<ScrollView | null>;
  children: ReactNode;
};

export function MarketTrainingScreenShell({
  eyebrow,
  title,
  rightLabel,
  onRightPress,
  refreshControl,
  keyboardAware = false,
  scrollViewRef,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const localScrollRef = useScrollToTopOnFocus();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!keyboardAware) return;

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardAware]);

  const assignRef = (node: ScrollView | null) => {
    localScrollRef.current = node;
    if (scrollViewRef) {
      scrollViewRef.current = node;
    }
  };

  const bottomPad = keyboardAware
    ? Math.max(24, keyboardHeight + Math.max(insets.bottom, 12) + 24)
    : 24;

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={TRAINING_GREEN} />
      <StatusBarFill lightColor={TRAINING_GREEN} darkColor={TRAINING_GREEN} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={keyboardAware}
      >
        <ScrollView
          ref={assignRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={keyboardAware ? 'none' : 'on-drag'}
          automaticallyAdjustKeyboardInsets={keyboardAware && Platform.OS === 'ios'}
        >
          <MarketTrainingHeader
            eyebrow={eyebrow}
            title={title}
            rightLabel={rightLabel}
            onRightPress={onRightPress}
          />
          <View style={styles.body}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    gap: 18,
  },
});
