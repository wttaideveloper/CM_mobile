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
  EventRegistrationRequest,
  EventRegistrationResult,
  MyEventRegistration,
} from '@/types/event.types';

export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
  myRegistrations: (status?: string) =>
    [...eventKeys.all, 'my-registrations', status ?? 'all'] as const,
  registrationQr: (eventId: string, registrationId: string) =>
    [...eventKeys.all, 'qr', eventId, registrationId] as const,
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
    },
  });
}
