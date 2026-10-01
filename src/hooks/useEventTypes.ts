import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { eventTypeService } from '@/services/eventType.service';
import type { ApiError } from '@/types/api.types';
import type { EventTypeApiResponse, EventTypeListQuery } from '@/types/event.types';

export const eventTypeKeys = {
  all: ['event-types'] as const,
  list: (includeInactive?: boolean) =>
    [...eventTypeKeys.all, 'list', includeInactive ?? false] as const,
};

type UseEventTypesOptions = Omit<
  UseQueryOptions<EventTypeApiResponse[], ApiError>,
  'queryKey' | 'queryFn'
> &
  EventTypeListQuery;

/**
 * GET /api/v1/event-types/ — the dynamic, backend-owned Event Type
 * registry (Phase 2 foundation). Defaults to active-only, matching the
 * backend's own default (normal browsing should never offer an inactive
 * type as a selectable choice). Pass `include_inactive: true` when
 * resolving a specific Event's type for display, since an existing Event
 * must keep showing its type name even after that type is deactivated.
 */
export function useEventTypes(options?: UseEventTypesOptions) {
  const { include_inactive, ...queryOptions } = options ?? {};

  return useQuery<EventTypeApiResponse[], ApiError>({
    queryKey: eventTypeKeys.list(include_inactive),
    queryFn: () => eventTypeService.getList({ include_inactive }),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
    ...queryOptions,
  });
}
