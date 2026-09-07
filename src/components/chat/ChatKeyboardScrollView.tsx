import React, { forwardRef } from 'react';
import { KeyboardChatScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ScrollViewProps } from 'react-native';
import type { KeyboardChatScrollViewProps } from 'react-native-keyboard-controller';

type Ref = React.ElementRef<typeof KeyboardChatScrollView>;

/** Visible gap between composer and keyboard / emoji panel. */
export const CHAT_COMPOSER_GAP = 10;

/** Small gap between last message and composer when keyboard is closed. */
export const CHAT_MESSAGE_COMPOSER_GAP = 8;

/** Baseline inner composer row height (input pill + padding). */
export const CHAT_COMPOSER_BASE_HEIGHT = 60;

export const CHAT_INPUT_NATIVE_ID = 'chat-message-input';

type Props = ScrollViewProps &
  KeyboardChatScrollViewProps & {
    /** Sticky composer height between the list bottom and the screen bottom. */
    bottomBarHeight?: number;
  };

/**
 * Scroll wrapper for chat FlatList — lifts messages above the keyboard
 * (non-inverted list, oldest → newest top to bottom).
 */
export const ChatKeyboardScrollView = forwardRef<Ref, Props>(
  ({ bottomBarHeight = 0, ...props }, ref) => {
    const { bottom } = useSafeAreaInsets();
    // Composer + safe area sit between the scroll view and the screen bottom.
    const offset = bottomBarHeight + Math.max(bottom, CHAT_COMPOSER_GAP);

    return (
      <KeyboardChatScrollView
        ref={ref}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="none"
        keyboardLiftBehavior="always"
        offset={offset}
        {...props}
      />
    );
  },
);

ChatKeyboardScrollView.displayName = 'ChatKeyboardScrollView';
