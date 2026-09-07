import type {
  ProductApiResponse,
  ProductDetailItem,
  ProductListItem,
  ProductListQuery,
  ProductsPaginatedApiResponse,
  ProductsPaginatedResult,
} from '@/types/product.types';
import {
  mapProductApiToDetailItem,
  mapProductApiToListItem,
  mapProductsApiResponse,
} from '@/utils/product.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const PRODUCT_FILTER_PAGE_SIZE = 100;
export const ENTERPRISE_PRODUCTS_PAGE_SIZE = 100;

function buildListParams(query: ProductListQuery) {
  const params: Record<string, string | number> = {
    status: query.status?.trim() || 'active',
  };

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

  if (query.page != null) {
    params.page = query.page;
  }

  if (query.page_size != null) {
    params.page_size = query.page_size;
  }

  return params;
}

export const productService = {
  getList: async (query: ProductListQuery = {}): Promise<ProductsPaginatedResult> => {
    const params = buildListParams(query);

    if (__DEV__) {
      console.log('[Products API] GET list params:', params);
    }

    const response = await apiClient.get<ProductsPaginatedApiResponse>(
      ENDPOINTS.PRODUCTS.GET_ALL,
      { params },
    );

    return {
      items: mapProductsApiResponse(response.data.items),
      pagination: response.data.pagination,
    };
  },

  getAll: async (): Promise<ProductListItem[]> => {
    const { items } = await productService.getList({ page: 1, page_size: 100 });
    return items;
  },

  getById: async (id: string): Promise<ProductDetailItem> => {
    if (__DEV__) {
      console.log('[Products API] GET by id:', id);
    }

    const response = await apiClient.get<ProductApiResponse>(
      ENDPOINTS.PRODUCTS.GET_BY_ID(id),
    );
    return mapProductApiToDetailItem(response.data);
  },

  getByEnterpriseId: async (enterpriseId: string): Promise<ProductListItem[]> => {
    const { items } = await productService.getList({
      enterprise_id: enterpriseId,
      page: 1,
      page_size: ENTERPRISE_PRODUCTS_PAGE_SIZE,
    });

    return items;
  },
};
