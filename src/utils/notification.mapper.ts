import type { NotificationHistoryItem } from '@/types/notification.types';
import {
  formatISTShortDate,
  isYesterdayIST,
  parseApiDate,
} from '@/utils/dateTime';

export type NotificationListItem = {
  id: string;
  notificationType: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  conversationId?: string;
  messageId?: string;
};

const NOTIFICATION_TYPE_ICON: Record<string, { emoji: string; backgroundColor: string }> = {
  chat_message: { emoji: '💬', backgroundColor: '#EAF4EC' },
  booking: { emoji: '✅', backgroundColor: '#F0FDF4' },
  enterprise: { emoji: '🏢', backgroundColor: '#EAF4EC' },
  event: { emoji: '📅', backgroundColor: '#FFFBEB' },
  review: { emoji: '⭐', backgroundColor: '#FFFBEB' },
  course: { emoji: '📚', backgroundColor: '#EFF6FF' },
  sale: { emoji: '🎯', backgroundColor: '#FFF1F2' },
};

const DEFAULT_NOTIFICATION_ICON = { emoji: '🔔', backgroundColor: '#F3F4F6' };

export function getNotificationTypeIcon(notificationType: string) {
  return NOTIFICATION_TYPE_ICON[notificationType] ?? DEFAULT_NOTIFICATION_ICON;
}

function formatNotificationTimestamp(iso: string): string {
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  if (isYesterdayIST(date)) return 'Yesterday';

  return formatISTShortDate(date);
}

function readStringField(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  return typeof value === 'string' ? value : undefined;
}

export function mapNotificationHistoryItem(item: NotificationHistoryItem): NotificationListItem {
  return {
    id: item.id,
    notificationType: item.notification_type,
    title: item.title?.trim() || 'Notification',
    description: item.body?.trim() || '',
    timestamp: formatNotificationTimestamp(item.created_at),
    read: item.is_read,
    conversationId: readStringField(item.data, 'conversation_id'),
    messageId: readStringField(item.data, 'message_id'),
  };
}

export function mapNotificationHistoryItems(items: NotificationHistoryItem[]): NotificationListItem[] {
  return items.map(mapNotificationHistoryItem);
}
