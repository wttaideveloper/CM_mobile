import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { eventService, EVENT_PAGE_SIZE } from '@/services/event.service';
import type { ApiError } from '@/types/api.types';
import type { Event } from '@/constants/events';
import type {
  EventCancelRegistrationResponse,
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
