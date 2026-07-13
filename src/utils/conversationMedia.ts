import type { ChatMessage } from '@/constants/chat';
import type { ApiMessage } from '@/types/message.types';
import { getISTDateKey, parseApiDate } from '@/utils/dateTime';

export type MediaGalleryItem = {
  messageId: string;
  attachmentId?: string;
  createdAt: string;
  kind: 'image' | 'video' | 'pdf' | 'word';
  name: string;
  size: string;
  thumbnail?: string;
  uri?: string;
};

export type MediaGallerySection = {
  title: string;
  items: MediaGalleryItem[];
  sortKey: number;
};

export function isMediaGalleryItem(message: ChatMessage): boolean {
  return (
    message.messageType === 'attachment' &&
    (message.attachment?.type === 'image' || message.attachment?.type === 'video')
  );
}

export function isDocGalleryItem(message: ChatMessage): boolean {
  return (
    message.messageType === 'attachment' &&
    (message.attachment?.type === 'pdf' || message.attachment?.type === 'word')
  );
}

export function toMediaGalleryItem(
  message: ChatMessage,
  createdAt: string,
): MediaGalleryItem | null {
  if (!message.attachment) return null;

  const { type, name, size, thumbnail, uri } = message.attachment;
  if (type !== 'image' && type !== 'video' && type !== 'pdf' && type !== 'word') {
    return null;
  }

  return {
    messageId: message.id,
    attachmentId: message.attachmentId,
    createdAt,
    kind: type,
    name,
    size,
    thumbnail,
    uri,
  };
}

function sectionLabelForDate(iso: string): { title: string; sortKey: number } {
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) {
    return { title: 'OLDER', sortKey: 0 };
  }

  const now = new Date();
  const todayKey = getISTDateKey(now);
  const dateKey = getISTDateKey(date);
  const todayStart = parseApiDate(`${todayKey}T00:00:00Z`).getTime();
  const dateStart = parseApiDate(`${dateKey}T00:00:00Z`).getTime();
  const diffDays = Math.floor((todayStart - dateStart) / 86_400_000);

  if (diffDays < 7) {
    return { title: 'RECENT', sortKey: Number.MAX_SAFE_INTEGER };
  }

  if (diffDays < 14) {
    return { title: 'LAST WEEK', sortKey: Number.MAX_SAFE_INTEGER - 1 };
  }

  const month = date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'long',
  }).toUpperCase();
  const year = date.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
  });
  const currentYear = now.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
  });
  const title = year === currentYear ? month : `${month} ${year}`;

  return { title, sortKey: dateStart };
}

export function groupGalleryItems(items: MediaGalleryItem[]): MediaGallerySection[] {
  const buckets = new Map<string, MediaGallerySection>();

  for (const item of items) {
    const { title, sortKey } = sectionLabelForDate(item.createdAt);
    const existing = buckets.get(title);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    buckets.set(title, { title, items: [item], sortKey });
  }

  return [...buckets.values()]
    .map((section) => ({
      ...section,
      items: [...section.items].sort(
        (a, b) => parseApiDate(b.createdAt).getTime() - parseApiDate(a.createdAt).getTime(),
      ),
    }))
    .sort((a, b) => b.sortKey - a.sortKey);
}

export function buildCreatedAtLookup(items: ApiMessage[]): Map<string, string> {
  return new Map(items.map((item) => [item.id, item.created_at]));
}

export function galleryItemsFromMessages(
  messages: ChatMessage[],
  createdAtByMessageId: Map<string, string>,
  tab: 'media' | 'docs',
): MediaGalleryItem[] {
  const predicate = tab === 'media' ? isMediaGalleryItem : isDocGalleryItem;

  return messages
    .filter(predicate)
    .map((message) =>
      toMediaGalleryItem(message, createdAtByMessageId.get(message.id) ?? new Date(0).toISOString()),
    )
    .filter((item): item is MediaGalleryItem => item != null)
    .sort((a, b) => parseApiDate(b.createdAt).getTime() - parseApiDate(a.createdAt).getTime());
}
