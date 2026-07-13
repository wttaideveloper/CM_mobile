import type { ChatAttachmentType } from '@/constants/chat';

type InferAttachmentTypeArgs = {
  fileName?: string;
  mimeType?: string;
  attachmentType?: string;
  messageType?: string;
};

export function inferChatAttachmentType({
  fileName = '',
  mimeType = '',
  attachmentType = '',
  messageType = '',
}: InferAttachmentTypeArgs): ChatAttachmentType {
  const mime = mimeType.toLowerCase();
  const type = attachmentType.toLowerCase();
  const msgType = messageType.toLowerCase();
  const name = fileName.toLowerCase();

  if (type === 'image' || mime.startsWith('image/') || msgType === 'image') return 'image';
  if (type === 'video' || mime.startsWith('video/') || msgType === 'video') return 'video';
  if (type === 'audio' || mime.startsWith('audio/') || msgType === 'audio' || msgType === 'voice') {
    return 'audio';
  }

  if (name.endsWith('.docx') || name.endsWith('.doc')) return 'word';
  if (name.endsWith('.pdf')) return 'pdf';

  if (mime.includes('pdf')) return 'pdf';
  if (
    mime.includes('word') ||
    mime.includes('docx') ||
    mime.includes('officedocument') ||
    mime.includes('msword')
  ) {
    return 'word';
  }

  if (msgType === 'document' || type === 'document') {
    return 'pdf';
  }

  return 'pdf';
}
