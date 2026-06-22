import type {
  ServiceApiResponse,
  ServiceDetailItem,
  ServiceListItem,
} from '@/types/service.types';
import {
  mapServiceApiToDetailItem,
  mapServicesApiResponse,
} from '@/utils/service.mapper';

import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const serviceService = {
  getAll: async (): Promise<ServiceListItem[]> => {
    const response = await apiClient.get<ServiceApiResponse[]>(
      ENDPOINTS.SERVICES.GET_ALL,
    );
    return mapServicesApiResponse(response.data);
  },

  getById: async (id: string): Promise<ServiceDetailItem> => {
    const response = await apiClient.get<ServiceApiResponse>(
      ENDPOINTS.SERVICES.GET_BY_ID(id),
    );
    return mapServiceApiToDetailItem(response.data);
  },

  getByEnterpriseId: async (enterpriseId: string): Promise<ServiceListItem[]> => {
    const services = await serviceService.getAll();
    return services.filter((service) => service.enterpriseId === enterpriseId);
  },
};
