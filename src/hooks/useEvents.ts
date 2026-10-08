import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { eventService, EVENT_PAGE_SIZE } from '@/services/event.service';
import type { ApiError } from '@/types/api.types';
import type { Event } from '@/constants/events';
import type {
  EventCancelRegistrationResponse,
  EventCheckoutQuote,
  EventCheckoutRequest,
  EventContactOrganizerRequest,
  EventContactOrganizerResult,
  EventFeedbackRequest,
  EventFeedbackResult,
  EventMeetingAccess,
  EventOrderApiResponse,
  EventRegistrationForm,
  EventRegistrationRequest,
  EventRegistrationResult,
  EventWaitlistEntryResult,
  EventWaitlistJoinRequest,
  MyEventRegistration,
  MyWaitlistEntry,
} from '@/types/event.types';

export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
  registrationForm: (eventId: string) =>
    [...eventKeys.all, 'registration-form', eventId] as const,
  myRegistrations: (status?: string) =>
    [...eventKeys.all, 'my-registrations', status ?? 'all'] as const,
  myWaitlist: (status?: string) =>
    [...eventKeys.all, 'my-waitlist', status ?? 'all'] as const,
  registrationQr: (eventId: string, registrationId: string) =>
    [...eventKeys.all, 'qr', eventId, registrationId] as const,
  meetingLink: (eventId: string) => [...eventKeys.all, 'meeting-link', eventId] as const,
  checkoutQuote: (
    eventId: string,
    ticketTypeId: string,
    quantity: number,
    mealKey: string,
    accommodationKey: string,
  ) => [...eventKeys.all, 'checkout-quote', eventId, ticketTypeId, quantity, mealKey, accommodationKey] as const,
};

type UseEventsOptions = Omit<UseQueryOptions<Event[], ApiError>, 'queryKey' | 'queryFn'>;

export function useEvents(options?: UseEventsOptions) {
  return useQuery<Event[], ApiError>({
    queryKey: eventKeys.list(),
    queryFn: () => eventService.getList({ page: 1, page_size: EVENT_PAGE_SIZE }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });
}

type UseEventOptions = Omit<UseQueryOptions<Event, ApiError>, 'queryKey' | 'queryFn'>;

export function useEvent(id: string, options?: UseEventOptions) {
  const query = useQuery<Event, ApiError>({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });

  return {
    ...query,
    event: query.data,
  };
}

/**
 * GET /api/v1/events/{id}/registration-form — the event's dynamic
 * registration questions (Phase 5B). Form config changes rarely, so it's
 * cached longer than event/registration data.
 */
export function useEventRegistrationForm(eventId: string, options?: { enabled?: boolean }) {
  const query = useQuery<EventRegistrationForm, ApiError>({
    queryKey: eventKeys.registrationForm(eventId),
    queryFn: () => eventService.getRegistrationForm(eventId),
    enabled: Boolean(eventId) && (options?.enabled ?? true),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
  });

  return {
    ...query,
    form: query.data ?? null,
  };
}

/**
 * GET /api/v1/events/{id}/meeting-link — the event's protected meeting link
 * (Phase 5C). Deliberately cached far shorter than every other Events query:
 * staleTime 0 means eligibility is re-checked on every mount rather than
 * served from a stale cache, and a short gcTime drops the fetched URL from
 * memory soon after nothing is reading it. Only network failures (statusCode
 * 0) are retried — a 403 means "not eligible" and retrying changes nothing.
 */
export function useEventMeetingLink(eventId: string, options?: { enabled?: boolean }) {
  return useQuery<EventMeetingAccess, ApiError>({
    queryKey: eventKeys.meetingLink(eventId),
    queryFn: () => eventService.getMeetingLink(eventId),
    enabled: Boolean(eventId) && (options?.enabled ?? true),
    staleTime: 0,
    gcTime: 30_000,
    retry: (failureCount, error) => error.statusCode === 0 && failureCount < 1,
  });
}

/**
 * Lazy fetch a session meeting link on demand.
 */
export function useJoinSessionMeeting() {
  return useMutation<EventMeetingAccess, ApiError, { eventId: string; sessionId: string }>({
    mutationFn: ({ eventId, sessionId }) => eventService.getSessionMeetingLink(eventId, sessionId),
  });
}

/** POST /api/v1/events/{id}/registrations — free registration only (Phase 1). */
export function useRegisterForEvent() {
  const queryClient = useQueryClient();

  return useMutation<
    EventRegistrationResult,
    ApiError,
    { id: string; payload: EventRegistrationRequest }
  >({
    mutationFn: ({ id, payload }) => eventService.register(id, payload),
    onSuccess: (_result, variables) => {
      // Registering changes the event's available capacity — refresh detail/list.
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: eventKeys.list() });
      void queryClient.invalidateQueries({ queryKey: eventKeys.myRegistrations() });
    },
  });
}

/** GET /api/v1/events/my/registrations — backs the "My Events" screen. */
export function useMyRegistrations(status?: string) {
  const query = useQuery<MyEventRegistration[], ApiError>({
    queryKey: eventKeys.myRegistrations(status),
    queryFn: () => eventService.getMyRegistrations(status),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  return {
    ...query,
    registrations: query.data ?? [],
  };
}

/** GET /api/v1/events/my/waitlist — backs the "My Waitlist" screen (Phase 5A). */
export function useMyWaitlist(status?: string, options?: { enabled?: boolean }) {
  const query = useQuery<MyWaitlistEntry[], ApiError>({
    queryKey: eventKeys.myWaitlist(status),
    queryFn: () => eventService.getMyWaitlist(status),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  return {
    ...query,
    entries: query.data ?? [],
  };
}

/**
 * GET /api/v1/events/{id}/registrations/{registrationId}/qr — the real QR
 * ticket image. `enabled` lets the caller withhold the fetch until it has a
 * registrationId (e.g. right after a registration whose response omitted one).
 */
export function useRegistrationQrImage(
  eventId: string,
  registrationId: string | null,
  options?: { enabled?: boolean },
) {
  const enabled = Boolean(eventId && registrationId) && (options?.enabled ?? true);

  const query = useQuery<string, ApiError>({
    queryKey: eventKeys.registrationQr(eventId, registrationId ?? ''),
    queryFn: () => eventService.getRegistrationQrImageUri(eventId, registrationId!),
    enabled,
    staleTime: 10 * 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
  });

  return {
    ...query,
    imageUri: query.data ?? null,
  };
}

/** DELETE /api/v1/events/{id}/registrations/{registrationId} — cancel own registration. */
export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation<
    EventCancelRegistrationResponse,
    ApiError,
    { eventId: string; registrationId: string }
  >({
    mutationFn: ({ eventId, registrationId }) =>
      eventService.cancelRegistration(eventId, registrationId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.myRegistrations() });
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      void queryClient.invalidateQueries({ queryKey: eventKeys.list() });
      // Cancelling can free a seat and trigger backend waitlist promotion.
      void queryClient.invalidateQueries({ queryKey: eventKeys.myWaitlist() });
    },
  });
}

/**
 * POST /api/v1/events/{id}/checkout — paid registration, demo payment only
 * (Phase 3). The backend creates both the EventOrder and (best-effort) a
 * companion EventRegistration in one call — see the Phase 3 report for the
 * backend gap where that companion creation can silently fail.
 */
export function useCheckoutEvent() {
  const queryClient = useQueryClient();

  return useMutation<
    EventOrderApiResponse,
    ApiError,
    { id: string; payload: EventCheckoutRequest }
  >({
    mutationFn: ({ id, payload }) => eventService.checkout(id, payload),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: eventKeys.list() });
      void queryClient.invalidateQueries({ queryKey: eventKeys.myRegistrations() });
    },
  });
}

export type CheckoutQuoteParams = {
  eventId: string;
  /** '' = no ticket type on this event — the backend falls back to its flat price (same convention as EventTicketOption.id). */
  ticketTypeId: string;
  quantity: number;
  mealSelections: string[];
  accommodationSelections: string[];
  /** Pass false to skip fetching entirely — e.g. nothing to price yet (no ticket type resolved). */
  enabled?: boolean;
};

/**
 * POST /api/v1/events/{id}/checkout/quote (Phase 2.8) — the authoritative
 * price preview shown before checkout/registration, debounced 350ms after
 * the last param change (same debounce window this app already uses
 * elsewhere for search-as-you-type, e.g. TrainingListScreen) so
 * toggling a few selections in a row fires one request, not one per tap.
 * A pure preview — the backend re-validates everything, authoritatively,
 * at the actual checkout/registration call.
 */
export function useCheckoutQuote(params: CheckoutQuoteParams) {
  const { eventId, ticketTypeId, quantity, mealSelections, accommodationSelections } = params;
  const enabled = params.enabled ?? true;

  // Sorted + joined so the debounce/query key is stable across re-renders
  // that pass a new array instance with the same ids in a different order.
  const mealKey = [...mealSelections].sort().join(',');
  const accommodationKey = [...accommodationSelections].sort().join(',');

  const [debounced, setDebounced] = useState({ ticketTypeId, quantity, mealKey, accommodationKey });

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced({ ticketTypeId, quantity, mealKey, accommodationKey }),
      350,
    );
    return () => clearTimeout(timer);
  }, [ticketTypeId, quantity, mealKey, accommodationKey]);

  const query = useQuery<EventCheckoutQuote, ApiError>({
    queryKey: eventKeys.checkoutQuote(
      eventId,
      debounced.ticketTypeId,
      debounced.quantity,
      debounced.mealKey,
      debounced.accommodationKey,
    ),
    queryFn: () =>
      eventService.getCheckoutQuote(eventId, {
        ticket_type_id: debounced.ticketTypeId,
        quantity: debounced.quantity,
        ...(debounced.mealKey ? { meal_selections: debounced.mealKey.split(',') } : {}),
        ...(debounced.accommodationKey
          ? { accommodation_selections: debounced.accommodationKey.split(',') }
          : {}),
      }),
    enabled: Boolean(eventId) && enabled,
    // A fresh preview every time — selections/capacity can change between fetches, and the
    // debounce above already keeps request volume in check.
    staleTime: 0,
    gcTime: 60_000,
    // A 400/422 (sold out, invalid selection, ...) means "try different selections", not
    // "try the same request again" — only a network failure is worth one retry.
    retry: (failureCount, error) => error.statusCode === 0 && failureCount < 1,
  });

  return {
    ...query,
    quote: query.data ?? null,
    // A previous quote is not valid while the debounce still holds a newer
    // selection. Callers must not submit it as though it priced the new set.
    isSelectionPending:
      enabled &&
      (debounced.ticketTypeId !== ticketTypeId ||
        debounced.quantity !== quantity ||
        debounced.mealKey !== mealKey ||
        debounced.accommodationKey !== accommodationKey),
  };
}

/** POST /api/v1/events/{id}/waitlist — join (Phase 4). */
export function useJoinWaitlist() {
  const queryClient = useQueryClient();

  return useMutation<
    EventWaitlistEntryResult,
    ApiError,
    { id: string; payload: EventWaitlistJoinRequest }
  >({
    mutationFn: ({ id, payload }) => eventService.joinWaitlist(id, payload),
    onSuccess: (_result, variables) => {
      // Joining doesn't change capacity, but keep event/list data fresh regardless.
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: eventKeys.list() });
      void queryClient.invalidateQueries({ queryKey: eventKeys.myWaitlist() });
    },
  });
}

/** DELETE /api/v1/events/{id}/waitlist/{entryId} — leave (Phase 4). */
export function useLeaveWaitlist() {
  const queryClient = useQueryClient();

  return useMutation<
    EventCancelRegistrationResponse,
    ApiError,
    { eventId: string; entryId: string }
  >({
    mutationFn: ({ eventId, entryId }) => eventService.leaveWaitlist(eventId, entryId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      void queryClient.invalidateQueries({ queryKey: eventKeys.list() });
      void queryClient.invalidateQueries({ queryKey: eventKeys.myWaitlist() });
    },
  });
}

/**
 * POST /api/v1/events/{id}/contact — one-way message to the organiser
 * (Phase 5D-2), not a conversation. Nothing else in the app reads "was the
 * organiser contacted" state, so there is no query key and nothing to
 * invalidate here.
 */
export function useContactOrganizer() {
  return useMutation<
    EventContactOrganizerResult,
    ApiError,
    { id: string; payload: EventContactOrganizerRequest }
  >({
    mutationFn: ({ id, payload }) => eventService.contactOrganizer(id, payload),
  });
}

/**
 * POST /api/v1/events/{id}/feedback or /reviews (Phase 5D-3). No customer-
 * facing endpoint exists to list/read feedback back (GET /{id}/feedback is
 * admin/provider-only), so there is no query key and nothing to invalidate.
 */
export function useSubmitEventFeedback() {
  return useMutation<
    EventFeedbackResult,
    ApiError,
    { id: string; payload: EventFeedbackRequest; asReview: boolean }
  >({
    mutationFn: ({ id, payload, asReview }) =>
      eventService.submitFeedback(id, payload, asReview),
  });
}
