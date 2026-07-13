import type { ChatInboxItem } from '@/constants/chatInbox';
import type { ChatMessageStatus } from '@/constants/chat';
import type { ConversationLastMessage, ConversationListItem } from '@/types/conversation.types';
import {
  formatISTShortDate,
  formatISTTime,
  isTodayIST,
  isYesterdayIST,
  parseApiDate,
} from '@/utils/dateTime';

function mapInboxLastMessageStatus(
  lastMessage: ConversationLastMessage | null | undefined,
  currentUserId: string,
): ChatMessageStatus | undefined {
  if (!lastMessage || lastMessage.sender_id !== currentUserId) {
    return undefined;
  }

  if (lastMessage.read_by.some((userId) => userId !== currentUserId)) {
    return 'read';
  }

  return 'sent';
}

function formatConversationTimestamp(iso: string | null): string {
  if (!iso) return '';

  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return '';

  if (isTodayIST(date)) {
    return formatISTTime(date);
  }

  if (isYesterdayIST(date)) return 'Yesterday';

  return formatISTShortDate(date);
}

export function mapConversationListItemToInbox(
  item: ConversationListItem,
  currentUserId: string,
): ChatInboxItem {
  const subject = item.subject?.trim() || 'Conversation';

  return {
    id: item.id,
    name: subject,
    lastMessage: item.last_message_preview?.trim() || 'No messages yet',
    lastMessageStatus: mapInboxLastMessageStatus(item.last_message, currentUserId),
    timestamp: formatConversationTimestamp(item.last_message_at ?? item.updated_at),
    unreadCount: item.unread_count,
    isGroup: item.conversation_type !== 'standard',
    isArchived: item.is_archived === true,
    status: item.status ?? 'open',
    avatarInitial: subject.charAt(0).toUpperCase() || '?',
    isOnline: false,
    mode: item.conversation_type === 'standard' ? 'preview' : 'full',
  };
}
