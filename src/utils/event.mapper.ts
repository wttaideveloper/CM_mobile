import type { Event, EventFilterTag } from '@/constants/events';
import type {
  EventApiResponse,
  EventFormField,
  EventFormFieldApiResponse,
  EventFormFieldOption,
  EventFormFieldRenderer,
  EventFormSection,
  EventFormSectionApiResponse,
  EventMeetingAccess,
  EventMeetingLinkApiResponse,
  EventMyRegistrationApiResponse,
  EventRegistrationForm,
  EventRegistrationFormApiResponse,
  EventResource,
  EventSessionApiResponse,
  EventSessionSummary,
  EventTicketOption,
  EventTicketTypeApiResponse,
  MyEventBucket,
  MyEventRegistration,
  MyWaitlistApiResponse,
  MyWaitlistEntry,
  MyWaitlistStatus,
} from '@/types/event.types';
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

/** Same address/city combination as deriveEventLocation, but null (not 'NA') when absent — used to decide whether the Location Details card renders at all (Phase 5C). */
function deriveVenueAddress(api: EventApiResponse): string | null {
  const city = api.venue?.city?.trim();
  const address = api.venue?.address?.trim();

  if (address && city) {
    return `${address}, ${city}`;
  }

  return address || city || null;
}

const DELIVERY_MODE_LABELS: Record<string, string> = {
  in_person: 'In Person',
  online: 'Online',
  hybrid: 'Hybrid',
};

/** Mirrors the backend's own delivery_mode_display map (response_mappers.py, _event_base_fields) as a fallback for when that field is missing. */
function deriveDeliveryModeLabel(api: EventApiResponse): string {
  const display = api.delivery_mode_display?.trim();
  if (display) {
    return display;
  }
  const mode = api.delivery_mode?.trim();
  if (mode && DELIVERY_MODE_LABELS[mode]) {
    return DELIVERY_MODE_LABELS[mode];
  }
  return mode || 'NA';
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

/**
 * Mirrors the backend's _ticket_effective_price (event_service.py): early-bird
 * price wins while still within its deadline, else promo_price, else the
 * ticket's standard price. Preview only — the backend recomputes and returns
 * the authoritative amount on checkout.
 */
function ticketEffectivePrice(
  ticket: EventTicketTypeApiResponse,
  fallbackPrice: number | null,
): number {
  const earlyBirdPrice = parseNumericString(ticket.early_bird_price);
  const earlyBirdUntil = safeParseDate(ticket.early_bird_until);
  if (earlyBirdPrice != null && earlyBirdUntil && earlyBirdUntil.getTime() >= Date.now()) {
    return earlyBirdPrice;
  }
  const promoPrice = parseNumericString(ticket.promo_price);
  if (promoPrice != null) {
    return promoPrice;
  }
  return parseNumericString(ticket.price) ?? fallbackPrice ?? 0;
}

function buildTicketOptions(
  api: EventApiResponse,
  fallbackPrice: number | null,
): EventTicketOption[] {
  const tickets = api.ticket_types ?? [];
  return tickets
    // Checkout looks up a ticket by exact id match server-side (event_service.py,
    // _resolve_ticket) — a ticket with no real id can never be checked out, so
    // skip it entirely rather than fabricating one that would 404 at checkout.
    .filter((ticket) => ticket && ticket.name && ticket.id != null && String(ticket.id).trim())
    .map((ticket) => {
      const currency = ticket.currency ?? api.currency ?? 'INR';
      const effectivePrice = ticketEffectivePrice(ticket, fallbackPrice);
      return {
        id: String(ticket.id).trim(),
        name: ticket.name!,
        currency,
        effectivePrice,
        effectivePriceLabel: formatMoney(effectivePrice, currency),
      };
    });
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

  // Prefer the backend's own flags; fall back to capacity math only when it omits them.
  const isFull = api.is_full ?? (capacityRaw != null && registered >= capacityRaw);
  const registrationOpen = api.registration_open ?? true;
  const ticketOptions = buildTicketOptions(api, price);

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
    rawStatus: api.status,
    isFull,
    registrationOpen,
    ticketOptions,
    sessions: mapEventSessions(api.sessions),
    resources: mapEventDocuments(api.documents),
    deliveryMode: api.delivery_mode ?? '',
    deliveryModeLabel: deriveDeliveryModeLabel(api),
    startDate: start,
    endDate: end,
    timeZone: api.time_zone?.trim() || null,
    venueAddress: deriveVenueAddress(api),
    venueInstructions: api.venue?.instructions?.trim() || null,
    venueMapUrl: api.venue?.map_url?.trim() || null,
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

export type EventAvailabilityKind = 'available' | 'full' | 'closed' | 'cancelled' | 'completed';

export type EventAvailability = {
  kind: EventAvailabilityKind;
  /** Empty for "available" — no status banner needed in that case. */
  label: string;
};

/**
 * Single source of truth for what the customer can do right now, mirroring
 * the backend's own two-part gate (event_service.py, both
 * create_registration_service and create_event_checkout_service):
 * `status in [cancelled, completed, archived, suspended] → specific reason`,
 * then `status != "published" → generic "not open" reason`. Checking
 * `rawStatus !== 'published'` covers every one of those non-terminal
 * statuses (draft, pending_approval, suspended, archived, ...) without
 * having to enumerate them by hand.
 */
export function getEventAvailability(event: Event): EventAvailability {
  const rawStatus = (event.rawStatus ?? '').toLowerCase();

  if (rawStatus === 'cancelled') {
    return { kind: 'cancelled', label: 'Event Cancelled' };
  }
  if (rawStatus === 'completed') {
    return { kind: 'completed', label: 'Event Completed' };
  }
  if (rawStatus !== 'published') {
    return { kind: 'closed', label: 'Registration Closed' };
  }
  if (!(event.registrationOpen ?? true)) {
    return { kind: 'closed', label: 'Registration Closed' };
  }
  if (event.isFull ?? false) {
    return { kind: 'full', label: 'Event Full' };
  }
  return { kind: 'available', label: '' };
}

const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  attended: 'Attended',
  no_show: 'No-show',
};

function formatRegistrationStatus(status: string): string {
  const known = REGISTRATION_STATUS_LABELS[status];
  if (known) return known;
  const normalized = status.trim();
  if (!normalized) return 'NA';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * The backend has no single "upcoming/completed/cancelled" bucket — it returns
 * registration_status (confirmed|cancelled|attended|no_show), event_status
 * (draft|...|published|completed|cancelled|archived|...), and event_start.
 * Bucket derivation, in priority order:
 *  1. registration_status === "cancelled" → cancelled
 *  2. registration_status attended/no_show → completed (the event happened)
 *  3. event_status === "cancelled"/"archived" → cancelled (nothing to attend,
 *     even though the customer's own registration was never explicitly cancelled)
 *  4. event_status === "completed" → completed
 *  5. event_start already in the past → completed
 *  6. otherwise → upcoming
 */
function classifyMyEventBucket(
  registrationStatus: string,
  eventStatus: string | null,
  eventStart: Date | null,
): MyEventBucket {
  if (registrationStatus === 'cancelled') return 'cancelled';
  if (registrationStatus === 'attended' || registrationStatus === 'no_show') {
    return 'completed';
  }
  if (eventStatus === 'cancelled' || eventStatus === 'archived') return 'cancelled';
  if (eventStatus === 'completed') return 'completed';
  if (eventStart && eventStart.getTime() < Date.now()) return 'completed';
  return 'upcoming';
}

export function mapMyRegistrationApiToItem(
  api: EventMyRegistrationApiResponse,
): MyEventRegistration {
  const eventStart = safeParseDate(api.event_start);

  return {
    registrationId: String(api.registration_id),
    eventId: String(api.event_id),
    eventTitle: textOrNa(api.event_title),
    eventStatus: api.event_status ?? null,
    eventStart,
    eventStartLabel: formatEventDateTime(eventStart),
    registrationStatus: api.registration_status,
    registrationStatusLabel: formatRegistrationStatus(api.registration_status),
    hasQr: Boolean(api.qr_code),
    checkedInAt: safeParseDate(api.checked_in_at),
    bucket: classifyMyEventBucket(api.registration_status, api.event_status ?? null, eventStart),
  };
}

export function mapMyRegistrationsApiResponse(
  items: EventMyRegistrationApiResponse[],
): MyEventRegistration[] {
  return items.map(mapMyRegistrationApiToItem);
}

const WAITLIST_STATUS_LABELS: Record<MyWaitlistStatus, string> = {
  waiting: "You're on the waitlist",
  promoted: "You've been promoted",
  left: 'Left waitlist',
};

const KNOWN_WAITLIST_STATUSES = new Set<MyWaitlistStatus>(['waiting', 'promoted', 'left']);

function normalizeWaitlistStatus(status: string): MyWaitlistStatus {
  const normalized = status.trim().toLowerCase();
  return KNOWN_WAITLIST_STATUSES.has(normalized as MyWaitlistStatus)
    ? (normalized as MyWaitlistStatus)
    : 'waiting';
}

export function mapMyWaitlistApiToItem(api: MyWaitlistApiResponse): MyWaitlistEntry {
  const eventStart = safeParseDate(api.event_start_date);
  const status = normalizeWaitlistStatus(api.status);

  return {
    id: String(api.id),
    eventId: String(api.event_id),
    eventTitle: textOrNa(api.event_title),
    eventStatus: api.event_status ?? null,
    eventStart,
    eventStartLabel: formatEventDateTime(eventStart),
    status,
    statusLabel: WAITLIST_STATUS_LABELS[status],
    registrationId: api.registration_id != null ? String(api.registration_id) : null,
  };
}

export function mapMyWaitlistApiResponse(items: MyWaitlistApiResponse[]): MyWaitlistEntry[] {
  return items.map(mapMyWaitlistApiToItem);
}

/** Every renderer app/services/event_form_registry.py's CUSTOM_RENDERERS actually supports. */
const CUSTOM_FIELD_RENDERERS = new Set<EventFormFieldRenderer>([
  'text',
  'textarea',
  'number',
  'url',
  'date',
  'datetime',
  'select',
  'multi_select',
  'checkbox',
]);

// The app already collects these as dedicated Full Name / Email fields — if a
// configured custom field duplicates one of them by label, skip it rather
// than asking the same question twice.
const BUILT_IN_FIELD_LABEL_PATTERNS = [
  /^full ?name$/i,
  /^name$/i,
  /^participant ?name$/i,
  /^email( ?address)?$/i,
  /^participant ?email$/i,
];

function isBuiltInFieldLabel(label: string): boolean {
  const trimmed = label.trim();
  return BUILT_IN_FIELD_LABEL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function normalizeFormFieldOptions(raw: unknown): EventFormFieldOption[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): EventFormFieldOption | null => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        return trimmed ? { label: trimmed, value: trimmed } : null;
      }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const rawLabel = obj.label ?? obj.name ?? obj.value;
        const label = typeof rawLabel === 'string' ? rawLabel.trim() : String(rawLabel ?? '').trim();
        if (!label) return null;
        const rawValue = obj.value ?? obj.label ?? obj.name;
        const value = typeof rawValue === 'string' ? rawValue : String(rawValue ?? label);
        return { label, value };
      }
      return null;
    })
    .filter((option): option is EventFormFieldOption => option !== null)
    .map((option, index) => (option.value ? option : { ...option, value: `option-${index}` }));
}

function mapRegistrationFormField(api: EventFormFieldApiResponse): EventFormField | null {
  // Only "custom" fields are participant-facing registration questions —
  // "core" fields (category, venue, ticket_types, ...) describe the Event
  // itself and are already shown elsewhere in the app, not asked again here.
  if (api.source !== 'custom') return null;
  if (api.is_enabled === false) return null;
  if (isBuiltInFieldLabel(api.label ?? '')) return null;

  const renderer = CUSTOM_FIELD_RENDERERS.has(api.renderer as EventFormFieldRenderer)
    ? (api.renderer as EventFormFieldRenderer)
    : 'text';

  return {
    id: String(api.id),
    label: api.label?.trim() || 'Question',
    renderer,
    required: Boolean(api.required),
    placeholder: api.placeholder?.trim() || null,
    helpText: api.help_text?.trim() || null,
    options: normalizeFormFieldOptions(api.options),
    validation:
      api.validation && typeof api.validation === 'object' ? api.validation : {},
  };
}

function mapRegistrationFormSection(
  api: EventFormSectionApiResponse,
): EventFormSection | null {
  if (api.is_enabled === false) return null;

  const fields = (api.fields ?? [])
    .map(mapRegistrationFormField)
    .filter((field): field is EventFormField => field !== null);

  if (fields.length === 0) return null;

  return {
    id: String(api.id),
    label: api.label?.trim() || '',
    fields,
  };
}

/**
 * Maps GET /events/{id}/registration-form into the sections/fields the
 * mobile form renders. Order is preserved exactly as returned — the backend
 * (normalize_sections) already sorts sections and fields by "position".
 */
export function mapEventRegistrationForm(
  api: EventRegistrationFormApiResponse,
): EventRegistrationForm {
  const sections = (api.sections ?? [])
    .map(mapRegistrationFormSection)
    .filter((section): section is EventFormSection => section !== null);

  return { sections };
}

/**
 * "HH:MM" (24-hour, possibly "24:00" — the CM_Web session editor allows it as
 * end-of-day) wall-clock string → "2:00 PM" label. Sessions' start_time/
 * end_time are plain time-of-day strings with no date/timezone component
 * (HTML <input type="time"> on the admin side), so none of the existing
 * Date-based formatters in dateTime.ts apply — this is intentionally a small
 * local parser rather than routing through Date/parseApiDate.
 */
function formatTimeOfDay(time?: string | null): string | null {
  if (!time) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 24 || minute > 59) {
    return null;
  }
  if (hour === 24) {
    hour = 0;
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function buildSessionDateTimeLabel(session: EventSessionApiResponse): string {
  // session_date is a date-only string (YYYY-MM-DD, no time/timezone) — safe
  // to parse as UTC midnight and display in IST, since IST is ahead of UTC
  // and can only push the displayed calendar date forward within the same day.
  const date = safeParseDate(session.session_date);
  const dateLabel = date ? formatISTShortDate(date) : null;
  const startLabel = formatTimeOfDay(session.start_time);
  const endLabel = formatTimeOfDay(session.end_time);
  const timeLabel = startLabel && endLabel ? `${startLabel} – ${endLabel}` : startLabel;

  if (dateLabel && timeLabel) return `${dateLabel} · ${timeLabel}`;
  if (dateLabel) return dateLabel;
  if (timeLabel) return timeLabel;
  return 'Time TBA';
}

function mapEventSession(
  session: EventSessionApiResponse,
  index: number,
): EventSessionSummary | null {
  const title = session.title?.trim();
  if (!title) return null;

  return {
    id: session.id ? String(session.id) : `session-${index}`,
    title,
    speaker: session.speaker?.trim() || null,
    location: session.location?.trim() || null,
    dateTimeLabel: buildSessionDateTimeLabel(session),
    // Boolean signal only — see EventSessionSummary's doc comment for why the
    // raw session.meeting_link is never carried past this function.
    hasMeetingInfo: Boolean(session.meeting_link?.trim()),
  };
}

/** Maps the sessions embedded on GET /events/{id} (event.sessions) into the agenda the app renders. Respects backend ordering — sessions are already sorted server-side (event_service.py, _sort_sessions). */
export function mapEventSessions(
  sessions?: EventSessionApiResponse[] | null,
): EventSessionSummary[] {
  if (!Array.isArray(sessions)) return [];
  return sessions
    .map((session, index) => mapEventSession(session, index))
    .filter((session): session is EventSessionSummary => session !== null);
}

/**
 * Each raw document entry is untyped JSONB (app/models/event_model.py,
 * `documents` column) — the CM_Web builder's composite field allows a plain
 * URL string or an object with url/upload/title subfields, so parse
 * defensively rather than assuming one shape (same approach as
 * normalizeFormFieldOptions above).
 */
function mapEventDocument(raw: unknown, index: number): EventResource | null {
  if (typeof raw === 'string') {
    const url = raw.trim();
    return url ? { id: `doc-${index}`, title: 'Document', type: null, url } : null;
  }

  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const rawUrl = obj.url ?? obj.link;
    const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    if (!url) return null;

    const rawTitle = obj.title ?? obj.name;
    const title = typeof rawTitle === 'string' && rawTitle.trim() ? rawTitle.trim() : 'Document';
    const rawType = obj.type;
    const type = typeof rawType === 'string' && rawType.trim() ? rawType.trim() : null;
    const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : `doc-${index}`;

    return { id, title, type, url };
  }

  return null;
}

/** Maps the raw `documents` JSONB list embedded on GET /events/{id} into the Resources section. No backend visibility/access-control field exists on this field today — every item returned is already public on a published event. */
export function mapEventDocuments(documents?: unknown[] | null): EventResource[] {
  if (!Array.isArray(documents)) return [];
  return documents
    .map((doc, index) => mapEventDocument(doc, index))
    .filter((doc): doc is EventResource => doc !== null);
}

/**
 * Maps GET /events/{id}/meeting-link's 200 response. This function is only
 * ever called with a response that already passed the backend's own
 * registered-participant/admin/provider check — see event.service.ts,
 * getMeetingLink.
 */
export function mapEventMeetingLink(api: EventMeetingLinkApiResponse): EventMeetingAccess {
  const link = api.meeting_link?.trim();
  return {
    meetingLink: link ? link : null,
    meetingProvider: api.meeting_provider?.trim() || null,
  };
}
