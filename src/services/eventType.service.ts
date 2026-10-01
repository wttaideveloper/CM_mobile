import type { EventTypeApiResponse, EventTypeListQuery } from '@/types/event.types';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const eventTypeService = {
  /**
   * GET /api/v1/event-types/ — public, no auth. Defaults to active-only;
   * pass include_inactive when resolving an existing Event's type, since
   * that must keep displaying correctly even if the type has since been
   * deactivated. Response shape is already app-ready (no messy/string-
   * encoded fields like Events has), so no mapper is needed.
   */
  getList: async (query: EventTypeListQuery = {}): Promise<EventTypeApiResponse[]> => {
    const params = query.include_inactive ? { include_inactive: true } : undefined;

    if (__DEV__) {
      console.log('[EventTypes API] GET list params:', params);
    }

    const response = await apiClient.get<EventTypeApiResponse[]>(
      ENDPOINTS.EVENT_TYPES.GET_ALL,
      { params },
    );

    return Array.isArray(response.data) ? response.data : [];
  },
};
