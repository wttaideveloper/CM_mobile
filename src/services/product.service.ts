import type { ProductApiResponse, ProductListItem } from '@/types/product.types';
import {
  mapProductApiToListItem,
  mapProductsApiResponse,
} from '@/utils/product.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const productService = {
  getAll: async (): Promise<ProductListItem[]> => {
    const response = await apiClient.get<ProductApiResponse[]>(
      ENDPOINTS.PRODUCTS.GET_ALL,
    );
    return mapProductsApiResponse(response.data);
  },

  getById: async (id: string): Promise<ProductListItem> => {
    const response = await apiClient.get<ProductApiResponse>(
      ENDPOINTS.PRODUCTS.GET_BY_ID(id),
    );
    return mapProductApiToListItem(response.data);
  },

  getByEnterpriseId: async (enterpriseId: string): Promise<ProductListItem[]> => {
    const products = await productService.getAll();
    return products.filter((product) => product.enterpriseId === enterpriseId);
  },
};
