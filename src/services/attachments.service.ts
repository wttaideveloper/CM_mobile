import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { sendMessageViaSocket } from '@/services/socket/socket.message.service';
import { API_CONFIG } from '@/config';
import { DEV_USER } from '@/constants/devUser';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiMessage } from '@/types/message.types';

export type AttachmentUploadResponse = {
  id: string;
  conversation_id: string;
  message_id: string;
  uploaded_by: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  attachment_type: string;
  download_url: string;
  created_at: string;
};

export type AttachmentDetailResponse = AttachmentUploadResponse;

type UploadAttachmentArgs = {
  conversationId: string;
  fileUri: string;
  fileName: string;
  mimeType?: string;
  attachmentType?: 'image' | 'document' | 'audio' | 'video';
};

export function buildAttachmentDownloadUrl(attachmentId: string, download = true): string {
  const path = ENDPOINTS.ATTACHMENTS.GET_BY_ID(attachmentId);
  return download ? `${API_CONFIG.BASE_URL}${path}?download=true` : `${API_CONFIG.BASE_URL}${path}`;
}

function inferMimeTypeFromName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.webm')) return 'audio/webm';
  if (lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.doc') || lower.endsWith('.docx'))
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'application/octet-stream';
}

export async function uploadAttachment({
  conversationId,
  fileUri,
  fileName,
  mimeType,
  attachmentType,
}: UploadAttachmentArgs): Promise<AttachmentUploadResponse> {
  const resolvedMime = mimeType ?? inferMimeTypeFromName(fileName);

  const formData = new FormData();
  formData.append('conversation_id', conversationId);

  if (attachmentType) {
    formData.append('attachment_type', attachmentType);
  }

  // RN FormData file shape
  formData.append(
    'file',
    {
      uri: fileUri,
      name: fileName,
      type: resolvedMime,
    } as any,
  );

  if (__DEV__) {
    // Avoid dumping file contents; log only metadata.
    console.log('[Attachments Upload] Uploading:', {
      conversationId,
      fileUri,
      fileName,
      resolvedMime,
      attachmentType,
    });
  }

  const response = await apiClient.post<AttachmentUploadResponse>(
    ENDPOINTS.ATTACHMENTS.UPLOAD,
    formData,
    {
      // Let React Native set multipart boundary; a bare Content-Type breaks Android uploads.
      headers: {
        Accept: 'application/json',
      },
      transformRequest: (data) => data,
    },
  );

  return response.data;
}

export type AttachmentMessageType = 'image' | 'document' | 'audio' | 'video';

type UploadAndSendAttachmentArgs = {
  conversationId: string;
  fileUri: string;
  fileName: string;
  mimeType?: string;
  attachmentType: AttachmentMessageType;
};

export async function uploadAndSendAttachmentMessage({
  conversationId,
  fileUri,
  fileName,
  mimeType,
  attachmentType,
}: UploadAndSendAttachmentArgs): Promise<ApiMessage> {
  const uploaded = await uploadAttachment({
    conversationId,
    fileUri,
    fileName,
    mimeType,
    attachmentType,
  });

  // Upload API already creates the chat message and emits new_message.
  if (uploaded.message_id?.trim()) {
    if (__DEV__) {
      console.log('[Attachment upload] Message created by upload API:', uploaded.message_id);
    }

    return buildMessageFromUpload(uploaded, attachmentType);
  }

  const messageType =
    attachmentType === 'document'
      ? 'document'
      : attachmentType;

  return sendMessageViaSocket({
    conversation_id: conversationId,
    content: fileName,
    message_type: messageType,
    attachment_id: uploaded.id,
  });
}

function buildMessageFromUpload(
  uploaded: AttachmentUploadResponse,
  attachmentType: AttachmentMessageType,
): ApiMessage {
  const senderId = useAuthStore.getState().user?.id ?? DEV_USER.user_id;
  const messageType = attachmentType === 'document' ? 'document' : attachmentType;

  return {
    id: uploaded.message_id,
    conversation_id: uploaded.conversation_id || '',
    sender_id: senderId,
    content: uploaded.file_name,
    message_type: messageType,
    attachment_id: uploaded.id,
    is_deleted: false,
    created_at: uploaded.created_at || new Date().toISOString(),
    read_by: [],
  };
}

export function resolveAttachmentUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_CONFIG.BASE_URL}${url}`;
  return `${API_CONFIG.BASE_URL}/${url}`;
}

/** Ensures attachment API URLs use ?download=true to fetch the file bytes. */
export function ensureAttachmentDownloadUrl(url: string, attachmentId: string): string {
  const resolved = resolveAttachmentUrl(url);
  if (!resolved) return buildAttachmentDownloadUrl(attachmentId);

  if (resolved.includes('/api/v1/attachments/') && !resolved.includes('download=true')) {
    return resolved.includes('?') ? `${resolved}&download=true` : `${resolved}?download=true`;
  }

  return resolved;
}

export function parseAttachmentResponse(
  attachmentId: string,
  data: unknown,
  fileNameHint?: string,
): AttachmentDetailResponse {
  const fallbackUrl = buildAttachmentDownloadUrl(attachmentId);

  if (typeof data === 'string' && data.trim()) {
    return {
      id: attachmentId,
      conversation_id: '',
      message_id: '',
      uploaded_by: '',
      file_name: fileNameHint || 'Attachment',
      mime_type: inferMimeTypeFromName(fileNameHint || ''),
      file_size: 0,
      attachment_type: 'image',
      download_url: resolveAttachmentUrl(data.trim()),
      created_at: '',
    };
  }

  if (data && typeof data === 'object') {
    const raw = data as Record<string, unknown>;
    const resolvedName = String(raw.file_name ?? raw.filename ?? fileNameHint ?? 'Attachment');
    const downloadPath = String(
      raw.download_url ?? raw.url ?? raw.file_url ?? raw.path ?? fallbackUrl,
    );

    return {
      id: String(raw.id ?? attachmentId),
      conversation_id: String(raw.conversation_id ?? ''),
      message_id: String(raw.message_id ?? ''),
      uploaded_by: String(raw.uploaded_by ?? ''),
      file_name: resolvedName,
      mime_type: String(raw.mime_type ?? inferMimeTypeFromName(resolvedName)),
      file_size: typeof raw.file_size === 'number' ? raw.file_size : 0,
      attachment_type: String(raw.attachment_type ?? ''),
      download_url: ensureAttachmentDownloadUrl(downloadPath || fallbackUrl, attachmentId),
      created_at: String(raw.created_at ?? ''),
    };
  }

  return {
    id: attachmentId,
    conversation_id: '',
    message_id: '',
    uploaded_by: '',
    file_name: fileNameHint || 'Attachment',
    mime_type: inferMimeTypeFromName(fileNameHint || ''),
    file_size: 0,
    attachment_type: 'image',
    download_url: fallbackUrl,
    created_at: '',
  };
}

export async function fetchAttachmentById(
  attachmentId: string,
  fileNameHint?: string,
): Promise<AttachmentDetailResponse> {
  const path = ENDPOINTS.ATTACHMENTS.GET_BY_ID(attachmentId);
  const url = `${API_CONFIG.BASE_URL}${path}`;

  if (__DEV__) {
    console.log('[Attachments GET] URL:', url);
  }

  try {
    const response = await apiClient.get<unknown>(path);
    const parsed = parseAttachmentResponse(attachmentId, response.data, fileNameHint);

    if (__DEV__) {
      console.log('[Attachments GET] Raw response:', response.data);
      console.log('[Attachments GET] Image URL:', parsed.download_url);
    }

    return parsed;
  } catch (error) {
    const fallback = parseAttachmentResponse(attachmentId, null, fileNameHint);

    if (__DEV__) {
      console.warn('[Attachments GET] Failed, using base URL:', fallback.download_url, error);
    }

    return fallback;
  }
}

