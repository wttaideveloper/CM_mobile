import type { EnterprisesPaginatedApiResponse } from '@/types/enterprise.types';
import type { ProductsPaginatedApiResponse } from '@/types/product.types';
import type { ServicesPaginatedApiResponse } from '@/types/service.types';
import type { GlobalSearchQuery } from '@/types/search.types';
import { ACTIVE_SEARCH_STATUS } from '@/types/search.types';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import type { ProductListItem } from '@/types/product.types';
import type { ServiceListItem } from '@/types/service.types';
import { mapEnterprisesApiResponse } from '@/utils/enterprise.mapper';
import { mapProductsApiResponse } from '@/utils/product.mapper';
import { mapServicesApiResponse } from '@/utils/service.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const SEARCH_PAGE_SIZE = 100;

function buildSearchParams(query: GlobalSearchQuery = {}) {
  const params: Record<string, string | number> = {
    status: query.status?.trim() || ACTIVE_SEARCH_STATUS,
    page: query.page ?? 1,
    page_size: query.page_size ?? SEARCH_PAGE_SIZE,
  };

  if (query.query?.trim()) {
    params.query = query.query.trim();
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

  if (query.city?.trim()) {
    params.city = query.city.trim();
  }

  return params;
}

export const searchService = {
  searchEnterprises: async (query: GlobalSearchQuery = {}): Promise<EnterpriseListItem[]> => {
    const params = buildSearchParams(query);

    if (__DEV__) {
      console.log('[Search API] enterprises params:', params);
    }

    const response = await apiClient.get<EnterprisesPaginatedApiResponse>(
      ENDPOINTS.SEARCH.ENTERPRISES,
      { params },
    );

    if (__DEV__) {
      console.log('[Search API] enterprises response:', response.data);
    }

    return mapEnterprisesApiResponse(response.data.items);
  },

  searchProducts: async (query: GlobalSearchQuery = {}): Promise<ProductListItem[]> => {
    const params = buildSearchParams(query);

    if (__DEV__) {
      console.log('[Search API] products params:', params);
    }

    const response = await apiClient.get<ProductsPaginatedApiResponse>(
      ENDPOINTS.SEARCH.PRODUCTS,
      { params },
    );

    if (__DEV__) {
      console.log('[Search API] products response:', response.data);
    }

    return mapProductsApiResponse(response.data.items);
  },

  searchServices: async (query: GlobalSearchQuery = {}): Promise<ServiceListItem[]> => {
    const params = buildSearchParams(query);

    if (__DEV__) {
      console.log('[Search API] services params:', params);
    }

    const response = await apiClient.get<ServicesPaginatedApiResponse>(
      ENDPOINTS.SEARCH.SERVICES,
      { params },
    );

    if (__DEV__) {
      console.log('[Search API] services response:', response.data);
    }

    return mapServicesApiResponse(response.data.items);
  },
};
