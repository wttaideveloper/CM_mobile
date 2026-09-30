import type {
  EventModules,
  EventResource,
  EventSessionSummary,
  EventTicketOption,
} from '@/types/event.types';

/** Normalized meal option — id/active passthrough from the API; description/date default to null; date is pre-formatted for display (mirrors dateTime/schedule elsewhere on Event), matching option.active semantics (false = retired, kept for history). */
export type EventMealOption = {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  active: boolean;
};

export type EventMeals = {
  enabled: boolean;
  options: EventMealOption[];
};

export const EVENT_FILTERS = ['All', 'Upcoming', 'This Week', 'Online', 'Free'] as const;

export type EventFilterTag = 'upcoming' | 'thisWeek' | 'online' | 'free';

export type Event = {
  id: string;
  name: string;
  priceLabel: string;
  isFree: boolean;
  dateTime: string;
  location: string;
  image: string;
  filterTags: EventFilterTag[];
  isFeatured?: boolean;
  detailTitle: string;
  status: string;
  schedule: string;
  registered: number;
  capacity: number;
  priceDetail: string;
  description: string;
  detailImage: string;
  organizer: string;
  organizerInitial: string;
  speakerInitials: string[];
  additionalSpeakers: number;
  /** Raw backend status (e.g. "published", "cancelled") — `status` above is a display label. */
  rawStatus?: string;
  /** From the API when present; falls back to capacity math when null (see event.mapper.ts). */
  isFull?: boolean;
  /** From the API's registration_open flag when present; defaults to true when null. */
  registrationOpen?: boolean;
  /** Empty when the event has no ticket_types — checkout falls back to the flat event price. */
  ticketOptions?: EventTicketOption[];
  /** Agenda/session list (Phase 5C) — empty when the event has no sessions. */
  sessions?: EventSessionSummary[];
  /** Documents/resources attached to the event (Phase 5C) — empty when none. */
  resources?: EventResource[];
  /** Raw backend delivery_mode ("in_person"|"online"|"hybrid") — decides which detail sections apply. */
  deliveryMode?: string;
  /** Human-readable delivery mode label ("In Person"|"Online"|"Hybrid"). */
  deliveryModeLabel?: string;
  /** Combined venue address + city, only set when the event has an in-person/hybrid venue. */
  venueAddress?: string | null;
  /** Venue arrival/joining instructions, when the backend provides them. */
  venueInstructions?: string | null;
  /** External map link for the venue, when the backend provides one. */
  venueMapUrl?: string | null;
  /** Parsed start_date (Phase 5D-1) — null when the backend omitted it or it failed to parse. */
  startDate?: Date | null;
  /** Parsed end_date (Phase 5D-1) — null when the backend omitted it or it failed to parse. */
  endDate?: Date | null;
  /** Backend's time_zone label (e.g. "Asia/Kolkata") — display-only; see eventCalendar.ts for why it isn't applied as an offset. */
  timeZone?: string | null;
  /** Dynamic Event Type key (Phase 2) — "other" for legacy events, resolved server-side. Resolve to a display name via useEventTypes(), never a hardcoded map. */
  eventType: string;
  /** Event-level capability flags (Phase 2) — always fully populated by the mapper. Read via isModuleEnabled(event, key) from utils/eventModules.ts, never inferred from other fields. */
  modules: EventModules;
  /** Meals configuration (Phase 7) — always fully populated by the mapper ({enabled:false, options:[]} for legacy/unconfigured events). Gate visibility with isModuleEnabled(event, 'meals'), not options.length. */
  meals: EventMeals;
};
