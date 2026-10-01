/**
 * GET /api/v1/events/{id}/registration-form — reuses the backend's event
 * form-configuration model (app/services/event_form_config_service.py,
 * build_active_response/normalize_sections). "core" fields describe the
 * Event itself (category, venue, ticket_types, ...) and are not rendered as
 * registration questions; only source === "custom" fields are.
 */
export type EventFormFieldApiResponse = {
  id: string;
  source: string;
  core_key?: string | null;
  stable_key?: string | null;
  label: string;
  renderer: string;
  value_type?: string | null;
  required: boolean;
  is_enabled: boolean;
  position: number;
  placeholder?: string | null;
  help_text?: string | null;
  options?: unknown[] | null;
  validation?: Record<string, unknown> | null;
};

export type EventFormSectionApiResponse = {
  id: string;
  label?: string | null;
  description?: string | null;
  position: number;
  is_enabled: boolean;
  fields: EventFormFieldApiResponse[];
};

export type EventRegistrationFormApiResponse = {
  configuration_id?: string | null;
  version_id?: string | null;
  name?: string | null;
  scope?: string | null;
  version?: number | null;
  sections: EventFormSectionApiResponse[];
  configuration_version?: string | null;
};

/**
 * Every renderer the backend's custom-field builder actually supports
 * (app/services/event_form_registry.py, CUSTOM_RENDERERS) — anything else
 * returned by the API falls back to "text" rather than being invented.
 */
export type EventFormFieldRenderer =
  | 'text'
  | 'textarea'
  | 'number'
  | 'url'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multi_select'
  | 'checkbox';

export type EventFormFieldOption = {
  label: string;
  value: string;
};

/** Normalized shape the registration form renders. */
export type EventFormField = {
  id: string;
  label: string;
  renderer: EventFormFieldRenderer;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  options: EventFormFieldOption[];
  validation: Record<string, unknown>;
};

export type EventFormSection = {
  id: string;
  label: string;
  fields: EventFormField[];
};

export type EventRegistrationForm = {
  sections: EventFormSection[];
};

/** One dynamic field's current form value — shape depends on the field's renderer. */
export type EventFormFieldValue = string | boolean | string[];

export type EventTicketTypeApiResponse = {
  id?: string | null;
  name?: string | null;
  price?: string | null;
  currency?: string | null;
  capacity?: number | null;
  early_bird_price?: string | null;
  early_bird_until?: string | null;
  promo_price?: string | null;
  description?: string | null;
};

export type EventVenue = {
  address?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  instructions?: string | null;
  map_url?: string | null;
};

export type EventSessionApiResponse = {
  id?: string;
  session_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  title?: string | null;
  speaker?: string | null;
  location?: string | null;
  meeting_link?: string | null;
};

/**
 * Event-level operational capability flags (Phase 2 foundation). The
 * backend is the sole source of truth — `registration` is unconditionally
 * mandatory (forced true server-side on every read, rejected if a write
 * ever tries to set it false) and every key is always present in a real
 * API response, fully resolved server-side even for legacy events with
 * nothing explicitly stored (see EventApiResponse.modules doc comment).
 * Do not add module keys beyond what the backend defines.
 */
export type EventModules = {
  registration: boolean;
  tickets: boolean;
  sessions: boolean;
  check_in: boolean;
  online_meeting: boolean;
  custom_questions: boolean;
  meals: boolean;
  accommodation: boolean;
};

/**
 * One meal option (backend app/schemas/event_meal_schema.py MealOption,
 * Phase 2.8). `active: false` = retired by the organizer — kept for
 * history/existing selections, never offered as a new choice. Pricing/
 * capacity/window fields are all optional-with-safe-defaults server-side
 * (an option created before Phase 2.8 prices as free/unlimited/always-open)
 * — never guess a value here when a field is absent; use the mapper's
 * defaults (0 price, null capacity, no window) instead.
 */
export type EventMealOptionApiResponse = {
  id: string;
  name: string;
  description?: string | null;
  date?: string | null;
  active: boolean;
  /** Price per selection; 0 for a free option. Never compute this client-side. */
  price?: number | null;
  currency?: string | null;
  /** Maximum selections allowed across all attendees. null = unlimited. */
  capacity?: number | null;
  /** Confirmed/attended registrations currently holding this option. null when capacity is unlimited (not computed). */
  reserved_count?: number | null;
  /** null = unlimited. The backend is authoritative — never derive this from reserved_count/capacity client-side. */
  remaining_capacity?: number | null;
  /** Authoritative sold-out flag from the backend — never infer this from remaining_capacity being 0 vs reading it directly, and never compute it locally. */
  sold_out?: boolean | null;
  /** When attendees may start selecting this option. null = always open. */
  purchase_start_at?: string | null;
  /** When attendees may no longer newly select this option. null = always open. An option already held stays visible past this. */
  purchase_end_at?: string | null;
  /** Informational/fulfilment only — when the meal is actually served. */
  service_start_at?: string | null;
  service_end_at?: string | null;
};

/**
 * Event.meals (backend EventMeals) — `enabled` mirrors `modules.meals`
 * exactly; never the capability check itself (use isModuleEnabled).
 */
export type EventMealsApiResponse = {
  enabled: boolean;
  options: EventMealOptionApiResponse[];
};

/**
 * One accommodation option (backend app/schemas/event_accommodation_schema.py
 * AccommodationOption, Phase 2.8) — identical shape to a meal option minus
 * `date`. `active: false` = retired by the organizer. See
 * EventMealOptionApiResponse's doc comment for the pricing/window fields —
 * identical semantics and defaults here.
 */
export type EventAccommodationOptionApiResponse = {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  price?: number | null;
  currency?: string | null;
  capacity?: number | null;
  reserved_count?: number | null;
  remaining_capacity?: number | null;
  sold_out?: boolean | null;
  purchase_start_at?: string | null;
  purchase_end_at?: string | null;
  service_start_at?: string | null;
  service_end_at?: string | null;
};

/**
 * Event.accommodation (backend EventAccommodation) — `enabled` mirrors
 * `modules.accommodation` exactly; never the capability check itself.
 */
export type EventAccommodationApiResponse = {
  enabled: boolean;
  options: EventAccommodationOptionApiResponse[];
};

/**
 * GET /api/v1/event-types/ — the dynamic, DB-backed Event Type registry
 * (Phase 2 foundation). `key` is the stable identifier that matches
 * EventApiResponse.event_type (immutable once created); `name` is the
 * display label. Public, unauthenticated endpoint; defaults to
 * active-only unless `include_inactive` is requested.
 */
export type EventTypeApiResponse = {
  id: string;
  key: string;
  name: string;
  active: boolean;
  default_modules: EventModules;
  allowed_modules: EventModules;
  required_modules: EventModules;
};

export type EventTypeListQuery = {
  /** Existing Events may reference a since-deactivated type and must still resolve/display correctly — pass this when resolving a specific event's type, not when offering a picker. */
  include_inactive?: boolean;
};

/**
 * Shape of a single item returned by GET /api/v1/events/ and GET /api/v1/events/{id}.
 * `enterprise_name` is only present on the detail response but is safe to type as
 * optional on both since the list response simply omits it.
 */
export type EventApiResponse = {
  id: string;
  tenant_id?: string | null;
  enterprise_id?: string | null;
  location_id?: string | null;
  title: string;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  tags?: string[] | null;
  organiser_name?: string | null;
  organiser_contact?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  registration_cutoff?: string | null;
  registration_open_at?: string | null;
  registration_close_at?: string | null;
  duration_type?: string | null;
  time_zone?: string | null;
  primary_image?: string | null;
  gallery_images?: string[] | null;
  videos?: string[] | null;
  documents?: string[] | null;
  delivery_mode?: string | null;
  delivery_mode_display?: string | null;
  venue?: EventVenue | null;
  meeting_link?: string | null;
  meeting_provider?: string | null;
  /** Backend returns price/capacity as strings — parse before using as a number. */
  price?: string | null;
  currency?: string | null;
  ticket_types?: EventTicketTypeApiResponse[] | null;
  capacity?: string | null;
  min_participants?: string | null;
  max_participants?: string | null;
  custom_fields?: unknown[] | null;
  custom_values?: unknown[] | null;
  form_configuration_id?: string | null;
  form_configuration_version_id?: string | null;
  sessions?: EventSessionApiResponse[] | null;
  status: string;
  /**
   * Dynamic Event Type key (Phase 2) — resolves against GET /event-types/.
   * The backend always returns a non-empty string here, "other" for
   * legacy events with nothing stored — never actually null in practice,
   * but typed defensively since Mobile must not crash on older/cached
   * response shapes.
   */
  event_type?: string | null;
  /**
   * Event-level module/capability flags (Phase 2). The backend always
   * resolves a fully-populated object here (including for legacy events,
   * via its own behavior-derived fallback) — never actually null/missing
   * in practice, but typed defensively for the same reason as event_type.
   * This is the sole source of truth for capability gating; see
   * utils/eventModules.ts isModuleEnabled().
   */
  modules?: EventModules | null;
  /**
   * Event-level meals configuration (Phase 2.6). Always resolved server-side
   * (`{enabled:false, options:[]}` for legacy/never-configured events) —
   * typed optional/nullable defensively, same reasoning as event_type/modules.
   */
  meals?: EventMealsApiResponse | null;
  /**
   * Event-level accommodation configuration (Phase 2.7). Same resolution
   * behavior as meals — always resolved server-side, typed defensively.
   */
  accommodation?: EventAccommodationApiResponse | null;
  is_deleted?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  requires_reapproval?: boolean | null;
  last_admin_notes?: string | null;
  available_seats?: number | null;
  is_full?: boolean | null;
  registration_open?: boolean | null;
  /** Detail response only. */
  enterprise_name?: string | null;
};

export type EventPagination = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type EventsPaginatedApiResponse = {
  items: EventApiResponse[];
  pagination: EventPagination;
};

export type EventListQuery = {
  status?: string;
  page?: number;
  page_size?: number;
};

/** Body for POST /api/v1/events/{id}/registrations — free/individual registration only (Phase 1). */
export type EventRegistrationRequest = {
  participant_name: string;
  participant_email: string;
  /**
   * Answers to the event's dynamic registration questions (Phase 5B),
   * keyed by field id — matches EventRegistrationCreate.custom_fields on the
   * backend ("Custom fields / participant questions", a free-form dict with
   * no server-side shape validation for this endpoint).
   */
  custom_fields?: Record<string, string | boolean | string[]>;
  /**
   * Meal option ids from the event's meals configuration (backend
   * EventRegistrationCreate.meal_selections, Phase 2.6) — only meaningful
   * when modules.meals is enabled; omit rather than send an empty array
   * when nothing was selected.
   */
  meal_selections?: string[];
  /**
   * Accommodation option ids (backend EventRegistrationCreate.
   * accommodation_selections, Phase 2.7) — only meaningful when
   * modules.accommodation is enabled; omit rather than send an empty
   * array when nothing was selected.
   */
  accommodation_selections?: string[];
};

/**
 * The endpoint has no declared response_model on the backend (returns the raw
 * EventRegistration ORM row), so every field here is optional/unverified —
 * parse defensively, mirroring TrainingEnrollmentResult in training.types.ts.
 */
export type EventRegistrationApiResponse = {
  id?: string;
  event_id?: string;
  participant_name?: string | null;
  participant_email?: string | null;
  status?: string | null;
  qr_code?: string | null;
  created_at?: string | null;
} & Record<string, unknown>;

/** Normalized shape the app actually relies on, after defensive parsing. */
export type EventRegistrationResult = {
  id: string | null;
  status: string;
  qrCode: string | null;
};

/**
 * One registration's meal selection as returned by GET /my/registrations
 * (backend AttendeeMealSelection, Phase 2.8). `price`/`currency` are the
 * PURCHASE-TIME snapshot (from the EventRegistrationOption line item, not
 * the option's current live price) — null only when this selection predates
 * Phase 2.8 or was never a paid line item. `status: "confirmed"` means a
 * real purchase-time snapshot backs it; `"selected"` means it doesn't (a
 * pre-2.8 selection, or a legacy/free one) — never treat "selected" as a
 * confirmed purchase.
 */
export type AttendeeMealSelectionApiResponse = {
  meal_id: string;
  name: string | null;
  active: boolean;
  price: number | null;
  currency: string | null;
  service_start_at: string | null;
  service_end_at: string | null;
  status: 'confirmed' | 'selected';
};

/** Same shape as AttendeeMealSelectionApiResponse, keyed by accommodation_id instead of meal_id. */
export type AttendeeAccommodationSelectionApiResponse = {
  accommodation_id: string;
  name: string | null;
  active: boolean;
  price: number | null;
  currency: string | null;
  service_start_at: string | null;
  service_end_at: string | null;
  status: 'confirmed' | 'selected';
};

/**
 * Shape of one item returned by GET /api/v1/events/my/registrations.
 * This endpoint has no response_model either, but (unlike the raw ORM
 * object POST /registrations returns) the service already builds plain
 * dicts with these exact keys — see app/services/event_service.py,
 * my_registrations_service. meal_selections/accommodation_selections were
 * added in Phase 2.8 — this endpoint still returns no ticket price/order
 * total (that only ever existed transiently in the checkout response), so
 * do not invent one.
 */
export type EventMyRegistrationApiResponse = {
  registration_id: string;
  event_id: string;
  event_title: string | null;
  event_status: string | null;
  event_start: string | null;
  registration_status: string;
  qr_code: string | null;
  checked_in_at: string | null;
  meal_selections?: AttendeeMealSelectionApiResponse[];
  accommodation_selections?: AttendeeAccommodationSelectionApiResponse[];
};

/** Bucket derived client-side — the backend has no single "upcoming/completed/cancelled" field. */
export type MyEventBucket = 'upcoming' | 'completed' | 'cancelled';

/**
 * One purchased/selected meal or accommodation option, normalized for
 * display on the Ticket screen (Phase 2.8). `priceLabel` is null when
 * `isConfirmedPurchase` is false — only a confirmed purchase has a real
 * purchase-time price snapshot to show; never fall back to a live option
 * price here (this list has no access to the event's current config, by
 * design — it is a record of what was actually purchased, not a preview).
 */
export type PurchasedOption = {
  id: string;
  name: string;
  /** False for a pre-Phase-2.8/legacy selection with no purchase-time snapshot — see AttendeeMealSelectionApiResponse's doc comment. */
  isConfirmedPurchase: boolean;
  priceLabel: string | null;
};

/** Normalized shape the app renders for "My Events". */
export type MyEventRegistration = {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  eventStatus: string | null;
  eventStart: Date | null;
  eventStartLabel: string;
  registrationStatus: string;
  registrationStatusLabel: string;
  hasQr: boolean;
  checkedInAt: Date | null;
  bucket: MyEventBucket;
  /** Phase 2.8 — empty when meals aren't configured for this event or none were selected. */
  mealSelections: PurchasedOption[];
  accommodationSelections: PurchasedOption[];
};

export type EventCancelRegistrationResponse = {
  message: string;
};

/** A ticket option as shown on the checkout screen — normalized from EventTicketTypeApiResponse. */
export type EventTicketOption = {
  /** '' means "no ticket types on this event — use its flat price" (matches the backend's own fallback in _resolve_ticket). */
  id: string;
  name: string;
  currency: string;
  /** Early-bird/promo already applied — mirrors the backend's _ticket_effective_price, for preview only. */
  effectivePrice: number;
  effectivePriceLabel: string;
  /**
   * This ticket type's configured limit (backend event_schema.py
   * EventTicketType.capacity) — informational only. The backend enforces
   * this per-type at checkout (create_event_checkout_service) but never
   * returns how many are already sold/remaining, so this cannot be used to
   * proactively compute "N left" or sold-out state without guessing; null
   * when the type has no configured limit.
   */
  capacity: number | null;
};

/** Body for POST /api/v1/events/{id}/checkout — paid registration (Phase 3). Quantity fixed at 1. */
export type EventCheckoutRequest = {
  participant_name: string;
  participant_email: string;
  ticket_type_id: string;
  quantity: number;
  payment_provider?: string;
  waitlist_id?: string;
  /**
   * Meal option ids to purchase alongside the ticket (backend
   * EventCheckoutRequest.meal_selections, Phase 2.8) — option ids only,
   * never a price or quantity; the backend re-resolves every price from
   * its own stored configuration. Omit rather than send an empty array
   * when nothing was selected, same convention as EventRegistrationRequest.
   */
  meal_selections?: string[];
  accommodation_selections?: string[];
};

/**
 * Body for POST /api/v1/events/{id}/checkout/quote (Phase 2.8) — a pure
 * price preview, nothing is written or reserved. Same shape as
 * EventCheckoutRequest minus buyer identity/payment provider/waitlist,
 * since a quote creates nothing. Option ids only — never send a price.
 */
export type EventCheckoutQuoteRequest = {
  ticket_type_id: string;
  quantity: number;
  meal_selections?: string[];
  accommodation_selections?: string[];
};

/** One priced line of a checkout quote (backend EventCheckoutQuoteLine). */
export type EventCheckoutQuoteLineApiResponse = {
  option_type: string;
  option_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  currency: string;
};

/**
 * Response of POST /api/v1/events/{id}/checkout/quote — the authoritative
 * price breakdown checkout would charge. discount/tax are always 0 today
 * (no such concept exists on the backend yet) — display them as given,
 * never assume they'll stay 0. grand_total is the ONLY value the app may
 * show as "the total due" — never sum the subtotals client-side instead.
 */
export type EventCheckoutQuoteApiResponse = {
  ticket_subtotal: number;
  meal_subtotal: number;
  accommodation_subtotal: number;
  discount: number;
  tax: number;
  grand_total: number;
  currency: string;
  items: EventCheckoutQuoteLineApiResponse[];
};

/**
 * Normalized checkout quote — every *_label field is the already-formatted
 * (formatMoney) string, matching EventTicketOption's effectivePriceLabel
 * convention. grandTotal/grandTotalLabel are the ONLY values the app may
 * display as "the total due" — never derive a total from the subtotals.
 */
export type EventCheckoutQuote = {
  ticketSubtotalLabel: string;
  mealSubtotalLabel: string;
  accommodationSubtotalLabel: string;
  discountLabel: string;
  taxLabel: string;
  grandTotal: number;
  grandTotalLabel: string;
  currency: string;
};

/**
 * Response of POST /api/v1/events/{id}/checkout. Unlike the free-registration
 * endpoint, this one has a real response_model (EventOrderResponse, backend
 * event_schema.py) — safe to type directly, no defensive parsing needed.
 */
/** Body for POST /api/v1/events/{id}/waitlist. */
export type EventWaitlistJoinRequest = {
  participant_name: string;
  participant_email: string;
};

/**
 * Response of POST /api/v1/events/{id}/waitlist. No response_model on the
 * backend (returns the raw EventWaitlist ORM row) — same class of risk as
 * the free-registration endpoint, so parse defensively.
 */
export type EventWaitlistApiResponse = {
  id?: string;
  event_id?: string;
  participant_name?: string | null;
  participant_email?: string | null;
  created_at?: string | null;
} & Record<string, unknown>;

export type EventWaitlistEntryResult = {
  id: string | null;
};

export type MyWaitlistStatus = 'waiting' | 'payment_pending' | 'promoted' | 'expired' | 'left';

/**
 * Response of GET /api/v1/events/my/waitlist — has a real response_model
 * (list[MyWaitlistResponse], event_schema.py) so it can be trusted directly,
 * unlike the join/leave endpoints.
 */
export type MyWaitlistApiResponse = {
  id: string;
  event_id: string;
  event_title: string | null;
  event_status: string | null;
  event_start_date: string | null;
  participant_name: string;
  participant_email: string;
  status: string;
  registration_id: string | null;
  payment_offer_expires_at: string | null;
  created_at: string;
};

/** Normalized shape the app renders for "My Waitlist". */
export type MyWaitlistEntry = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventStatus: string | null;
  eventStart: Date | null;
  eventStartLabel: string;
  status: MyWaitlistStatus;
  statusLabel: string;
  /** Only set once status is "promoted" — the real registration created by the backend promotion. */
  registrationId: string | null;
  paymentOfferExpiresAt: Date | null;
};

export type EventOrderApiResponse = {
  id: string;
  event_id: string;
  participant_name: string;
  participant_email: string;
  ticket_type_id: string | null;
  quantity: number;
  amount: string;
  currency: string;
  payment_status: string;
  status: string;
  created_at: string | null;
};

/**
 * Normalized agenda item rendered on Event Detail (Phase 5C). Derived from
 * EventApiResponse.sessions (embedded on GET /events/{id} — same data as the
 * dedicated GET /{id}/sessions endpoint, event_service.py get_sessions_service).
 * `hasMeetingInfo` is a boolean-only signal: the raw per-session meeting_link
 * is intentionally discarded during mapping and never held past
 * mapEventSession's local scope — GET /{id}/sessions has no registration
 * check, so surfacing the raw link here would leak it to any authenticated
 * user regardless of registration status (see event.mapper.ts).
 */
export type EventSessionSummary = {
  id: string;
  title: string;
  speaker: string | null;
  location: string | null;
  dateTimeLabel: string;
  hasMeetingInfo: boolean;
};

/**
 * Normalized resource/document rendered on Event Detail (Phase 5C). Derived
 * from EventApiResponse.documents — a raw, untyped JSONB list (no backend
 * schema, no visibility/access-control field, unlike Training's
 * notes_documents) returned as-is by the unauthenticated GET /events/{id}.
 */
export type EventResource = {
  id: string;
  title: string;
  type: string | null;
  url: string;
};

/**
 * GET /api/v1/events/{id}/meeting-link — registered-participant/admin/
 * provider only (event_service.py get_meeting_link_service, 403 otherwise).
 * No response_model on the backend; shape here matches the service's literal
 * return dict.
 */
export type EventMeetingLinkApiResponse = {
  event_id?: string;
  meeting_link?: string | null;
  meeting_provider?: string | null;
  delivery_mode?: string | null;
};

/**
 * Normalized result of a successful, AUTHORIZED meeting-link fetch. Only
 * ever constructed from GET /{id}/meeting-link's 200 response — a 403 from
 * that endpoint surfaces as a query error and never reaches this type (see
 * useEventMeetingLink / EventMeetingSection). This is the only place in the
 * app that ever holds a real meeting URL.
 */
export type EventMeetingAccess = {
  meetingLink: string | null;
  meetingProvider: string | null;
};

/**
 * Body for POST /api/v1/events/{id}/contact (Phase 5D-2). The backend
 * (event_service.py, contact_organiser_service) reads only `payload.get("message")`
 * (falling back to "text", but this app always sends "message"); no other
 * field is read from the request body — the sender's identity comes from
 * the authenticated user server-side, not the payload.
 */
export type EventContactOrganizerRequest = {
  message: string;
};

/**
 * No response_model on the backend — contact_organiser_service returns a
 * raw dict `{message, event_id, organiser}`. `organiser` (the organiser's
 * raw contact string) is intentionally never read by the app — see
 * EventContactOrganizerResult's doc comment.
 */
export type EventContactOrganizerApiResponse = {
  message?: string;
  event_id?: string;
} & Record<string, unknown>;

/**
 * Normalized result. Deliberately omits the backend's `organiser` field
 * (the organiser's raw email/phone) — the backend already relays the
 * message itself (best-effort email + in-app notification,
 * notification_triggers.py `_safe_notify`), so the app has no need to
 * surface that contact string to the customer.
 */
export type EventContactOrganizerResult = {
  message: string;
};

/**
 * Body for POST /api/v1/events/{id}/feedback and POST /api/v1/events/{id}/reviews
 * (Phase 5D-3) — both routes are backed by the identical create_feedback_service
 * and accept the same fields; only `is_review` (decided by which URL is called,
 * not by the body) differs. `participant_email` is read by the backend for
 * both, but is only REQUIRED — and checked against a confirmed/attended
 * registration — on the "reviews" endpoint. `rating` is stored as an
 * unvalidated string (EventFeedback.rating: String(10)) and `comment` as
 * unvalidated free text — the backend enforces no scale or length on either.
 */
export type EventFeedbackRequest = {
  participant_email?: string;
  rating?: string;
  comment?: string;
};

/**
 * No response_model on the backend — create_feedback_service returns the
 * raw EventFeedback ORM row. Parse defensively, same class of risk as
 * register()/joinWaitlist().
 */
export type EventFeedbackApiResponse = {
  id?: string;
  event_id?: string;
  participant_email?: string | null;
  rating?: string | null;
  comment?: string | null;
  is_review?: boolean | null;
  moderation_status?: string | null;
  created_at?: string | null;
} & Record<string, unknown>;

export type EventFeedbackResult = {
  id: string | null;
  isReview: boolean;
};
