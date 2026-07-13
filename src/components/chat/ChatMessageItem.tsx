import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { useAuthenticatedAttachmentUri } from '@/hooks/useAuthenticatedAttachmentUri';
import { Dimensions, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

import type { ChatMessage } from '@/constants/chat';
import { canCopyMessage } from '@/utils/chatMessage';
import { AuthenticatedChatImage } from '@/components/chat/AuthenticatedChatImage';
import { ChatLinkText } from '@/components/chat/ChatLinkText';
import { isSmallDevice } from '@/utils/responsive';
import { shadowSm } from '@/utils/shadows';

const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SELECTION_HIGHLIGHT = 'rgba(31, 93, 78, 0.14)';
const H_PAD = isSmallDevice ? 16 : 20;
const BUBBLE_MAX = '78%';
const CONTENT_WIDTH = Dimensions.get('window').width - 2 * H_PAD;
const IMAGE_BUBBLE_WIDTH = Math.min(CONTENT_WIDTH * 0.62, 280);
const IMAGE_BUBBLE_HEIGHT = Math.round(IMAGE_BUBBLE_WIDTH * 0.72);
const DOCUMENT_BUBBLE_WIDTH = Math.min(CONTENT_WIDTH * 0.72, 300);

const GROUP_SENDER_COLORS: Record<string, string> = {
  'Alex Martinez': '#1F5D4E',
  'Dr. Sarah Kim': '#7C3AED',
  'Sarah Chen': '#0D9488',
  'Dr. James Wilson': '#C2410C',
  'Maria Lopez': '#2563EB',
};

const GROUP_SENDER_COLOR_FALLBACKS = ['#1F5D4E', '#7C3AED', '#0D9488', '#C2410C', '#2563EB'];

function getGroupSenderColor(name: string): string {
  if (GROUP_SENDER_COLORS[name]) {
    return GROUP_SENDER_COLORS[name];
  }

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return GROUP_SENDER_COLOR_FALLBACKS[Math.abs(hash) % GROUP_SENDER_COLOR_FALLBACKS.length];
}

const ATTACHMENT_ICONS: Record<string, string> = {
  image: '🖼️',
  pdf: '📄',
  word: '📝',
  video: '🎬',
  audio: '🎵',
};

const PDF_ICON_COLOR = '#EF4444';
const DOC_ICON_COLOR = '#2563EB';

function ReadReceipt({ status }: { status?: ChatMessage['status'] }) {
  if (!status) return null;

  if (status === 'sent') {
    return <Ionicons name="checkmark" size={14} color="rgba(255,255,255,0.75)" />;
  }

  const tickColor = status === 'read' ? '#53BDEB' : 'rgba(255,255,255,0.85)';
  return <Ionicons name="checkmark-done" size={15} color={tickColor} />;
}

function Reactions({
  reactions,
  isUser,
}: {
  reactions: ChatMessage['reactions'];
  isUser: boolean;
}) {
  if (!reactions?.length) return null;

  const label = reactions
    .map((r) => (r.count > 1 ? `${r.emoji} ${r.count}` : r.emoji))
    .join(' ');

  return (
    <View style={[styles.reactionsBadge, isUser ? styles.reactionsBadgeUser : styles.reactionsBadgeProvider]}>
      <Text style={styles.reactionsEmoji}>{label}</Text>
    </View>
  );
}

function ImageLoadingBubble({ message, isUser }: { message: ChatMessage; isUser: boolean }) {
  return (
    <View
      style={[
        styles.imageBubble,
        styles.imageBubbleLoading,
        isUser ? styles.imageBubbleUser : styles.imageBubbleProvider,
      ]}
    >
      <View style={styles.imageBubbleBody}>
        <ActivityIndicator color={isUser ? '#FFFFFF' : PRIMARY} />
      </View>
      <View style={styles.imageBubbleFooter}>
        <Text style={styles.imageBubbleTime}>{message.timestamp}</Text>
        {isUser ? <ReadReceipt status={message.status} /> : null}
      </View>
    </View>
  );
}

function ImageMessageBubble({
  message,
  isUser,
  onImagePress,
}: {
  message: ChatMessage;
  isUser: boolean;
  onImagePress?: (uri: string) => void;
}) {
  const uri = message.attachment!.thumbnail!;

  return (
    <View
      style={[
        styles.imageBubble,
        isUser ? styles.imageBubbleUser : styles.imageBubbleProvider,
      ]}
    >
      <Pressable onPress={() => onImagePress?.(uri)} style={styles.imageBubbleBody}>
        <AuthenticatedChatImage
          uri={uri}
          style={styles.imageBubblePhoto}
          contentFit="cover"
          loadingStyle={styles.imageBubblePhoto}
        />
        <View style={styles.imageBubbleOverlay} />
      </Pressable>
      <View style={styles.imageBubbleFooter}>
        <Text style={styles.imageBubbleTime}>{message.timestamp}</Text>
        {isUser ? <ReadReceipt status={message.status} /> : null}
      </View>
    </View>
  );
}

function AttachmentCard({
  message,
  isUser,
  onPress,
  opening,
}: {
  message: ChatMessage;
  isUser: boolean;
  onPress?: (message: ChatMessage) => void;
  opening?: boolean;
}) {
  const att = message.attachment!;
  const isMedia = att.type === 'image' || att.type === 'video';
  const isOpenableDocument = att.type === 'pdf' || att.type === 'word';

  const content = (
    <>
      {isMedia && att.thumbnail ? (
        <Image source={{ uri: att.thumbnail }} style={styles.attachThumb} contentFit="cover" />
      ) : (
        <View
          style={[
            styles.attachIconBox,
            isOpenableDocument && styles.attachIconBoxDocument,
            att.type === 'pdf' && styles.attachIconBoxPdf,
          ]}
        >
          {isOpenableDocument ? (
            <Ionicons
              name={att.type === 'word' ? 'document-text-outline' : 'document-outline'}
              size={24}
              color={att.type === 'pdf' ? PDF_ICON_COLOR : DOC_ICON_COLOR}
            />
          ) : (
            <Text style={styles.attachEmoji}>{ATTACHMENT_ICONS[att.type]}</Text>
          )}
        </View>
      )}
      <View style={styles.attachInfo}>
        <Text style={[styles.attachName, isUser && styles.attachNameUser]} numberOfLines={1}>
          {att.name}
        </Text>
        <Text style={[styles.attachMeta, isUser && styles.attachMetaUser]}>
          {att.size}
          {att.duration && att.type !== 'audio' ? ` · ${att.duration}` : ''} · {att.storage}
        </Text>
      </View>
      {opening ? (
        <ActivityIndicator size="small" color={isUser ? '#FFFFFF' : PRIMARY} />
      ) : att.type === 'video' ? (
        <Text style={styles.playBtn}>▶</Text>
      ) : att.type === 'audio' ? (
        <Text style={styles.playBtn}>🔊</Text>
      ) : isOpenableDocument ? (
        <Ionicons name="open-outline" size={18} color={isUser ? 'rgba(255,255,255,0.9)' : PRIMARY} />
      ) : null}
    </>
  );

  if (!isOpenableDocument || !onPress) {
    return (
      <View
        style={[
          styles.attachCard,
          isUser && styles.attachCardUser,
          isOpenableDocument && styles.attachCardDocument,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => onPress(message)}
      disabled={opening}
      style={({ pressed }) => [
        styles.attachCard,
        isUser && styles.attachCardUser,
        isOpenableDocument && styles.attachCardDocument,
        pressed && !opening && styles.attachCardPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

function DocumentMessageBubble({
  message,
  isUser,
  onPress,
  opening,
}: {
  message: ChatMessage;
  isUser: boolean;
  onPress?: (message: ChatMessage) => void;
  opening?: boolean;
}) {
  return (
    <View
      style={[
        styles.documentBubble,
        isUser ? styles.documentBubbleUser : styles.documentBubbleProvider,
      ]}
    >
      <AttachmentCard
        message={message}
        isUser={isUser}
        onPress={onPress}
        opening={opening}
      />
      <View style={[styles.documentBubbleFooter, isUser && styles.documentBubbleFooterUser]}>
        <Text style={[styles.documentBubbleTime, isUser && styles.userTime]}>{message.timestamp}</Text>
        {isUser ? <ReadReceipt status={message.status} /> : null}
      </View>
    </View>
  );
}

function getVoiceLevels(messageId: string): number[] {
  let hash = 0;
  for (let i = 0; i < messageId.length; i += 1) {
    hash = messageId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Array.from({ length: 28 }, (_, index) => {
    const value = Math.abs(Math.sin(hash + index * 1.55) * 11) + 5;
    return Math.round(value);
  });
}

function VoiceAvatar({
  isUser,
  label,
}: {
  isUser: boolean;
  label: string;
}) {
  return (
    <View style={styles.voiceAvatarWrap}>
      <View style={[styles.voiceAvatar, isUser ? styles.voiceAvatarUser : styles.voiceAvatarProvider]}>
        <Text style={[styles.voiceAvatarText, isUser && styles.voiceAvatarTextUser]}>{label}</Text>
      </View>
      <View style={[styles.voiceMicBadge, isUser ? styles.voiceMicBadgeUser : styles.voiceMicBadgeProvider]}>
        <Ionicons name="mic" size={9} color={isUser ? PRIMARY : '#FFFFFF'} />
      </View>
    </View>
  );
}

function VoiceWaveBars({
  levels,
  progress,
  isUser,
}: {
  levels: number[];
  progress: number;
  isUser: boolean;
}) {
  const scrubberIndex = Math.min(levels.length - 1, Math.floor(progress * levels.length));

  return (
    <View style={styles.voiceWaveTrack}>
      {levels.map((height, index) => {
        const isPast = index <= scrubberIndex;
        const showDot = index === scrubberIndex;

        return (
          <View key={`${index}-${height}`} style={styles.voiceWaveColumn}>
            {showDot ? (
              <View style={[styles.voiceScrubber, isUser && styles.voiceScrubberUser]} />
            ) : (
              <View
                style={[
                  styles.voiceWaveBar,
                  {
                    height: Math.max(4, height),
                    backgroundColor: isUser
                      ? isPast
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(255,255,255,0.42)'
                      : isPast
                        ? PRIMARY
                        : '#C5D0CA',
                  },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function VoiceBubble({
  message,
  isUser,
  senderName,
}: {
  message: ChatMessage;
  isUser: boolean;
  senderName?: string;
}) {
  const remoteUri = message.voice?.uri;
  const [loadRequested, setLoadRequested] = useState(false);
  const [pendingPlay, setPendingPlay] = useState(false);
  const { uri, loading, error } = useAuthenticatedAttachmentUri(
    remoteUri,
    message.voice?.fileName,
    { enabled: loadRequested },
  );
  const player = useAudioPlayer(uri ?? null);
  const playerStatus = useAudioPlayerStatus(player);
  const levels = getVoiceLevels(message.id);
  const progress =
    uri && playerStatus.duration > 0
      ? Math.min(1, playerStatus.currentTime / playerStatus.duration)
      : 0;
  const avatarLabel = isUser ? 'Y' : (senderName?.charAt(0).toUpperCase() ?? 'P');
  const canPlay = Boolean(uri) && !error;

  useEffect(() => {
    if (!pendingPlay || !canPlay) return;

    setPendingPlay(false);

    if (playerStatus.duration > 0 && playerStatus.currentTime >= playerStatus.duration - 0.05) {
      player.seekTo(0);
    }

    player.play();
  }, [canPlay, pendingPlay, player, playerStatus.currentTime, playerStatus.duration]);

  const togglePlayback = () => {
    if (!remoteUri) return;

    if (!loadRequested) {
      setLoadRequested(true);
      setPendingPlay(true);
      return;
    }

    if (!canPlay) return;

    if (playerStatus.playing) {
      try {
        player.pause();
      } catch {
        // ignore stale player
      }
      return;
    }

    if (playerStatus.duration > 0 && playerStatus.currentTime >= playerStatus.duration - 0.05) {
      player.seekTo(0);
    }

    player.play();
  };

  const statusLabel = error
    ? 'Unable to play'
    : loading || (loadRequested && !uri)
      ? 'Loading…'
      : null;

  return (
    <View style={styles.voiceBubble}>
      <View style={styles.voiceMainRow}>
        <VoiceAvatar isUser={isUser} label={avatarLabel} />

        <Pressable
          onPress={togglePlayback}
          hitSlop={10}
          disabled={!remoteUri || (loadRequested && loading)}
          style={styles.voicePlayBtn}
        >
          <Ionicons
            name={canPlay && playerStatus.playing ? 'pause' : 'play'}
            size={20}
            color={isUser ? 'rgba(255,255,255,0.92)' : PRIMARY}
          />
        </Pressable>

        <VoiceWaveBars levels={levels} progress={progress} isUser={isUser} />
      </View>

      {statusLabel ? (
        <Text style={[styles.voiceDurationLabel, isUser && styles.voiceDurationLabelUser]}>
          {statusLabel}
        </Text>
      ) : null}
    </View>
  );
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <View style={styles.markdownBlock}>
      {lines.map((line, i) => {
        const isBold = line.startsWith('**') && line.endsWith('**');
        const isBullet = line.startsWith('•');
        const content = isBold ? line.slice(2, -2) : line;
        return (
          <Text
            key={i}
            style={[styles.markdownLine, isBold && styles.markdownBold, isBullet && styles.markdownBullet]}
          >
            {content}
          </Text>
        );
      })}
    </View>
  );
}

function MessageActions() {
  return (
    <View style={styles.actionsRow}>
      <Pressable style={styles.actionChip}><Text style={styles.actionText}>Edit</Text></Pressable>
      <Pressable style={styles.actionChip}><Text style={styles.actionText}>Delete</Text></Pressable>
      <Pressable style={styles.actionChip}><Text style={styles.actionText}>History</Text></Pressable>
    </View>
  );
}

export function ChatMessageItem({
  message,
  isGroup = false,
  onDeleteMessage,
  onImagePress,
  onAttachmentPress,
  openingAttachmentId,
  onLongPressMessage,
  selectedForEdit,
}: {
  message: ChatMessage;
  isGroup?: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onImagePress?: (uri: string) => void;
  onAttachmentPress?: (message: ChatMessage) => void;
  openingAttachmentId?: string | null;
  onLongPressMessage?: (message: ChatMessage) => void;
  selectedForEdit?: boolean;
}) {
  if (message.sender === 'system') {
    return (
      <View style={styles.systemRow}>
        <View style={[styles.systemBubble, message.isArchived && styles.archivedBubble]}>
          <Text style={styles.systemText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  const isUser = message.sender === 'user';
  const showSenderName = isGroup && !isUser && !!message.senderName;
  const isVoiceMessage = message.messageType === 'voice';
  const isImageMessage =
    message.messageType === 'attachment' && message.attachment?.type === 'image';
  const isDocumentMessage =
    message.messageType === 'attachment' &&
    (message.attachment?.type === 'pdf' || message.attachment?.type === 'word');
  const isImageAttachment = isImageMessage && !!message.attachment?.thumbnail;
  const canDelete = Boolean(onDeleteMessage && isUser && message.messageType !== 'deleted');
  const canEdit =
    Boolean(onLongPressMessage) &&
    isUser &&
    message.messageType !== 'deleted' &&
    (message.messageType === 'text' || message.messageType === 'markdown' || !message.messageType) &&
    Boolean(message.text);
  const canCopy = canCopyMessage(message);
  const canOpenMessageMenu = canEdit || canDelete || canCopy;

  const handleLongPress = canOpenMessageMenu ? () => onLongPressMessage?.(message) : undefined;

  if (message.messageType === 'deleted') {
    return (
      <View style={styles.messageRowWrap}>
        {selectedForEdit ? <View style={styles.selectionHighlight} pointerEvents="none" /> : null}
        <View style={isUser ? styles.userRow : styles.providerRow}>
          <View style={styles.deletedBubble}>
            <Text style={styles.deletedText}>🚫 {message.text}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (isDocumentMessage) {
    return (
      <Pressable onLongPress={handleLongPress} delayLongPress={400}>
        <View style={styles.messageRowWrap}>
          {selectedForEdit ? <View style={styles.selectionHighlight} pointerEvents="none" /> : null}
          <View style={isUser ? styles.userRow : styles.providerRow}>
            <View style={[styles.bubbleWrap, styles.documentBubbleWrap, isUser && styles.bubbleWrapUser]}>
              {showSenderName ? (
                <Text
                  style={[styles.senderName, { color: getGroupSenderColor(message.senderName!) }]}
                  numberOfLines={1}
                >
                  {message.senderName}
                </Text>
              ) : null}
              <DocumentMessageBubble
                message={message}
                isUser={isUser}
                onPress={onAttachmentPress}
                opening={
                  openingAttachmentId != null &&
                  (openingAttachmentId === message.attachmentId || openingAttachmentId === message.id)
                }
              />
              <Reactions reactions={message.reactions} isUser={isUser} />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  if (isImageMessage) {
    return (
      <Pressable onLongPress={handleLongPress} delayLongPress={400}>
        <View style={styles.messageRowWrap}>
          {selectedForEdit ? <View style={styles.selectionHighlight} pointerEvents="none" /> : null}
          <View style={isUser ? styles.userRow : styles.providerRow}>
            <View style={[styles.bubbleWrap, styles.imageBubbleWrap, isUser && styles.bubbleWrapUser]}>
              {showSenderName ? (
                <Text
                  style={[styles.senderName, { color: getGroupSenderColor(message.senderName!) }]}
                  numberOfLines={1}
                >
                  {message.senderName}
                </Text>
              ) : null}
              {isImageAttachment ? (
                <ImageMessageBubble message={message} isUser={isUser} onImagePress={onImagePress} />
              ) : (
                <ImageLoadingBubble message={message} isUser={isUser} />
              )}
              <Reactions reactions={message.reactions} isUser={isUser} />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.messageRowWrap}>
      {selectedForEdit ? <View style={styles.selectionHighlight} pointerEvents="none" /> : null}
      <View style={isUser ? styles.userRow : styles.providerRow}>
        <View style={[styles.bubbleWrap, isUser && styles.bubbleWrapUser]}>
        {showSenderName ? (
          <Text
            style={[styles.senderName, { color: getGroupSenderColor(message.senderName!) }]}
            numberOfLines={1}
          >
            {message.senderName}
          </Text>
        ) : null}
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={400}
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.providerBubble,
            isUser && styles.userBubbleAlign,
            isVoiceMessage && styles.voiceMessageBubble,
          ]}
        >
          {message.messageType === 'attachment' && message.attachment && !isDocumentMessage ? (
            <>
              {message.text ? (
                <ChatLinkText
                  text={message.text}
                  style={[styles.bubbleText, isUser && styles.userText]}
                  isUser={isUser}
                />
              ) : null}
              <AttachmentCard
                message={message}
                isUser={isUser}
                onPress={onAttachmentPress}
                opening={
                  openingAttachmentId != null &&
                  (openingAttachmentId === message.attachmentId || openingAttachmentId === message.id)
                }
              />
            </>
          ) : null}

          {isVoiceMessage ? (
            <>
              <VoiceBubble message={message} isUser={isUser} senderName={message.senderName} />
              {message.voice?.transcript && message.voice.transcript !== 'Voice message' ? (
                <View style={styles.transcriptBox}>
                  <Text style={[styles.transcriptLabel, isUser && styles.transcriptLabelUser]}>
                    Speech-to-text
                  </Text>
                  <Text style={[styles.transcriptText, isUser && styles.transcriptTextUser]}>
                    {message.voice.transcript}
                  </Text>
                </View>
              ) : null}
            </>
          ) : null}

          {message.messageType === 'markdown' && message.text ? (
            <MarkdownText text={message.text} />
          ) : null}

          {(message.messageType === 'text' || !message.messageType) && message.text ? (
            <ChatLinkText
              text={message.text}
              style={[styles.bubbleText, isUser && styles.userText]}
              isUser={isUser}
            />
          ) : null}

          <View style={[styles.bubbleFooter, isUser && styles.bubbleFooterUser, isVoiceMessage && styles.voiceBubbleFooter]}>
            <Text style={[styles.bubbleTime, isUser && styles.userTime]}>{message.timestamp}</Text>
            {message.isEdited ? (
              <Text style={[styles.editedLabel, isUser && styles.userTime]}>edited</Text>
            ) : null}
            {isUser && message.status ? <ReadReceipt status={message.status} /> : null}
          </View>

          {/*
            Context menu actions are handled in the long-press header menu.
            We only show the small "edited" label in the bubble.
          */}
        </Pressable>
        <Reactions reactions={message.reactions} isUser={isUser} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  systemRow: { alignItems: 'center', marginVertical: 2 },
  systemBubble: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '92%',
  },
  archivedBubble: { backgroundColor: '#FEF3C7' },
  systemText: { fontSize: 11, fontWeight: '600', color: TEXT_DESC, textAlign: 'center' },
  messageRowWrap: {
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    left: -H_PAD,
    right: -H_PAD,
    top: -2,
    bottom: -2,
    backgroundColor: SELECTION_HIGHLIGHT,
  },
  providerRow: { alignItems: 'flex-start', paddingRight: '12%' },
  userRow: { alignItems: 'flex-end', paddingLeft: '18%' },
  bubbleWrap: { position: 'relative', maxWidth: BUBBLE_MAX, marginBottom: 4 },
  bubbleWrapUser: { alignSelf: 'flex-end' },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  providerBubble: {
    backgroundColor: PAGE_BG,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    ...shadowSm,
  },
  userBubble: { backgroundColor: PRIMARY, borderBottomRightRadius: 4 },
  userBubbleAlign: { alignSelf: 'flex-end' },
  voiceMessageBubble: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    overflow: 'hidden',
  },
  voiceBubbleFooter: {
    marginTop: 2,
  },
  bubbleText: { fontSize: isSmallDevice ? 14 : 15, lineHeight: 20, fontWeight: '500', color: TEXT_BLACK },
  userText: { color: '#FFFFFF' },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleFooterUser: { marginLeft: 12 },
  bubbleTime: { fontSize: 10, fontWeight: '500', color: TEXT_MUTED },
  userTime: { color: 'rgba(255,255,255,0.75)' },
  editedLabel: { fontSize: 10, fontWeight: '600', color: TEXT_MUTED, fontStyle: 'italic' },
  deletedBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'dashed',
  },
  deletedText: { fontSize: 12, color: TEXT_MUTED, fontStyle: 'italic' },
  reactionsBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: PAGE_BG,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    ...shadowSm,
  },
  reactionsBadgeUser: { left: 6 },
  reactionsBadgeProvider: { right: 6 },
  reactionsEmoji: { fontSize: 13, lineHeight: 16 },
  attachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F7F5',
    borderRadius: 10,
    padding: 8,
    marginTop: 4,
  },
  attachCardDocument: {
    marginTop: 0,
    width: '100%',
  },
  attachCardUser: { backgroundColor: 'rgba(255,255,255,0.15)' },
  attachCardPressed: { opacity: 0.85 },
  documentBubbleWrap: {
    width: DOCUMENT_BUBBLE_WIDTH,
    maxWidth: DOCUMENT_BUBBLE_WIDTH,
  },
  imageBubbleWrap: {
    width: IMAGE_BUBBLE_WIDTH,
    maxWidth: IMAGE_BUBBLE_WIDTH,
  },
  documentBubble: {
    width: DOCUMENT_BUBBLE_WIDTH,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  documentBubbleUser: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  documentBubbleProvider: {
    backgroundColor: PAGE_BG,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    ...shadowSm,
  },
  documentBubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 6,
  },
  documentBubbleFooterUser: {
    marginLeft: 12,
  },
  documentBubbleTime: {
    fontSize: 10,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  attachThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E8EDEA' },
  imageBubble: {
    width: '100%',
    height: IMAGE_BUBBLE_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E8EDEA',
  },
  imageBubbleBody: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBubbleLoading: {
    justifyContent: 'center',
  },
  imageBubbleUser: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  imageBubbleProvider: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  imageBubblePhoto: {
    width: '100%',
    height: '100%',
  },
  imageBubbleOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  imageBubbleFooter: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  imageBubbleTime: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
  attachIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E8EDEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIconBoxDocument: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DOC_ICON_COLOR,
  },
  attachIconBoxPdf: {
    borderColor: PDF_ICON_COLOR,
  },
  attachEmoji: { fontSize: 22 },
  attachInfo: { flex: 1, minWidth: 0 },
  attachName: { fontSize: 12, fontWeight: '700', color: TEXT_BLACK },
  attachNameUser: { color: '#FFFFFF' },
  attachMeta: { fontSize: 10, color: TEXT_DESC, marginTop: 2 },
  attachMetaUser: { color: 'rgba(255,255,255,0.8)' },
  playBtn: { fontSize: 16 },
  voiceBubble: {
    alignSelf: 'flex-start',
  },
  voiceMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceAvatarWrap: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  voiceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceAvatarUser: {
    backgroundColor: '#8D6E63',
  },
  voiceAvatarProvider: {
    backgroundColor: '#EAF4EC',
  },
  voiceAvatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: PRIMARY,
  },
  voiceAvatarTextUser: {
    color: '#F5E6D8',
  },
  voiceMicBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PAGE_BG,
  },
  voiceMicBadgeUser: {
    backgroundColor: '#FFFFFF',
    borderColor: PRIMARY,
  },
  voiceMicBadgeProvider: {
    borderColor: PAGE_BG,
  },
  voicePlayBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  voiceWaveTrack: {
    width: 136,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
    overflow: 'hidden',
  },
  voiceWaveColumn: {
    width: 3,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceScrubber: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  voiceScrubberUser: {
    backgroundColor: '#FFFFFF',
  },
  voiceWaveBar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
  voiceDurationLabel: {
    marginTop: 2,
    marginLeft: 72,
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_DESC,
  },
  voiceDurationLabelUser: {
    color: 'rgba(255,255,255,0.85)',
  },
  transcriptBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
  },
  transcriptLabel: { fontSize: 9, fontWeight: '700', color: TEXT_MUTED, marginBottom: 2 },
  transcriptLabelUser: { color: 'rgba(255,255,255,0.7)' },
  transcriptText: { fontSize: 11, color: TEXT_DESC, lineHeight: 16 },
  transcriptTextUser: { color: 'rgba(255,255,255,0.9)' },
  markdownBlock: { gap: 2 },
  markdownLine: { fontSize: 14, lineHeight: 20, color: TEXT_BLACK },
  markdownBold: { fontWeight: '800' },
  markdownBullet: { paddingLeft: 4 },
  actionsRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  actionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionText: { fontSize: 10, fontWeight: '700', color: TEXT_DESC },
});
