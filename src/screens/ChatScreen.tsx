import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { CHAT_COMPOSER_BASE_HEIGHT, CHAT_COMPOSER_GAP, CHAT_INPUT_NATIVE_ID, CHAT_MESSAGE_COMPOSER_GAP } from '@/components/chat/ChatKeyboardScrollView';
import { ChatImageViewer } from '@/components/chat/ChatImageViewer';
import {
  ChatAiSummaryCard,
  ChatGroupMembers,
  ChatLiveBadge,
  ChatLoadOlder,
  ChatSearchPanel,
} from '@/components/chat/ChatExtras';
import { ChatMessageItem } from '@/components/chat/ChatMessageItem';
import {
  getMockConversation,
  type ChatMessage,
  type ChatMode,
} from '@/constants/chat';
import { API_CONFIG } from '@/config';
import { DEV_USER } from '@/constants/devUser';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useChatCamera } from '@/hooks/useChatCamera';
import { useConversationRoom } from '@/hooks/useConversationRoom';
import { useConversationTyping } from '@/hooks/useConversationTyping';
import { useRemoteTypingUsers } from '@/hooks/useRemoteTypingUsers';
import { useSocketTyping } from '@/hooks/useSocketTyping';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { SOCKET_SERVER_EVENTS } from '@/constants/socket.events';
import {
  markChatConversationAndMessagesRead,
  setActiveChatConversation,
  setActiveChatLatestIncomingMessageId,
} from '@/services/chatRead.service';
import {
  closeConversation,
  fetchConversationById,
  reopenConversation,
} from '@/services/conversation.service';
import { editMessage, fetchConversationMessages, deleteMessage } from '@/services/message.service';
import { getSocket, isSocketConnected } from '@/services/socket/socket.client';
import { markMessageReadViaSocket } from '@/services/socket/socket.typing.service';
import {
  sendMessageViaSocket,
  subscribeToNewMessageEvents,
} from '@/services/socket/socket.message.service';
import { useAuthStore } from '@/stores/auth.store';
import { uploadAndSendAttachmentMessage } from '@/services/attachments.service';
import type { Conversation } from '@/types/conversation.types';
import { isApiConversationId, isConversationClosed } from '@/utils/conversation';
import { chatMediaHref } from '@/utils/chatNavigation';
import { canCopyMessage, getCopyableMessageText } from '@/utils/chatMessage';
import { formatISTDateTime, parseApiDate } from '@/utils/dateTime';
import { mapApiMessageToChatMessage } from '@/utils/message.mapper';
import {
  hydrateChatMessagesFromApi,
  hydrateSingleChatMessageFromApi,
} from '@/utils/attachment.hydration';
import { openChatAttachment } from '@/utils/openChatAttachment';
import { inferChatAttachmentType } from '@/utils/attachmentType';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#E8F1EF';
const HEADER_BG = '#F6FAF9';
const COMPOSER_BG = '#EEF5F4';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const H_PAD = isSmallDevice ? 16 : 20;
const COMPOSER_PAD_TOP = 6;

function paramValue(value?: string | string[]): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function parseMode(value: string): ChatMode {
  if (value === 'full' || value === 'readonly') return value;
  return 'preview';
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={styles.typingDot} />
          <View style={[styles.typingDot, styles.typingDotMid]} />
          <View style={styles.typingDot} />
        </View>
        <Text style={styles.typingText}>{name} is typing...</Text>
      </View>
    </View>
  );
}

function ProviderAvatar({ initial, isGroup }: { initial: string; isGroup?: boolean }) {
  const size = isSmallDevice ? 36 : 40;

  if (isGroup) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#EAF4EC',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: PRIMARY,
        }}
      >
        <Ionicons name="people" size={isSmallDevice ? 18 : 20} color={PRIMARY} />
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: size / 2,
        overflow: 'hidden',
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="chatAvatarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F5D4E" />
            <Stop offset="1" stopColor="#3E7041" />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#chatAvatarGrad)" />
      </Svg>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

export function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    mode?: string;
    title?: string;
    provider?: string;
    enterprise?: string;
    members?: string;
  }>();

  const conversationId = paramValue(params.id);
  const mode = parseMode(paramValue(params.mode));
  const title = paramValue(params.title) || undefined;
  const provider = paramValue(params.provider) || undefined;
  const enterprise = paramValue(params.enterprise) || undefined;
  const membersParam = paramValue(params.members);
  const membersOverride = useMemo(
    () =>
      membersParam
        ? membersParam.split(',').map((name) => name.trim()).filter(Boolean)
        : undefined,
    [membersParam],
  );
  const isNewGroup = conversationId.startsWith('group-');
  const isLiveConversation = isApiConversationId(conversationId);

  const { meta, messages: initialMessages } = useMemo(
    () =>
      getMockConversation(conversationId, mode, {
        title,
        provider,
        enterprise,
        members: membersOverride,
      }),
    [conversationId, mode, title, provider, enterprise, membersOverride],
  );

  const groupSubtitle = useMemo(() => {
    if (!meta.isGroup) {
      return `${meta.enterprise} · ${meta.isOnline ? 'Online' : 'Offline'}`;
    }

    const others = meta.members.filter((name) => name !== 'You');
    if (others.length === 0) return 'Group · tap for info';
    if (others.length <= 2) return others.join(', ');
    return `${others.slice(0, 2).join(', ')} and ${others.length - 2} more`;
  }, [meta.enterprise, meta.isGroup, meta.isOnline, meta.members]);

  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    isLiveConversation ? [] : initialMessages,
  );
  const [apiConversation, setApiConversation] = useState<Conversation | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(isLiveConversation);
  const [isLoadingMessages, setIsLoadingMessages] = useState(isLiveConversation);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showTyping, setShowTyping] = useState(
    mode === 'full' && !isNewGroup && !isLiveConversation,
  );
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(meta.hasOlderMessages);
  const voiceRecorder = useVoiceRecorder();
  const { openCamera } = useChatCamera();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const messagesRef = useRef(messages);
  const [composerRowHeight, setComposerRowHeight] = useState(CHAT_COMPOSER_BASE_HEIGHT);
  const [viewerImageUri, setViewerImageUri] = useState<string | null>(null);
  const [openingAttachmentId, setOpeningAttachmentId] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    messagesRef.current = messages;

    if (!isLiveConversation) {
      setActiveChatLatestIncomingMessageId(null);
      return;
    }

    const latestIncoming = [...messages]
      .filter((message) => message.sender !== 'user' && message.messageType !== 'deleted')
      .at(-1);

    setActiveChatLatestIncomingMessageId(latestIncoming?.id ?? null);
  }, [isLiveConversation, messages]);

  useFocusEffect(
    useCallback(() => {
      if (!isLiveConversation) return undefined;

      setActiveChatConversation(conversationId);

      return () => {
        const latestIncoming = [...messagesRef.current]
          .filter((message) => message.sender !== 'user' && message.messageType !== 'deleted')
          .at(-1);

        void markChatConversationAndMessagesRead(conversationId, latestIncoming?.id);
        setActiveChatConversation(null);
        setActiveChatLatestIncomingMessageId(null);
      };
    }, [conversationId, isLiveConversation]),
  );

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /** Inverted FlatList expects newest-first — API/mock store oldest-first. */
  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const listWrapStyle = useAnimatedStyle(() => ({
    marginBottom: Math.abs(keyboardHeight.value),
  }));

  const listContentStyle = useMemo(
    () => [
      styles.messageListContent,
      {
        paddingTop:0
          // composerRowHeight + COMPOSER_PAD_TOP + Math.max(insets.bottom, 8) + CHAT_MESSAGE_COMPOSER_GAP,
      },
    ],
    [composerRowHeight, insets.bottom],
  );

  const handleComposerRowLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    if (nextHeight > 0) {
      setComposerRowHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    }
  }, []);

  const previewLimitReached = meta.mode === 'preview' && meta.previewUsed >= meta.previewLimit;
  const canSend = meta.mode === 'full' || (meta.mode === 'preview' && !previewLimitReached);
  const conversationIsClosed = isConversationClosed(apiConversation?.status ?? 'open');
  const inputDisabled =
    !canSend ||
    apiConversation?.is_read_only === true ||
    (isLiveConversation && conversationIsClosed);
  const showFullFeatures = meta.mode === 'full';

  const currentUserId = DEV_USER.user_id;

  const [selectedEditMessage, setSelectedEditMessage] = useState<ChatMessage | null>(null);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [composerFocusKey, setComposerFocusKey] = useState(0);

  const canEditSelectedMessage = Boolean(
    selectedEditMessage &&
      !editingMessageId &&
      isLiveConversation &&
      selectedEditMessage.sender === 'user' &&
      selectedEditMessage.messageType !== 'deleted' &&
      (selectedEditMessage.messageType === 'text' ||
        selectedEditMessage.messageType === 'markdown' ||
        !selectedEditMessage.messageType),
  );

  const canDeleteSelectedMessage = Boolean(
    selectedEditMessage &&
      !editingMessageId &&
      isLiveConversation &&
      selectedEditMessage.sender === 'user' &&
      selectedEditMessage.messageType !== 'deleted',
  );

  const canCopySelectedMessage = Boolean(
    selectedEditMessage &&
      !editingMessageId &&
      isLiveConversation &&
      canCopyMessage(selectedEditMessage),
  );

  const canShowMessageMenu =
    canEditSelectedMessage || canDeleteSelectedMessage || canCopySelectedMessage;

  const clearMessageSelection = useCallback(() => {
    setEditMenuOpen(false);
    setSelectedEditMessage(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setDraft('');
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    if (!selectedEditMessage || editingMessageId) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      clearMessageSelection();
      return true;
    });

    return () => subscription.remove();
  }, [clearMessageSelection, editingMessageId, selectedEditMessage]);

  useEffect(() => {
    if (!editingMessageId) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      cancelEdit();
      return true;
    });

    return () => subscription.remove();
  }, [cancelEdit, editingMessageId]);

  const otherUserId = useMemo(() => {
    if (!apiConversation || meta.isGroup) return null;
    const participants = Array.isArray(apiConversation.participants) ? apiConversation.participants : [];
    return participants.find((p) => p.user_id !== currentUserId)?.user_id ?? null;
  }, [apiConversation, currentUserId, meta.isGroup]);

  const {
    isOtherUserOnline,
    lastSeenAt,
    setIsOtherUserOnline,
    refreshOtherPresence,
  } = useChatPresence({
    otherUserId,
    enabled: isLiveConversation && !meta.isGroup,
    markSelfOnline: isLiveConversation,
  });

  const isProviderPresenceOnline =
    isLiveConversation && !meta.isGroup ? isOtherUserOnline : meta.isOnline;

  const typingGetEnabled = API_CONFIG.TYPING_GET_ENABLED && !API_CONFIG.SOCKET_ENABLED;
  const typingPutEnabled = API_CONFIG.TYPING_PUT_ENABLED && !API_CONFIG.SOCKET_ENABLED;
  const socketTypingEnabled = API_CONFIG.SOCKET_ENABLED;

  const { stopTyping } = useConversationTyping({
    conversationId,
    draft,
    enabled:
      (socketTypingEnabled || typingPutEnabled) && isLiveConversation && !inputDisabled && !editingMessageId,
    useSocket: socketTypingEnabled,
  });

  const { isAnyoneTyping: socketAnyoneTyping } = useSocketTyping({
    conversationId,
    currentUserId,
    enabled: socketTypingEnabled && isLiveConversation,
  });

  const { isAnyoneTyping: restAnyoneTyping } = useRemoteTypingUsers({
    conversationId,
    currentUserId,
    enabled: typingGetEnabled && isLiveConversation,
  });

  const isAnyoneTyping = socketTypingEnabled ? socketAnyoneTyping : restAnyoneTyping;

  useConversationRoom({
    conversationId,
    enabled: isLiveConversation,
  });

  const typingIndicatorName = useMemo(() => {
    if (!isLiveConversation) return meta.provider;

    const typingParticipant = apiConversation?.participants.find(
      (participant) => participant.user_id !== currentUserId,
    );

    if (typingParticipant?.role === 'provider') {
      return provider ?? meta.provider ?? 'Provider';
    }

    if (typingParticipant?.role) {
      return typingParticipant.role.charAt(0).toUpperCase() + typingParticipant.role.slice(1);
    }

    return provider ?? meta.provider ?? 'Someone';
  }, [
    apiConversation?.participants,
    currentUserId,
    isLiveConversation,
    meta.provider,
    provider,
  ]);

  const showTypingIndicator = isLiveConversation
    ? isAnyoneTyping
    : showTyping && meta.isOnline;

  const handleCloseToggle = useCallback(async () => {
    if (!isLiveConversation) return;

    setHeaderMenuOpen(false);
    const closing = !conversationIsClosed;

    try {
      const result = closing
        ? await closeConversation(conversationId)
        : await reopenConversation(conversationId);

      setApiConversation((prev) => (prev ? { ...prev, status: result.status } : prev));
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ Close/reopen failed:', error);
      }
      Alert.alert(
        closing ? 'Close failed' : 'Reopen failed',
        'Could not update this conversation. Please try again.',
      );
    }
  }, [conversationId, conversationIsClosed, isLiveConversation]);

  const headerTitle = apiConversation?.subject ?? (meta.isGroup ? meta.title : meta.provider);
  const headerSubtitle = useMemo(() => {
    if (!isLiveConversation) return groupSubtitle;

    const enterpriseLabel = enterprise ?? meta.enterprise;

    if (meta.isGroup) {
      return `${apiConversation?.status ?? 'loading'} · ${enterpriseLabel}`;
    }

    if (isOtherUserOnline) {
      return `Online · ${enterpriseLabel}`;
    }

    if (lastSeenAt) {
      const seen = parseApiDate(lastSeenAt);
      const seenLabel = Number.isNaN(seen.getTime())
        ? 'Offline'
        : `Last seen ${formatISTDateTime(seen)}`;
      return `${seenLabel} · ${enterpriseLabel}`;
    }

    return `Offline · ${enterpriseLabel}`;
  }, [
    apiConversation?.status,
    enterprise,
    groupSubtitle,
    isLiveConversation,
    isOtherUserOnline,
    lastSeenAt,
    meta.enterprise,
    meta.isGroup,
  ]);

  useEffect(() => {
    if (!isLiveConversation) return undefined;

    let cancelled = false;

    setIsLoadingConversation(true);
    void fetchConversationById(conversationId)
      .then((data) => {
        if (!cancelled) {
          setApiConversation(data);
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn('⚠️ Conversation details failed:', error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingConversation(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, isLiveConversation]);

  useEffect(() => {
    if (!isLiveConversation) {
      setMessages(initialMessages);
      setHasOlder(meta.hasOlderMessages);
      setNextCursor(null);
      setIsLoadingMessages(false);
      return undefined;
    }

    let cancelled = false;

    setMessages([]);
    setIsLoadingMessages(true);
    setHasOlder(false);
    setNextCursor(null);

    const currentUserId = DEV_USER.user_id;

    void fetchConversationMessages(conversationId, { limit: 50 })
      .then(async (response) => {
        if (cancelled) return;

        const hydrated = await hydrateChatMessagesFromApi(response.items, currentUserId);
        if (cancelled) return;
console.log("hydrated", hydrated); 
        setMessages(hydrated);
        setNextCursor(response.pagination.next_cursor);
        setHasOlder(response.pagination.has_more);

        if (API_CONFIG.SOCKET_ENABLED) {
          const unreadIncoming = response.items.filter(
            (message) =>
              message.sender_id !== currentUserId && 
              !message.is_deleted &&
              !message.read_by.includes(currentUserId),
          );
          const latestUnread = unreadIncoming.at(-1);

          if (latestUnread) {
            void markMessageReadViaSocket(latestUnread.id);
          }
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn('⚠️ Conversation messages failed:', error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, initialMessages, isLiveConversation, meta.hasOlderMessages]);

  useFocusEffect(
    useCallback(() => {
      if (!isLiveConversation) return undefined;
      if (!API_CONFIG.SOCKET_ENABLED) return undefined;

      const socket = getSocket();
      if (!socket) return undefined;

      const unsubscribeNewMessage = subscribeToNewMessageEvents((apiMessage) => {
        if (apiMessage.conversation_id !== conversationId) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === apiMessage.id)) return prev;
          if (
            apiMessage.attachment_id &&
            prev.some((m) => m.attachmentId === apiMessage.attachment_id)
          ) {
            return prev;
          }

          const mapped = mapApiMessageToChatMessage(apiMessage, currentUserId);
          const withoutPendingOptimistic =
            apiMessage.sender_id === currentUserId
              ? prev.filter(
                  (m) =>
                    !m.id.startsWith('socket-') ||
                    (m.text ?? '').trim() !== (apiMessage.content ?? '').trim(),
                )
              : prev;

          return [...withoutPendingOptimistic, mapped];
        });

        if (apiMessage.attachment_id && !apiMessage.is_deleted) {
          void hydrateSingleChatMessageFromApi(apiMessage, currentUserId)
            .then((hydrated) => {
              setMessages((prev) => prev.map((m) => (m.id === hydrated.id ? hydrated : m)));
            })
            .catch((error) => {
              if (__DEV__) {
                console.warn('[Attachment hydrate] Failed:', error);
              }
            });
        }

        // Mark received messages as read so the other party sees read status quickly.
        if (apiMessage.sender_id !== currentUserId && !apiMessage.is_deleted) {
          void markMessageReadViaSocket(apiMessage.id);
        }
      });

      const onMessageRead = (payload: unknown) => {
        if (__DEV__) {
          console.log('[mobile] message_read raw', payload);
        }

        if (!payload || typeof payload !== 'object') return;

        const obj = payload as Record<string, unknown>;
        const messageId =
          typeof obj.message_id === 'string'
            ? obj.message_id
            : typeof (obj as { message?: { id?: unknown } }).message?.id === 'string'
              ? (obj as { message?: { id?: unknown } }).message?.id
              : null;
        const userId = typeof obj.user_id === 'string' ? obj.user_id : null;

        if (!messageId || !userId) return;

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;

            // Only update read receipts for messages you sent (outgoing).
            // message_read payload user_id = who read the message.
            if (m.sender !== 'user') return m;
            if (userId === currentUserId) return m; // I'm the reader => don't affect my outgoing bubble.

            return { ...m, status: 'read' };
          }),
        );
      };

      const onConversationUpdated = (payload: unknown) => {
        if (!payload || typeof payload !== 'object') return;

        const obj = payload as Record<string, unknown>;
        const maybeConversation =
          obj.conversation ?? (obj as { data?: { conversation?: unknown } }).data?.conversation ?? obj;

        if (
          maybeConversation &&
          typeof maybeConversation === 'object' &&
          typeof (maybeConversation as { id?: unknown }).id === 'string'
        ) {
          // Socket payload may be partial (e.g. missing `participants`).
          // Keep existing `participants`/known fields when missing.
          setApiConversation((prev) => {
            if (!prev) return maybeConversation as Conversation;
            const partial = maybeConversation as Partial<Conversation>;
            return {
              ...prev,
              ...partial,
              participants: partial.participants ?? prev.participants,
            };
          });
        }
      };

      const onUserOnline = (payload: unknown) => {
        if (!payload || typeof payload !== 'object') return;
        const obj = payload as Record<string, unknown>;
        const userId = typeof obj.user_id === 'string' ? obj.user_id : null;
        if (!userId || userId !== otherUserId) return;
        setIsOtherUserOnline(true);
      };

      const onUserOffline = (payload: unknown) => {
        if (!payload || typeof payload !== 'object') return;
        const obj = payload as Record<string, unknown>;
        const userId = typeof obj.user_id === 'string' ? obj.user_id : null;
        if (!userId || userId !== otherUserId) return;
        setIsOtherUserOnline(false);
        void refreshOtherPresence();
      };

      const onSocketError = (payload: unknown) => {
        // Keep UI stable; just log socket validation/auth errors.
        if (__DEV__) {
          console.warn('[Socket ERROR event]', payload);
        }
      };

      socket.on(SOCKET_SERVER_EVENTS.MESSAGE_READ, onMessageRead);
      socket.on(SOCKET_SERVER_EVENTS.CONVERSATION_UPDATED, onConversationUpdated);
      socket.on(SOCKET_SERVER_EVENTS.USER_ONLINE, onUserOnline);
      socket.on(SOCKET_SERVER_EVENTS.USER_OFFLINE, onUserOffline);
      socket.on(SOCKET_SERVER_EVENTS.ERROR, onSocketError);

      return () => {
        unsubscribeNewMessage();
        socket.off(SOCKET_SERVER_EVENTS.MESSAGE_READ, onMessageRead);
        socket.off(SOCKET_SERVER_EVENTS.CONVERSATION_UPDATED, onConversationUpdated);
        socket.off(SOCKET_SERVER_EVENTS.USER_ONLINE, onUserOnline);
        socket.off(SOCKET_SERVER_EVENTS.USER_OFFLINE, onUserOffline);
        socket.off(SOCKET_SERVER_EVENTS.ERROR, onSocketError);
      };
    }, [conversationId, currentUserId, isLiveConversation, otherUserId, refreshOtherPresence]),
  );

  useEffect(() => {
    if (!isLiveConversation) return undefined;

    let cancelled = false;

    void markChatConversationAndMessagesRead(conversationId)
      .then(() => {
        if (!cancelled) {
          setApiConversation((prev) => (prev ? { ...prev, unread_count: 0 } : prev));
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn('⚠️ Mark conversation read failed:', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, isLiveConversation]);

  const scrollToMessage = useCallback(
    (messageId: string) => {
      const index = invertedMessages.findIndex((message) => message.id === messageId);
      if (index < 0) return;

      setHighlightedMessageId(messageId);
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    },
    [invertedMessages],
  );

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      listRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: false,
      });

      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 120);
    },
    [],
  );

  useEffect(() => {
    return () => {
      void voiceRecorder.cancelRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!viewerImageUri) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setViewerImageUri(null);
      return true;
    });

    return () => subscription.remove();
  }, [viewerImageUri]);

  const handleSendVoice = async () => {
    setSelectedEditMessage(null);
    const result = await voiceRecorder.finishRecording();
    if (!result) return;

    // For live conversations, upload and rely on the socket `new_message` event.
    if (isLiveConversation) {
      try {
        setIsSending(true);

        const fileName = `voice-${Date.now()}.m4a`;
        await uploadAndSendAttachmentMessage({
          conversationId,
          fileUri: result.uri,
          fileName,
          mimeType: 'audio/mp4',
          attachmentType: 'audio',
        });
      } catch (error) {
        if (__DEV__) console.warn('[Attachment upload] voice failed:', error);
        Alert.alert('Upload failed', 'Could not upload voice message.');
      } finally {
        setIsSending(false);
      }

      return;
    }

    // Preview / readonly: show local voice bubble immediately.
    setMessages((prev) => [
      ...prev,
      {
        id: `voice-${Date.now()}`,
        sender: 'user',
        timestamp: 'Just now',
        status: 'sent',
        messageType: 'voice',
        voice: {
          duration: result.durationLabel,
          transcript: 'Voice message',
          uri: result.uri,
        },
      },
    ]);
    setShowTyping(true);
  };

  const handleCameraPhoto = async () => {
    if (inputDisabled || isSending) return;
    setSelectedEditMessage(null);
    const photo = await openCamera();
    if (!photo) return;

    if (isLiveConversation) {
      try {
        setIsSending(true);
        await uploadAndSendAttachmentMessage({
          conversationId,
          fileUri: photo.uri,
          fileName: photo.fileName,
          mimeType: undefined,
          attachmentType: 'image',
        });
      } catch (error) {
        if (__DEV__) console.warn('[Attachment upload] image failed:', error);
        Alert.alert('Upload failed', 'Could not upload image.');
      } finally {
        setIsSending(false);
      }
      return;
    }

    // Preview / readonly: show local image bubble immediately.
    setMessages((prev) => [
      ...prev,
      {
        id: `photo-${Date.now()}`,
        sender: 'user',
        timestamp: 'Just now',
        status: 'sent',
        messageType: 'attachment',
        attachment: {
          type: 'image',
          name: photo.fileName,
          size: photo.fileSizeLabel,
          thumbnail: photo.uri,
          storage: 'S3',
        },
      },
    ]);
  };

  const handleAttachmentPress = useCallback(async (message: ChatMessage) => {
    const attachment = message.attachment;
    if (!attachment || (attachment.type !== 'pdf' && attachment.type !== 'word')) return;

    const openingKey = message.attachmentId ?? message.id;
    setOpeningAttachmentId(openingKey);

    try {
      await openChatAttachment({
        attachmentId: message.attachmentId,
        fileName: attachment.name,
        uri: attachment.uri,
        type: attachment.type,
      });
    } finally {
      setOpeningAttachmentId((current) => (current === openingKey ? null : current));
    }
  }, []);

  const handleDocumentPick = async () => {
    if (inputDisabled || isSending) return;
    setSelectedEditMessage(null);

    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const fileUri = asset.uri;
    const fileName = asset.name ?? `file-${Date.now()}`;
    const mimeType = asset.mimeType;
    const fileSizeLabel = typeof asset.size === 'number' ? `${Math.max(1, Math.round(asset.size / 1024))} KB` : '—';

    const attachmentTypeForBackend =
      mimeType?.startsWith('image/') ? 'image' : mimeType?.startsWith('audio/') ? 'audio' : mimeType?.startsWith('video/') ? 'video' : 'document';

    if (isLiveConversation) {
      try {
        setIsSending(true);
        await uploadAndSendAttachmentMessage({
          conversationId,
          fileUri,
          fileName,
          mimeType,
          attachmentType: attachmentTypeForBackend,
        });
      } catch (error) {
        if (__DEV__) console.warn('[Attachment upload] document failed:', error);
        Alert.alert('Upload failed', 'Could not upload attachment.');
      } finally {
        setIsSending(false);
      }
      return;
    }

    // Preview / readonly: add a local attachment bubble immediately.
    const attachmentTypeForUI = inferChatAttachmentType({
      fileName,
      mimeType: mimeType ?? '',
      attachmentType: attachmentTypeForBackend,
      messageType: attachmentTypeForBackend === 'document' ? 'document' : attachmentTypeForBackend,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}`,
        sender: 'user',
        timestamp: 'Just now',
        status: 'sent',
        messageType: 'attachment',
        attachment: {
          type: attachmentTypeForUI as any,
          name: fileName,
          size: fileSizeLabel,
          thumbnail: mimeType?.startsWith('image/') ? fileUri : undefined,
          storage: 'S3',
        },
      },
    ]);

  };

  const voiceControls = {
    state: voiceRecorder.state,
    startRecording: voiceRecorder.startRecording,
    togglePauseResume: voiceRecorder.togglePauseResume,
    togglePreviewPlayback: voiceRecorder.togglePreviewPlayback,
    cancelRecording: voiceRecorder.cancelRecording,
    finishRecording: handleSendVoice,
    formatTime: voiceRecorder.formatTime,
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || inputDisabled || isSending) return;

    if (editingMessageId && isLiveConversation) {
      try {
        stopTyping();
        setIsSending(true);

        const updated = await editMessage(editingMessageId, text);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === updated.id ? mapApiMessageToChatMessage(updated, currentUserId) : m,
          ),
        );

        setDraft('');
        setSelectedEditMessage(null);
        setEditingMessageId(null);
        setShowTyping(true);
      } catch (error) {
        if (__DEV__) console.warn('[Edit] Failed:', error);
        Alert.alert('Edit failed', 'Could not edit message. Please try again.');
        setDraft(text);
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (!isLiveConversation) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          text,
          sender: 'user',
          timestamp: 'Just now',
          status: 'sent',
          messageType: 'text',
        },
      ]);
      setDraft('');
      setShowTyping(true);
      return;
    }

    stopTyping();
    setDraft('');
    setIsSending(true);

    try {
      // const currentUserId = useAuthStore.getState().user?.id ?? DEV_USER.user_id;
      const currentUserId = DEV_USER.user_id;
      const sentMessage = await sendMessageViaSocket({
        content: text,
        conversation_id: conversationId,
        message_type: 'text',
      });

      const mapped = mapApiMessageToChatMessage(sentMessage, currentUserId);
      setMessages((prev) => {
        if (prev.some((m) => m.id === mapped.id)) return prev;
        return [...prev, mapped];
      });
    } catch (error) {
      setDraft(text);

      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not send message. Please try again.';

      Alert.alert('Send failed', message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!isLiveConversation) return;

    try {
      await deleteMessage(messageId);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                messageType: 'deleted',
                text: 'This message was deleted',
              }
            : message,
        ),
      );
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not delete message. Please try again.';

      Alert.alert('Delete failed', message);
    }
  };

  const copySelectedMessage = useCallback(async () => {
    if (!selectedEditMessage) return;

    const text = getCopyableMessageText(selectedEditMessage);
    if (!text) {
      Alert.alert('Copy', 'Nothing to copy for this message.');
      return;
    }

    try {
      await Clipboard.setStringAsync(text);
      clearMessageSelection();
    } catch (error) {
      if (__DEV__) {
        console.warn('[Copy] Failed:', error);
      }
      Alert.alert('Copy failed', 'Could not copy message. Please try again.');
    }
  }, [clearMessageSelection, selectedEditMessage]);

  const confirmDeleteSelectedMessage = () => {
    if (!selectedEditMessage) return;

    const messageId = selectedEditMessage.id;

    Alert.alert('Delete message', 'This message will be removed for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setEditMenuOpen(false);
          setSelectedEditMessage(null);
          void handleDeleteMessage(messageId);
        },
      },
    ]);
  };

  const openMessageMenu = (message: ChatMessage) => {
    if (!isLiveConversation || message.messageType === 'deleted') {
      return;
    }

    const isOwnMessage = message.sender === 'user';
    const hasMenuAction = isOwnMessage || canCopyMessage(message);
    if (!hasMenuAction) {
      return;
    }

    setSelectedEditMessage(message);
    setEditMenuOpen(true);
  };

  const beginInlineEdit = (message?: ChatMessage) => {
    const target = message ?? selectedEditMessage;
    if (!target) return;

    const text = target.text ?? '';
    const messageId = target.id;

    setEditMenuOpen(false);
    setSelectedEditMessage(null);
    setEditingMessageId(messageId);
    setDraft(text);

    requestAnimationFrame(() => {
      setComposerFocusKey((key) => key + 1);
    });
  };

  const handleLoadOlder = () => {
    if (isLiveConversation) {
      if (!nextCursor || loadingOlder) return;

      setLoadingOlder(true);
      const currentUserId = DEV_USER.user_id;

      void fetchConversationMessages(conversationId, { cursor: nextCursor, limit: 50 })
        .then(async (response) => {
          const olderMessages = await hydrateChatMessagesFromApi(response.items, currentUserId);

          setMessages((prev) => {
            const existingIds = new Set(prev.map((message) => message.id));
            const uniqueOlder = olderMessages.filter((message) => !existingIds.has(message.id));
            return [...uniqueOlder, ...prev];
          });
          setNextCursor(response.pagination.next_cursor);
          setHasOlder(response.pagination.has_more);
        })
        .catch((error) => {
          if (__DEV__) {
            console.warn('⚠️ Older messages failed:', error);
          }
        })
        .finally(() => {
          setLoadingOlder(false);
        });

      return;
    }

    setLoadingOlder(true);
    setTimeout(() => {
      setMessages((prev) => [
        {
          id: `older-${Date.now()}`,
          text: 'Older message loaded from history',
          sender: 'provider',
          timestamp: 'Last week',
          messageType: 'text',
        },
        ...prev,
      ]);
      setHasOlder(false);
      setLoadingOlder(false);
    }, 600);
  };

  const chatBody = (
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
            isGroup={meta.isGroup}
            onDeleteMessage={isLiveConversation ? handleDeleteMessage : undefined}
            onImagePress={setViewerImageUri}
            onAttachmentPress={(message) => void handleAttachmentPress(message)}
            openingAttachmentId={openingAttachmentId}
            onLongPressMessage={openMessageMenu}
            selectedForEdit={
              selectedEditMessage?.id === item.id ||
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
        onScrollToIndexFailed={handleScrollToIndexFailed}
        ListFooterComponent={
          hasOlder ? (
            loadingOlder ? (
              <ActivityIndicator color={PRIMARY} style={styles.loader} />
            ) : (
              <ChatLoadOlder onLoad={handleLoadOlder} />
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
            <View style={styles.initialLoader}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : showTypingIndicator ? (
            <TypingIndicator name={typingIndicatorName} />
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
          style={[styles.composer, { paddingBottom: isKeyboardOpen ? 20 : insets.bottom + 8 }]}
        >
          {inputDisabled ? (
            <View style={styles.composerDisabled}>
              <Text style={styles.composerDisabledText}>
                {isLiveConversation && conversationIsClosed
                  ? 'This chat is closed'
                  : meta.mode === 'readonly'
                    ? 'Chat closed · Book again to start a new conversation'
                    : 'Message limit reached · Book this service to continue'}
              </Text>
            </View>
          ) : (
            <ChatComposer
              draft={draft}
              onChangeDraft={setDraft}
              onSend={() => void handleSend()}
              voice={voiceControls}
              onAttach={() => void handleDocumentPick()}
              onCameraPress={() => void handleCameraPhoto()}
              focusRequestKey={composerFocusKey}
              inputSessionKey={editingMessageId ?? 'compose'}
              inputNativeID={CHAT_INPUT_NATIVE_ID}
              onComposerRowLayout={handleComposerRowLayout}
            />
          )}
        </View>
      </KeyboardStickyView>
    </View>
  );


  return (
    <View style={styles.screen}>
    <AppStatusBar />
    <StatusBarFill />
      <View style={[styles.header, { paddingTop: 12 }]}>
          <Pressable
            onPress={() => {
              if (editingMessageId) {
                cancelEdit();
                return;
              }
              if (selectedEditMessage) {
                clearMessageSelection();
                return;
              }
              setEditMenuOpen(false);
              setHeaderMenuOpen(false);
              setSelectedEditMessage(null);
              router.back();
            }}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={TEXT_BLACK} />
          </Pressable>

          <ProviderAvatar initial={meta.avatarInitial} isGroup={meta.isGroup} />

          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerTitle}
              </Text>     
              {isLoadingConversation ? (
                <ActivityIndicator size="small" color={PRIMARY} style={styles.headerLoader} />
              ) : !meta.isGroup ? (
                <ChatLiveBadge isOnline={isProviderPresenceOnline} />
              ) : null}
            </View>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {headerSubtitle}
            </Text>
          </View>

          <Pressable
            onPress={() => setShowSearch(!showSearch)}
            style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Ionicons name="search-outline" size={22} color={TEXT_BLACK} />
          </Pressable>

          {isLiveConversation ? (
            <Pressable
              style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
              hitSlop={8}
              onPress={() => setHeaderMenuOpen(true)}
            >
              <Ionicons name="ellipsis-vertical" size={22} color={TEXT_BLACK} />
            </Pressable>
          ) : meta.isGroup ? (
            <Pressable
              style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
              hitSlop={8}
            >
              <Ionicons name="ellipsis-vertical" size={22} color={TEXT_BLACK} />
            </Pressable>
          ) : canShowMessageMenu ? (
            <Pressable
              style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
              hitSlop={8}
              onPress={() => setEditMenuOpen(true)}
            >
              <Ionicons name="ellipsis-vertical" size={22} color={TEXT_BLACK} />
            </Pressable>
          ) : null}
        </View>

      <ChatSearchPanel
          visible={showSearch}
          conversationId={conversationId}
          enabled={isLiveConversation}
          onClose={() => setShowSearch(false)}
          onJumpToMessage={scrollToMessage}
      />
      {!isNewGroup && meta.isGroup ? <ChatGroupMembers members={meta.members} /> : null}

      {showFullFeatures && !isNewGroup ? <ChatAiSummaryCard /> : null}

      <View style={styles.flex}>{chatBody}</View>

      {headerMenuOpen && isLiveConversation ? (
        <Modal
          visible={headerMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setHeaderMenuOpen(false)}
        >
          <View style={styles.menuOverlay} pointerEvents="box-none">
            <Pressable style={styles.menuBackdrop} onPress={() => setHeaderMenuOpen(false)} />
            <View
              style={[
                styles.editDropdown,
                { top: insets.top + 52, right: H_PAD, zIndex: 20, elevation: 20 },
              ]}
            >
              <Pressable
                style={styles.editDropdownItem}
                onPress={() => {
                  setHeaderMenuOpen(false);
                  router.push(chatMediaHref(conversationId));
                }}
              >
                <Text style={styles.editDropdownItemText}>Media</Text>
              </Pressable>
              <Pressable style={styles.editDropdownItem} onPress={() => void handleCloseToggle()}>
                <Text style={styles.editDropdownItemText}>
                  {conversationIsClosed ? 'Reopen conversation' : 'Close conversation'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}

      {editMenuOpen && selectedEditMessage && canShowMessageMenu ? (
        <Modal
          visible={editMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setEditMenuOpen(false)}
        >
          <View style={styles.menuOverlay}>
            <Pressable style={styles.menuBackdrop} onPress={() => setEditMenuOpen(false)} />
            <View
              style={[
                styles.editDropdown,
                { top: insets.top + 52, right: H_PAD, zIndex: 10, elevation: 10 },
              ]}
            >
              {canEditSelectedMessage && selectedEditMessage ? (
                <Pressable
                  style={styles.editDropdownItem}
                  onPress={() => beginInlineEdit(selectedEditMessage)}
                >
                  <Text style={styles.editDropdownItemText}>Edit</Text>
                </Pressable>
              ) : null}
              {canCopySelectedMessage ? (
                <Pressable style={styles.editDropdownItem} onPress={() => void copySelectedMessage()}>
                  <Text style={styles.editDropdownItemText}>Copy</Text>
                </Pressable>
              ) : null}
              {canDeleteSelectedMessage ? (
                <Pressable
                  style={styles.editDropdownItem}
                  onPress={confirmDeleteSelectedMessage}
                >
                  <Text style={styles.editDropdownDeleteText}>Delete</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Modal>
      ) : null}

      {viewerImageUri ? (
        <ChatImageViewer uri={viewerImageUri} onClose={() => setViewerImageUri(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BODY_BG },
  flex: { flex: 1 },
  messageListWrap: {
    flex: 1,
    position: 'relative',
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 10 : 12,
    backgroundColor: HEADER_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    ...shadowSm,
  },
  backBtn: {
    // width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, minWidth: 0 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerLoader: { marginLeft: 2 },
  headerTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '800',
    color: TEXT_BLACK,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '500',
    color: TEXT_DESC,
    marginTop: 1,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '800', color: '#FFFFFF', fontSize: isSmallDevice ? 15 : 16, zIndex: 1 },
  messageList: { flex: 1, backgroundColor: BODY_BG },
  messageListContent: {
    paddingHorizontal: H_PAD,
    paddingVertical: isSmallDevice ? 8 : 12,
    gap: isSmallDevice ? 4 : 6,
  },
  loader: { marginVertical: 10 },
  initialLoader: { alignItems: 'center', paddingVertical: 10,marginBottom:"100%" },
  emptyMessagesText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  typingRow: { alignItems: 'flex-start', marginTop: 4 },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PAGE_BG,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  typingDots: { flexDirection: 'row', gap: 3 },
  typingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: TEXT_MUTED, opacity: 0.5 },
  typingDotMid: { opacity: 0.85 },
  typingText: { fontSize: 11, fontWeight: '600', color: TEXT_DESC },
  composer: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: COMPOSER_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    ...shadowSm,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  menuOverlay: {
    flex: 1,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  editDropdown: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 168,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  editDropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  editDropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  editDropdownDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  composerDisabled: {
    marginHorizontal: H_PAD - 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    padding: 12,
    alignItems: 'center',
  },
  composerDisabledText: { fontSize: 12, fontWeight: '600', color: TEXT_DESC, textAlign: 'center' },
  pressed: { opacity: 0.9 },
});

