import type { ChatMessage, ChatMessageStatus, ChatAttachmentType } from '@/constants/chat';
import type { ApiMessage } from '@/types/message.types';
import { inferChatAttachmentType } from '@/utils/attachmentType';
import {
  formatISTShortDate,
  formatISTTime,
  isTodayIST,
  parseApiDate,
} from '@/utils/dateTime';

function formatMessageTimestamp(iso: string): string {
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return '';

  if (isTodayIST(date)) {
    return formatISTTime(date);
  }

  return formatISTShortDate(date);
}

function mapReadStatus(message: ApiMessage, currentUserId: string): ChatMessageStatus | undefined {
  // Read receipts (double tick) should only be shown on outgoing messages.
  if (message.sender_id !== currentUserId) return undefined;

  // If someone other than me has read it, show "read" (blue double tick).
  if (message.read_by.some((id) => id !== currentUserId)) {
    return 'read';
  }

  return 'sent';
}

function mapMessageType(
  message: ApiMessage,
): ChatMessage['messageType'] {
  if (message.is_deleted) return 'deleted';

  switch (message.message_type) {
    case 'audio':
    case 'voice':
      return 'voice';
    case 'image':
    case 'document':
    case 'video':
    case 'attachment':
      return 'attachment';
    case 'markdown':
      return 'markdown';
    default:
      return 'text';
  }
}

export function mapApiMessageToChatMessage(
  message: ApiMessage,
  currentUserId: string,
): ChatMessage {
  const isUser = message.sender_id === currentUserId;
  const messageType = mapMessageType(message);
  const rawAny = message as unknown as Record<string, unknown>;
  const isEdited = Boolean(rawAny.is_edited ?? rawAny.edited_at);
  const safeContent = String((message as unknown as { content?: unknown }).content ?? '');

  if (messageType === 'deleted') {
    return {
      id: message.id,
      sender: isUser ? 'user' : 'provider',
      timestamp: formatMessageTimestamp(message.created_at),
      messageType: 'deleted',
      text: 'This message was deleted',
      isEdited,
    };
  }

  if (messageType === 'voice') {
    const downloadUrl = String(rawAny.download_url ?? rawAny.voice_url ?? rawAny.file_url ?? '');
    const transcript =
      String(rawAny.transcript ?? safeContent) === '' ? 'Voice message' : String(rawAny.transcript ?? safeContent);

    return {
      id: message.id,
      sender: isUser ? 'user' : 'provider',
      timestamp: formatMessageTimestamp(message.created_at),
      status: mapReadStatus(message, currentUserId),
      messageType: 'voice',
      isEdited,
      attachmentId: message.attachment_id ?? undefined,
      voice: {
        duration:
          typeof rawAny.duration_seconds === 'number'
            ? `${Math.floor(rawAny.duration_seconds / 60)}:${String(Math.floor(rawAny.duration_seconds % 60)).padStart(2, '0')}`
            : '0:00',
        transcript,
        uri: downloadUrl || undefined,
      },
    };
  }

  if (messageType === 'attachment') {
    const downloadUrl = String(rawAny.download_url ?? rawAny.file_url ?? rawAny.url ?? '');
    const thumbnailUrl = String(rawAny.thumbnail_url ?? rawAny.thumbnail ?? downloadUrl ?? '');
    const fileName = String(
      rawAny.file_name ?? rawAny.fileName ?? (safeContent || 'Attachment'),
    );
    const fileSizeBytes = typeof rawAny.file_size === 'number' ? rawAny.file_size : undefined;
    const fileSizeKb =
      typeof fileSizeBytes === 'number' ? `${Math.max(1, Math.round(fileSizeBytes / 1024))} KB` : '—';
    const storage = String(rawAny.storage ?? 'S3') === 'undefined' ? 'S3' : (rawAny.storage as string | undefined) ?? 'S3';
    const attachmentId = message.attachment_id ?? undefined;

    const guessType = inferChatAttachmentType({
      fileName,
      mimeType: String(rawAny.mime_type ?? rawAny.mimeType ?? ''),
      attachmentType: String(rawAny.attachment_type ?? ''),
      messageType: message.message_type,
    });

    return {
      id: message.id,
      sender: isUser ? 'user' : 'provider',
      timestamp: formatMessageTimestamp(message.created_at),
      status: mapReadStatus(message, currentUserId),
      messageType,
      text: safeContent || undefined,
      attachmentId,
      attachment: {
        type: guessType as ChatAttachmentType,
        name: fileName,
        size: fileSizeKb,
        thumbnail: thumbnailUrl || undefined,
        storage: storage as 'S3' | 'Azure Blob',
      },
      isEdited,
    };
  }

  return {
    id: message.id,
    sender: isUser ? 'user' : 'provider',
    timestamp: formatMessageTimestamp(message.created_at),
    status: mapReadStatus(message, currentUserId),
    messageType,
    text: safeContent,
      isEdited,
  };
}

export function mapApiMessagesToChatMessages(
  items: ApiMessage[],
  currentUserId: string,
): ChatMessage[] {
  return [...items]
    .sort(
      (a, b) => parseApiDate(a.created_at).getTime() - parseApiDate(b.created_at).getTime(),
    )
    .map((item) => mapApiMessageToChatMessage(item, currentUserId));
}
