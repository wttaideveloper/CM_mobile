import type {
  EnterpriseApiResponse,
  EnterpriseListItem,
  EnterpriseListQuery,
  EnterprisesPaginatedApiResponse,
  EnterprisesPaginatedResult,
} from '@/types/enterprise.types';
import {
  mapEnterpriseApiToListItem,
  mapEnterprisesApiResponse,
} from '@/utils/enterprise.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

function buildListParams(query: EnterpriseListQuery) {
  const params: Record<string, string | number> = {
    status: query.status?.trim() || 'active',
  };
  const searchText = query.search?.trim();
  const categoryText = query.category?.trim();

  if (searchText) {
    params.search = searchText;
  } else if (categoryText) {
    params.search = categoryText;
  }

  if (categoryText && searchText) {
    params.category = categoryText;
  }

  if (query.tenant_id?.trim()) {
    params.tenant_id = query.tenant_id.trim();
  }

  if (query.page != null) {
    params.page = query.page;
  }

  if (query.page_size != null) {
    params.page_size = query.page_size;
  }

  return params;
}

export const ENTERPRISE_FILTER_PAGE_SIZE = 100;

export const enterpriseService = {
  getList: async (query: EnterpriseListQuery = {}): Promise<EnterprisesPaginatedResult> => {
    const params = buildListParams(query);

    if (__DEV__) {
      console.log('[Enterprises API] GET list params:', params);
    }

    const response = await apiClient.get<EnterprisesPaginatedApiResponse>(
      ENDPOINTS.ENTERPRISES.GET_ALL,
      { params },
    );

    return {
      items: mapEnterprisesApiResponse(response.data.items),
      pagination: response.data.pagination,
    };
  },

  getAll: async (): Promise<EnterpriseListItem[]> => {
    const { items } = await enterpriseService.getList({ page: 1, page_size: 100 });
    return items;
  },

  getById: async (id: string): Promise<EnterpriseListItem> => {
    if (__DEV__) {
      console.log('[Enterprises API] GET by id:', id);
    }

    const response = await apiClient.get<EnterpriseApiResponse>(
      ENDPOINTS.ENTERPRISES.GET_BY_ID(id),
    );

    if (__DEV__) {
      console.log('[Enterprises API] GET by id response:', response.data);
    }

    return mapEnterpriseApiToListItem(response.data);
  },
};
