import type { ChatMessage, ChatAttachmentType } from '@/constants/chat';
import {
  fetchAttachmentById,
  ensureAttachmentDownloadUrl,
  parseAttachmentResponse,
  type AttachmentDetailResponse,
} from '@/services/attachments.service';
import type { ApiMessage } from '@/types/message.types';

import { mapApiMessagesToChatMessages } from './message.mapper';
import { inferChatAttachmentType } from './attachmentType';

function mapAttachmentType(detail: AttachmentDetailResponse, messageType: string): ChatAttachmentType {
  return inferChatAttachmentType({
    fileName: detail.file_name,
    mimeType: detail.mime_type,
    attachmentType: detail.attachment_type,
    messageType,
  });
}

export function applyAttachmentDetailToChatMessage(
  message: ChatMessage,
  detail: AttachmentDetailResponse,
  apiMessageType: string,
): ChatMessage {
  const downloadUrl = ensureAttachmentDownloadUrl(
    detail.download_url,
    detail.id || message.attachmentId || '',
  );

  if (message.messageType === 'voice') {
    return {
      ...message,
      attachmentId: detail.id,
      voice: {
        duration: message.voice?.duration ?? '0:00',
        transcript: message.voice?.transcript ?? 'Voice message',
        uri: downloadUrl,
        fileName: detail.file_name,
      },
    };
  }

  if (message.messageType !== 'attachment') return message;

  const attachmentType = mapAttachmentType(detail, apiMessageType);
  const fileSizeKb =
    typeof detail.file_size === 'number'
      ? `${Math.max(1, Math.round(detail.file_size / 1024))} KB`
      : message.attachment?.size ?? '—';

  return {
    ...message,
    attachmentId: detail.id,
    attachment: {
      type: attachmentType,
      name: detail.file_name || message.attachment?.name || 'Attachment',
      size: fileSizeKb,
      thumbnail: attachmentType === 'image' || attachmentType === 'video' ? downloadUrl : undefined,
      uri: attachmentType === 'pdf' || attachmentType === 'word' ? downloadUrl : undefined,
      storage: message.attachment?.storage ?? 'S3',
    },
  };
}

async function fetchAttachmentDetails(
  items: ApiMessage[],
): Promise<Map<string, AttachmentDetailResponse>> {
  const attachmentIds = [
    ...new Set(
      items
        .filter((item) => !item.is_deleted && item.attachment_id)
        .map((item) => item.attachment_id as string),
    ),
  ];

  const detailByAttachmentId = new Map<string, AttachmentDetailResponse>();

  await Promise.all(
    attachmentIds.map(async (attachmentId) => {
      const apiMessage = items.find((item) => item.attachment_id === attachmentId);
      const fileNameHint = apiMessage?.content || undefined;

      try {
        const detail = await fetchAttachmentById(attachmentId, fileNameHint);
        detailByAttachmentId.set(attachmentId, detail);
      } catch (error) {
        if (__DEV__) {
          console.warn('[Attachments GET] Failed for', attachmentId, error);
        }
        detailByAttachmentId.set(
          attachmentId,
          parseAttachmentResponse(attachmentId, null, fileNameHint),
        );
      }
    }),
  );

  return detailByAttachmentId;
}

export async function hydrateChatMessagesFromApi(
  items: ApiMessage[],
  currentUserId: string,
): Promise<ChatMessage[]> {
  const mapped = mapApiMessagesToChatMessages(items, currentUserId);
  const detailByAttachmentId = await fetchAttachmentDetails(items);

  if (!detailByAttachmentId.size) return mapped;

  const apiByMessageId = new Map(items.map((item) => [item.id, item]));

  return mapped.map((message) => {
    const apiMessage = apiByMessageId.get(message.id);
    if (!apiMessage?.attachment_id) return message;

    const detail = detailByAttachmentId.get(apiMessage.attachment_id);
    if (!detail) return message;

    return applyAttachmentDetailToChatMessage(message, detail, apiMessage.message_type);
  });
}

export async function hydrateSingleChatMessageFromApi(
  apiMessage: ApiMessage,
  currentUserId: string,
): Promise<ChatMessage> {
  const [hydrated] = await hydrateChatMessagesFromApi([apiMessage], currentUserId);
  return hydrated;
}
