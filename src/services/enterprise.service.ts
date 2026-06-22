import type { EnterpriseApiResponse, EnterpriseListItem } from '@/types/enterprise.types';
import {
  mapEnterpriseApiToListItem,
  mapEnterprisesApiResponse,
} from '@/utils/enterprise.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const enterpriseService = {
  getAll: async (): Promise<EnterpriseListItem[]> => {
    const response = await apiClient.get<EnterpriseApiResponse[]>(
      ENDPOINTS.ENTERPRISES.GET_ALL,
      {
        params: { t: Date.now() },
      },
    );
    return mapEnterprisesApiResponse(response.data);
  },

  getById: async (id: string): Promise<EnterpriseListItem> => {
    const response = await apiClient.get<EnterpriseApiResponse>(
      ENDPOINTS.ENTERPRISES.GET_BY_ID(id),
    );
    return mapEnterpriseApiToListItem(response.data);
  },
};
