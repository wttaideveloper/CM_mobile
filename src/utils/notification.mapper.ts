import type {
  NotifFilter,
  NotifGroupLabel,
  NotifIconKind,
  StaticNotification,
} from '@/components/notifications/notificationsData';
import type { UserNotificationItem } from '@/types/notification.types';
import {
  formatISTShortDate,
  isTodayIST,
  isYesterdayIST,
  parseApiDate,
} from '@/utils/dateTime';

export type NotificationListItem = {
  /** User-inbox row id (`items[].id`). */
  id: string;
  /** API `notification_id` — used in PUT .../notifications/{notification_id}/read */
  notificationId: string;
  notificationType: string;
  category?: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  conversationId?: string;
  messageId?: string;
  trainingId?: string;
  enrolmentId?: string;
  status?: string;
  announcementId?: string;
  discussionId?: string;
  certificateUrl?: string;
  createdAt?: string;
};

const NOTIFICATION_TYPE_ICON: Record<
  string,
  { emoji: string; backgroundColor: string }
> = {
  chat_message: { emoji: '💬', backgroundColor: '#EAF4EC' },
  booking: { emoji: '✅', backgroundColor: '#F0FDF4' },
  enterprise: { emoji: '🏢', backgroundColor: '#EAF4EC' },
  event: { emoji: '📅', backgroundColor: '#FFFBEB' },
  review: { emoji: '⭐', backgroundColor: '#FFFBEB' },
  course: { emoji: '📚', backgroundColor: '#EFF6FF' },
  sale: { emoji: '🎯', backgroundColor: '#FFF1F2' },
};

const DEFAULT_NOTIFICATION_ICON = { emoji: '🔔', backgroundColor: '#F3F4F6' };

const DASH_TYPE_STYLE: Record<
  string,
  {
    icon: NotifIconKind;
    color: string;
    bg: string;
    filter: Exclude<NotifFilter, 'All' | 'Unread'>;
  }
> = {
  chat_message: {
    icon: 'book',
    color: '#2f7d32',
    bg: '#e6f4e8',
    filter: 'Chat',
  },
  booking: {
    icon: 'award',
    color: '#2f7d32',
    bg: '#e6f4e8',
    filter: 'Bookings',
  },
  event: { icon: 'sun', color: '#e08b00', bg: '#fff4e0', filter: 'Bookings' },
  course: { icon: 'book', color: '#1e6fd9', bg: '#e8f0fe', filter: 'Courses' },
  review: { icon: 'trend', color: '#e08b00', bg: '#fff4e0', filter: 'Other' },
  enterprise: {
    icon: 'trend',
    color: '#2f7d32',
    bg: '#e6f4e8',
    filter: 'Other',
  },
  sale: { icon: 'trend', color: '#d94848', bg: '#fde8e8', filter: 'Other' },
  training_enrolment_confirmation: {
    icon: 'book',
    color: '#1e6fd9',
    bg: '#e8f0fe',
    filter: 'Courses',
  },
  enrolment_approved: {
    icon: 'award',
    color: '#2f7d32',
    bg: '#e6f4e8',
    filter: 'Courses',
  },
  enrolment_rejected: {
    icon: 'book',
    color: '#d94848',
    bg: '#fde8e8',
    filter: 'Courses',
  },
  enrolment_cancelled: {
    icon: 'book',
    color: '#d94848',
    bg: '#fde8e8',
    filter: 'Courses',
  },
  training_new: {
    icon: 'book',
    color: '#1e6fd9',
    bg: '#e8f0fe',
    filter: 'Courses',
  },
  training_certificate: {
    icon: 'award',
    color: '#2f7d32',
    bg: '#e6f4e8',
    filter: 'Courses',
  },
  training_announcement: {
    icon: 'book',
    color: '#1e6fd9',
    bg: '#e8f0fe',
    filter: 'Courses',
  },
  training_answer: {
    icon: 'book',
    color: '#1e6fd9',
    bg: '#e8f0fe',
    filter: 'Courses',
  },
  training_reminder: {
    icon: 'sun',
    color: '#e08b00',
    bg: '#fff4e0',
    filter: 'Courses',
  },
  training_final_day: {
    icon: 'sun',
    color: '#e08b00',
    bg: '#fff4e0',
    filter: 'Courses',
  },
};

const DEFAULT_DASH_STYLE = {
  icon: 'drop' as NotifIconKind,
  color: '#1e6fd9',
  bg: '#e8f0fe',
  filter: 'Other' as Exclude<NotifFilter, 'All' | 'Unread'>,
};

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

function notificationGroup(iso: string): NotifGroupLabel {
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return 'EARLIER';
  if (isTodayIST(date)) return 'TODAY';
  if (isYesterdayIST(date)) return 'YESTERDAY';
  return 'EARLIER';
}

function readStringField(
  data: Record<string, unknown> | null | undefined,
  key: string,
): string | undefined {
  if (!data) return undefined;
  const value = data[key];
  return typeof value === 'string' ? value : undefined;
}

/** Prefer category for UI/routing (API sends type=automatic, category=chat_message). */
function pickDisplayType(item: UserNotificationItem): string {
  const category =
    item.category?.trim() ||
    readStringField(item.metadata ?? undefined, 'category');
  if (category) return category;
  return item.notification_type?.trim() || 'notification';
}

export function mapUserNotificationItem(
  item: UserNotificationItem,
): NotificationListItem {
  const metadata = item.metadata ?? undefined;
  const category =
    item.category?.trim() ||
    readStringField(metadata, 'category') ||
    undefined;

  return {
    id: item.id,
    notificationId: item.notification_id?.trim() || item.id,
    notificationType: pickDisplayType(item),
    category,
    title: item.title?.trim() || 'Notification',
    description: item.message?.trim() || '',
    timestamp: formatNotificationTimestamp(item.created_at),
    read: item.is_read,
    conversationId: readStringField(metadata, 'conversation_id'),
    messageId: readStringField(metadata, 'message_id'),
    trainingId: readStringField(metadata, 'training_id'),
    enrolmentId:
      readStringField(metadata, 'enrolment_id') ||
      readStringField(metadata, 'enrollment_id'),
    status: readStringField(metadata, 'status'),
    announcementId: readStringField(metadata, 'announcement_id'),
    discussionId: readStringField(metadata, 'discussion_id'),
    certificateUrl: readStringField(metadata, 'certificate_url'),
    createdAt: item.created_at,
  };
}

export function mapUserNotificationItems(
  items: UserNotificationItem[],
): NotificationListItem[] {
  return items.map(mapUserNotificationItem);
}

/** Map inbox API rows into the dash notifications card model. */
export function mapUserNotificationsToDashItems(
  items: UserNotificationItem[],
): StaticNotification[] {
  return mapUserNotificationItems(items).map((item) => {
    const style = DASH_TYPE_STYLE[item.notificationType] ?? DEFAULT_DASH_STYLE;
    return {
      id: item.id,
      notificationId: item.notificationId,
      group: notificationGroup(item.createdAt || ''),
      filter: style.filter,
      title: item.title,
      body: item.description,
      time: item.timestamp,
      unread: !item.read,
      color: style.color,
      bg: style.bg,
      icon: style.icon,
      conversationId: item.conversationId,
      notificationType: item.notificationType,
      category: item.category,
      trainingId: item.trainingId,
      enrolmentId: item.enrolmentId,
      status: item.status,
      announcementId: item.announcementId,
      discussionId: item.discussionId,
      certificateUrl: item.certificateUrl,
    };
  });
}
