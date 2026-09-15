import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { eventService, EVENT_PAGE_SIZE } from '@/services/event.service';
import type { ApiError } from '@/types/api.types';
import type { Event } from '@/constants/events';

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
