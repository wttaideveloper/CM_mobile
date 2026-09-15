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
  EventRegistrationRequest,
  EventRegistrationResult,
} from '@/types/event.types';

export const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
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
    },
  });
}
