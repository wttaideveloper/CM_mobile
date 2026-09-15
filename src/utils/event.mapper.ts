import type { Event, EventFilterTag } from '@/constants/events';
import type { EventApiResponse } from '@/types/event.types';
import { formatMoney } from '@/utils/currency';
import {
  formatISTShortDate,
  formatISTTime,
  parseApiDate,
} from '@/utils/dateTime';

const MS_PER_DAY = 86_400_000;

// Same default placeholder already used by product.mapper.ts / cart.mapper.ts —
// reused here rather than introducing another hardcoded image URL.
const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop';

/** Mirrors product.mapper.ts's pickProductImage: falls back on empty/null/unusable URLs. */
function pickEventImage(url?: string | null): string {
  const trimmed = url?.trim();
  if (!trimmed) {
    return DEFAULT_EVENT_IMAGE;
  }
  if (trimmed.includes('unsplash.com/photos/')) {
    return DEFAULT_EVENT_IMAGE;
  }
  return trimmed;
}

function textOrNa(value?: string | null): string {
  if (value == null || value.trim() === '') {
    return 'NA';
  }
  return value.trim();
}

function parseNumericString(value?: string | null): number | null {
  if (value == null || value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Backend timestamps may be null/missing — never pass those to parseApiDate(). */
function safeParseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = parseApiDate(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatEventDateTime(start: Date | null): string {
  if (!start) {
    return 'Date TBA';
  }
  return `${formatISTShortDate(start)} · ${formatISTTime(start)}`;
}

function formatEventSchedule(start: Date | null, end: Date | null): string {
  if (!start) {
    return 'Date TBA';
  }
  if (!end) {
    return `${formatISTShortDate(start)} · ${formatISTTime(start)}`;
  }
  return `${formatISTShortDate(start)} · ${formatISTTime(start)} – ${formatISTTime(end)}`;
}

/**
 * Backend only exposes `venue` (in_person/hybrid) or `delivery_mode:"online"` —
 * there is no flat location string, so build one that mirrors the previous mock copy.
 */
function deriveEventLocation(api: EventApiResponse): string {
  if (api.delivery_mode === 'online') {
    return 'Online';
  }

  const city = api.venue?.city?.trim();
  const address = api.venue?.address?.trim();

  if (address && city) {
    return `${address}, ${city}`;
  }

  return address || city || 'NA';
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  published: 'Published',
  cancelled: 'Cancelled',
  completed: 'Completed',
  suspended: 'Suspended',
  archived: 'Archived',
};

/**
 * Literal status → label mapping only — the list always requests status=published,
 * so this will read "Published" for effectively every fetched event today.
 */
function formatEventStatus(status: string): string {
  const known = STATUS_LABELS[status];
  if (known) {
    return known;
  }
  const normalized = status.trim();
  if (!normalized) {
    return 'NA';
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

const FILTER_MAP: Record<string, EventFilterTag | null> = {
  All: null,
  Upcoming: 'upcoming',
  'This Week': 'thisWeek',
  Online: 'online',
  Free: 'free',
};

function deriveFilterTags(
  startDate: Date | null,
  deliveryMode: string | undefined | null,
  isFree: boolean,
): EventFilterTag[] {
  const tags: EventFilterTag[] = [];
  const now = Date.now();

  if (startDate) {
    if (startDate.getTime() >= now) {
      tags.push('upcoming');
    }
    if (startDate.getTime() >= now && startDate.getTime() - now <= 7 * MS_PER_DAY) {
      tags.push('thisWeek');
    }
  }

  // Hybrid events have an online component too, so they count for the "Online"
  // filter chip even though the location label (deriveEventLocation) shows the venue.
  if (deliveryMode === 'online' || deliveryMode === 'hybrid') {
    tags.push('online');
  }

  if (isFree) {
    tags.push('free');
  }

  return tags;
}

function deriveSpeakerInitials(api: EventApiResponse): {
  speakerInitials: string[];
  additionalSpeakers: number;
} {
  const names = (api.sessions ?? [])
    .map((session) => session.speaker?.trim())
    .filter((name): name is string => Boolean(name));

  const uniqueNames = Array.from(new Set(names));
  if (uniqueNames.length === 0) {
    return { speakerInitials: [], additionalSpeakers: 0 };
  }

  const shown = uniqueNames.slice(0, 4).map((name) => name.charAt(0).toUpperCase());
  return {
    speakerInitials: shown,
    additionalSpeakers: Math.max(0, uniqueNames.length - shown.length),
  };
}

export function mapEventApiToItem(api: EventApiResponse): Event {
  const start = safeParseDate(api.start_date);
  const end = safeParseDate(api.end_date);

  const price = parseNumericString(api.price);
  const isFree = price == null || price <= 0;
  const formattedPrice = formatMoney(price ?? 0, api.currency);
  const priceLabel = isFree ? 'Free' : formattedPrice;
  const priceDetail = isFree ? 'Free' : `${formattedPrice} per person`;

  const capacityRaw = parseNumericString(api.capacity);
  const availableSeats = api.available_seats ?? null;
  const registered =
    capacityRaw != null && availableSeats != null
      ? Math.max(0, capacityRaw - availableSeats)
      : 0;
  const capacity = capacityRaw ?? 0;

  const organizer = textOrNa(api.organiser_name ?? api.enterprise_name);
  const organizerInitial = organizer === 'NA' ? 'E' : organizer.charAt(0).toUpperCase();

  const { speakerInitials, additionalSpeakers } = deriveSpeakerInitials(api);

  return {
    id: String(api.id),
    name: api.title,
    priceLabel,
    isFree,
    dateTime: formatEventDateTime(start),
    location: deriveEventLocation(api),
    image: pickEventImage(api.primary_image),
    filterTags: deriveFilterTags(start, api.delivery_mode, isFree),
    detailTitle: api.title,
    status: formatEventStatus(api.status),
    schedule: formatEventSchedule(start, end),
    registered,
    capacity,
    priceDetail,
    description: api.description ?? '',
    detailImage: pickEventImage(api.gallery_images?.[0] ?? api.primary_image),
    organizer,
    organizerInitial,
    speakerInitials,
    additionalSpeakers,
  };
}

export function mapEventsApiResponse(items: EventApiResponse[]): Event[] {
  return items.map(mapEventApiToItem);
}

/** Same filter-tag semantics as the previous constants/events.ts filterEvents(), applied to any array. */
export function filterEventsByTag(events: Event[], filter: string): Event[] {
  const tag = FILTER_MAP[filter];
  if (!tag) {
    return events;
  }
  return events.filter((event) => event.filterTags.includes(tag));
}
