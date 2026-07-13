import type { ChatMessage } from '@/constants/chat';

export function getCopyableMessageText(message: ChatMessage): string | null {
  const text = message.text?.trim();
  if (text) return text;

  const transcript = message.voice?.transcript?.trim();
  if (transcript && transcript !== 'Voice message') return transcript;

  const attachmentName = message.attachment?.name?.trim();
  if (attachmentName) return attachmentName;

  return null;
}

export function canCopyMessage(message: ChatMessage): boolean {
  return message.messageType !== 'deleted' && getCopyableMessageText(message) != null;
}
