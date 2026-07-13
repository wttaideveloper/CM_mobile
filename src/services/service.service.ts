import type {
  ServiceApiResponse,
  ServiceDetailItem,
  ServiceListItem,
  ServiceListQuery,
  ServicesPaginatedApiResponse,
  ServicesPaginatedResult,
} from '@/types/service.types';
import {
  mapServiceApiToDetailItem,
  mapServicesApiResponse,
} from '@/utils/service.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const SERVICE_FILTER_PAGE_SIZE = 100;

function buildListParams(query: ServiceListQuery) {
  const params: Record<string, string | number> = {};

  if (query.search?.trim()) {
    params.search = query.search.trim();
  }

  if (query.tenant_id?.trim()) {
    params.tenant_id = query.tenant_id.trim();
  }

  if (query.enterprise_id?.trim()) {
    params.enterprise_id = query.enterprise_id.trim();
  }

  if (query.category?.trim()) {
    params.category = query.category.trim();
  }

  if (query.location_id?.trim()) {
    params.location_id = query.location_id.trim();
  }

  if (query.status?.trim()) {
    params.status = query.status.trim();
  }

  if (query.page != null) {
    params.page = query.page;
  }

  if (query.page_size != null) {
    params.page_size = query.page_size;
  }

  return params;
}

export const serviceService = {
  getList: async (query: ServiceListQuery = {}): Promise<ServicesPaginatedResult> => {
    const params = buildListParams(query);

    if (__DEV__) {
      console.log('[Services API] GET list params:', params);
    }

    const response = await apiClient.get<ServicesPaginatedApiResponse>(
      ENDPOINTS.SERVICES.GET_ALL,
      { params },
    );

    return {
      items: mapServicesApiResponse(response.data.items),
      pagination: response.data.pagination,
    };
  },

  getAll: async (): Promise<ServiceListItem[]> => {
    const { items } = await serviceService.getList({ page: 1, page_size: 100 });
    return items;
  },

  getById: async (id: string): Promise<ServiceDetailItem> => {
    if (__DEV__) {
      console.log('[Services API] GET by id:', id);
    }

    const response = await apiClient.get<ServiceApiResponse>(
      ENDPOINTS.SERVICES.GET_BY_ID(id),
    );
    return mapServiceApiToDetailItem(response.data);
  },

  getByEnterpriseId: async (enterpriseId: string): Promise<ServiceListItem[]> => {
    const { items } = await serviceService.getList({
      enterprise_id: enterpriseId,
      page: 1,
      page_size: SERVICE_FILTER_PAGE_SIZE,
    });

    return items;
  },
};
