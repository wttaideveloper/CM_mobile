import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import {
  Alert,
  BackHandler,
  FlatList,
  Keyboard,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import {
  ChatConversationMenu,
  ChatMessageActionMenu,
} from '@/components/chat/ChatDropdownMenus';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { CHAT_COMPOSER_BASE_HEIGHT } from '@/components/chat/ChatKeyboardScrollView';
import { ChatImageViewer } from '@/components/chat/ChatImageViewer';
import {
  ChatAiSummaryCard,
  ChatGroupMembers,
  ChatSearchPanel,
} from '@/components/chat/ChatExtras';
import { ChatScreenMessagePane } from '@/components/chat/ChatScreenMessagePane';
import {
  getMockConversation,
  type ChatMessage,
} from '@/constants/chat';
import { API_CONFIG } from '@/config';
import { DEV_USER } from '@/constants/devUser';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useChatCamera } from '@/hooks/useChatCamera';
import { useChatScreenRealtime } from '@/hooks/useChatScreenRealtime';
import { useConversationRoom } from '@/hooks/useConversationRoom';
import { useConversationTyping } from '@/hooks/useConversationTyping';
import { useRemoteTypingUsers } from '@/hooks/useRemoteTypingUsers';
import { useSocketTyping } from '@/hooks/useSocketTyping';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
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
import { markMessageReadViaSocket } from '@/services/socket/socket.typing.service';
import {
  sendMessageViaSocket,
} from '@/services/socket/socket.message.service';
import { uploadAndSendAttachmentMessage } from '@/services/attachments.service';
import type { Conversation } from '@/types/conversation.types';
import { isApiConversationId, isConversationClosed } from '@/utils/conversation';
import { chatMediaHref } from '@/utils/chatNavigation';
import { paramValue, parseMode } from '@/utils/chatRouteParams';
import { canCopyMessage, canDownloadAttachment, getCopyableMessageText } from '@/utils/chatMessage';
import { formatISTDateTime, parseApiDate } from '@/utils/dateTime';
import { mapApiMessageToChatMessage } from '@/utils/message.mapper';
import {
  hydrateChatMessagesFromApi,
} from '@/utils/attachment.hydration';
import { openChatAttachment, saveChatAttachmentToDevice } from '@/utils/openChatAttachment';
import { inferChatAttachmentType } from '@/utils/attachmentType';
import {
  chatScreenStyles as styles,
} from '@/screens/chat/ChatScreen.styles';

const COMPOSER_PAD_TOP = 6;

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

  const canDownloadSelectedMessage = Boolean(
    selectedEditMessage &&
      !editingMessageId &&
      isLiveConversation &&
      canDownloadAttachment(selectedEditMessage),
  );

  const canShowMessageMenu =
    canEditSelectedMessage ||
    canDeleteSelectedMessage ||
    canCopySelectedMessage ||
    canDownloadSelectedMessage;

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

    console.log('[ServiceChat] STEP 9 — ChatScreen mounted, GET conversation details', {
      conversationId,
      mode,
    });

    setIsLoadingConversation(true);
    void fetchConversationById(conversationId)
      .then((data) => {
        if (!cancelled) {
          console.log('[Chat] STEP 9b — conversation details loaded', {
            id: data.id,
            status: data.status,
            subject: data.subject,
            unread_count: data.unread_count,
          });
          setApiConversation(data);
        }
      })
      .catch((error) => {
        console.log('[Chat] STEP 9 FAILED — conversation details', error);
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

    console.log('[Chat] STEP 10 — GET conversation messages', {
      conversationId,
      currentUserId,
    });

    void fetchConversationMessages(conversationId, { limit: 50 })
      .then(async (response) => {
        if (cancelled) return;

        console.log('[Chat] STEP 10b — messages API returned', {
          count: response.items.length,
          hasMore: response.pagination.has_more,
          nextCursor: response.pagination.next_cursor,
        });

        const hydrated = await hydrateChatMessagesFromApi(response.items, currentUserId);
        if (cancelled) return;
        console.log('[Chat] STEP 10c — messages hydrated', { count: hydrated.length });
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

  useChatScreenRealtime({
    conversationId,
    currentUserId,
    isLiveConversation,
    otherUserId,
    setMessages,
    setApiConversation,
    setIsOtherUserOnline,
    refreshOtherPresence,
  });

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
    const hasMenuAction =
      isOwnMessage || canCopyMessage(message) || canDownloadAttachment(message);
    if (!hasMenuAction) {
      return;
    }

    setSelectedEditMessage(message);
    setEditMenuOpen(true);
  };

  const downloadSelectedAttachment = useCallback(async () => {
    const message = selectedEditMessage;
    const attachment = message?.attachment;
    if (!message || !attachment) return;

    const uri = attachment.uri ?? attachment.thumbnail;
    clearMessageSelection();

    await saveChatAttachmentToDevice({
      attachmentId: message.attachmentId,
      fileName: attachment.name || (attachment.type === 'image' ? 'image.jpg' : 'attachment'),
      uri,
      type: attachment.type,
    });
  }, [clearMessageSelection, selectedEditMessage]);

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
    <ChatScreenMessagePane
      listRef={listRef}
      listWrapStyle={listWrapStyle}
      listContentStyle={listContentStyle}
      invertedMessages={invertedMessages}
      isGroup={meta.isGroup}
      isLiveConversation={isLiveConversation}
      selectedEditMessageId={selectedEditMessage?.id ?? null}
      highlightedMessageId={highlightedMessageId}
      editingMessageId={editingMessageId}
      openingAttachmentId={openingAttachmentId}
      hasOlder={hasOlder}
      loadingOlder={loadingOlder}
      isLoadingMessages={isLoadingMessages}
      showTypingIndicator={showTypingIndicator}
      typingIndicatorName={typingIndicatorName}
      isKeyboardOpen={isKeyboardOpen}
      bottomInset={insets.bottom}
      inputDisabled={inputDisabled}
      conversationIsClosed={conversationIsClosed}
      mode={meta.mode}
      draft={draft}
      onChangeDraft={setDraft}
      onSend={() => void handleSend()}
      voice={voiceControls}
      onAttach={() => void handleDocumentPick()}
      onCameraPress={() => void handleCameraPhoto()}
      focusRequestKey={composerFocusKey}
      onComposerRowLayout={handleComposerRowLayout}
      onDeleteMessage={handleDeleteMessage}
      onImagePress={setViewerImageUri}
      onAttachmentPress={(message) => void handleAttachmentPress(message)}
      onLongPressMessage={openMessageMenu}
      onLoadOlder={handleLoadOlder}
      onScrollToIndexFailed={handleScrollToIndexFailed}
    />
  );


  return (
    <View style={styles.screen}>
    <AppStatusBar />
    <StatusBarFill />
      <ChatHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        avatarInitial={meta.avatarInitial}
        isGroup={meta.isGroup}
        isLoadingConversation={isLoadingConversation}
        isOnline={isProviderPresenceOnline}
        showSearch={showSearch}
        backAccessibilityLabel={
          editingMessageId || selectedEditMessage ? 'Cancel' : 'Go back'
        }
        showConversationMenu={isLiveConversation}
        showInertMenu={!isLiveConversation && meta.isGroup}
        showMessageMenu={!isLiveConversation && !meta.isGroup && canShowMessageMenu}
        onBack={() => {
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
        onToggleSearch={() => setShowSearch(!showSearch)}
        onOpenConversationMenu={() => setHeaderMenuOpen(true)}
        onOpenMessageMenu={() => setEditMenuOpen(true)}
      />

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

      <ChatConversationMenu
        visible={headerMenuOpen && isLiveConversation}
        topOffset={insets.top + 52}
        conversationIsClosed={conversationIsClosed}
        onClose={() => setHeaderMenuOpen(false)}
        onMedia={() => {
          setHeaderMenuOpen(false);
          router.push(chatMediaHref(conversationId));
        }}
        onCloseToggle={() => void handleCloseToggle()}
      />

      <ChatMessageActionMenu
        visible={Boolean(editMenuOpen && selectedEditMessage && canShowMessageMenu)}
        topOffset={insets.top + 52}
        canEdit={Boolean(canEditSelectedMessage && selectedEditMessage)}
        canCopy={canCopySelectedMessage}
        canDownload={canDownloadSelectedMessage}
        canDelete={canDeleteSelectedMessage}
        onClose={() => setEditMenuOpen(false)}
        onEdit={() => {
          if (selectedEditMessage) beginInlineEdit(selectedEditMessage);
        }}
        onCopy={() => void copySelectedMessage()}
        onDownload={() => void downloadSelectedAttachment()}
        onDelete={confirmDeleteSelectedMessage}
      />

      {viewerImageUri ? (
        <ChatImageViewer uri={viewerImageUri} onClose={() => setViewerImageUri(null)} />
      ) : null}
    </View>
  );
}

