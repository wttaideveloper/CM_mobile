import type {
  EventApiResponse,
  EventListQuery,
  EventsPaginatedApiResponse,
} from '@/types/event.types';
import { mapEventApiToItem, mapEventsApiResponse } from '@/utils/event.mapper';
import type { Event } from '@/constants/events';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

// EventsScreen renders a single non-paginated FlatList (no infinite scroll in the
// existing UI), so fetch one reasonably-sized page rather than adding pagination UX.
export const EVENT_PAGE_SIZE = 50;

function buildListParams(query: EventListQuery) {
  // Backend does NOT default to published-only — this must always be sent,
  // otherwise draft/pending/suspended events would be visible to end users.
  const params: Record<string, string | number> = {
    status: query.status?.trim() || 'published',
  };

  if (query.page != null) {
    params.page = query.page;
  }

  if (query.page_size != null) {
    params.page_size = query.page_size;
  }

  return params;
}

export const eventService = {
  getList: async (query: EventListQuery = {}): Promise<Event[]> => {
    const params = buildListParams(query);

    if (__DEV__) {
      console.log('[Events API] GET list params:', params);
    }

    const response = await apiClient.get<EventsPaginatedApiResponse>(
      ENDPOINTS.EVENTS.GET_ALL,
      { params },
    );

    return mapEventsApiResponse(response.data.items);
  },

  getById: async (id: string): Promise<Event> => {
    if (__DEV__) {
      console.log('[Events API] GET by id:', id);
    }

    const response = await apiClient.get<EventApiResponse>(
      ENDPOINTS.EVENTS.GET_BY_ID(id),
    );
    return mapEventApiToItem(response.data);
  },
};
