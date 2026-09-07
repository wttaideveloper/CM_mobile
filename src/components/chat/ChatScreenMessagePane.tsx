import type { ComponentProps, RefObject } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { ChatComposer } from '@/components/chat/ChatComposer';
import { CHAT_COMPOSER_GAP, CHAT_INPUT_NATIVE_ID } from '@/components/chat/ChatKeyboardScrollView';
import { ChatLoadOlder } from '@/components/chat/ChatExtras';
import { ChatMessageItem } from '@/components/chat/ChatMessageItem';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { ChatMessageSkeletonList } from '@/components/ui/Skeleton';
import type { ChatMessage } from '@/constants/chat';
import {
  CHAT_SCREEN_PRIMARY,
  chatScreenStyles as styles,
} from '@/screens/chat/ChatScreen.styles';

type ChatScreenMessagePaneProps = {
  listRef: RefObject<FlatList<ChatMessage> | null>;
  listWrapStyle: ComponentProps<typeof Animated.View>['style'];
  listContentStyle: StyleProp<ViewStyle>;
  invertedMessages: ChatMessage[];
  isGroup: boolean;
  isLiveConversation: boolean;
  selectedEditMessageId: string | null;
  highlightedMessageId: string | null;
  editingMessageId: string | null;
  openingAttachmentId: string | null;
  hasOlder: boolean;
  loadingOlder: boolean;
  isLoadingMessages: boolean;
  showTypingIndicator: boolean;
  typingIndicatorName: string;
  isKeyboardOpen: boolean;
  bottomInset: number;
  inputDisabled: boolean;
  conversationIsClosed: boolean;
  mode: string;
  draft: string;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
  voice: ComponentProps<typeof ChatComposer>['voice'];
  onAttach: () => void;
  onCameraPress: () => void;
  focusRequestKey: number;
  onComposerRowLayout: (event: LayoutChangeEvent) => void;
  onDeleteMessage?: (messageId: string) => void;
  onImagePress: (uri: string) => void;
  onAttachmentPress: (message: ChatMessage) => void;
  onLongPressMessage: (message: ChatMessage) => void;
  onLoadOlder: () => void;
  onScrollToIndexFailed: (info: { index: number; averageItemLength: number }) => void;
};

/**
 * Presentational message list + composer shell for ChatScreen.
 * Behavior stays in ChatScreen — this file only renders the same layout.
 */
export function ChatScreenMessagePane({
  listRef,
  listWrapStyle,
  listContentStyle,
  invertedMessages,
  isGroup,
  isLiveConversation,
  selectedEditMessageId,
  highlightedMessageId,
  editingMessageId,
  openingAttachmentId,
  hasOlder,
  loadingOlder,
  isLoadingMessages,
  showTypingIndicator,
  typingIndicatorName,
  isKeyboardOpen,
  bottomInset,
  inputDisabled,
  conversationIsClosed,
  mode,
  draft,
  onChangeDraft,
  onSend,
  voice,
  onAttach,
  onCameraPress,
  focusRequestKey,
  onComposerRowLayout,
  onDeleteMessage,
  onImagePress,
  onAttachmentPress,
  onLongPressMessage,
  onLoadOlder,
  onScrollToIndexFailed,
}: ChatScreenMessagePaneProps) {
  return (
    <View style={styles.flex}>
      <Animated.View style={[styles.messageListWrap, listWrapStyle]}>
        <FlatList
          ref={listRef}
          inverted
          data={invertedMessages}
          extraData={invertedMessages.length}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessageItem
              message={item}
              isGroup={isGroup}
              onDeleteMessage={isLiveConversation ? onDeleteMessage : undefined}
              onImagePress={onImagePress}
              onAttachmentPress={(message) => onAttachmentPress(message)}
              openingAttachmentId={openingAttachmentId}
              onLongPressMessage={onLongPressMessage}
              selectedForEdit={
                selectedEditMessageId === item.id ||
                highlightedMessageId === item.id ||
                editingMessageId === item.id
              }
            />
          )}
          style={styles.messageList}
          contentContainerStyle={listContentStyle}
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          initialNumToRender={Math.min(invertedMessages.length, 30)}
          maxToRenderPerBatch={15}
          windowSize={11}
          onScrollToIndexFailed={onScrollToIndexFailed}
          ListFooterComponent={
            hasOlder ? (
              loadingOlder ? (
                <ActivityIndicator color={CHAT_SCREEN_PRIMARY} style={styles.loader} />
              ) : (
                <ChatLoadOlder onLoad={onLoadOlder} />
              )
            ) : null
          }
          ListEmptyComponent={
            !isLoadingMessages ? (
              <Text style={styles.emptyMessagesText}>No messages yet</Text>
            ) : null
          }
          ListHeaderComponent={
            isLoadingMessages ? (
              <ChatMessageSkeletonList />
            ) : showTypingIndicator ? (
              <ChatTypingIndicator name={typingIndicatorName} />
            ) : null
          }
        />
      </Animated.View>

      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: CHAT_COMPOSER_GAP,
        }}
      >
        <View
          style={[styles.composer, { paddingBottom: isKeyboardOpen ? 20 : bottomInset + 8 }]}
        >
          {inputDisabled ? (
            <View style={styles.composerDisabled}>
              <Text style={styles.composerDisabledText}>
                {isLiveConversation && conversationIsClosed
                  ? 'This chat is closed'
                  : mode === 'readonly'
                    ? 'Chat closed · Book again to start a new conversation'
                    : 'Message limit reached · Book this service to continue'}
              </Text>
            </View>
          ) : (
            <ChatComposer
              draft={draft}
              onChangeDraft={onChangeDraft}
              onSend={onSend}
              voice={voice}
              onAttach={onAttach}
              onCameraPress={onCameraPress}
              focusRequestKey={focusRequestKey}
              inputSessionKey={editingMessageId ?? 'compose'}
              inputNativeID={CHAT_INPUT_NATIVE_ID}
              onComposerRowLayout={onComposerRowLayout}
            />
          )}
        </View>
      </KeyboardStickyView>
    </View>
  );
}
