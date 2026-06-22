import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { serviceService } from '@/services/service.service';
import type { ApiError } from '@/types/api.types';
import type { ServiceDetailItem, ServiceListItem } from '@/types/service.types';

export const serviceKeys = {
  all: ['services'] as const,
  list: () => [...serviceKeys.all, 'list'] as const,
  detail: (id: string) => [...serviceKeys.all, 'detail', id] as const,
  byEnterprise: (enterpriseId: string) =>
    [...serviceKeys.all, 'enterprise', enterpriseId] as const,
};

type UseServicesOptions = Omit<
  UseQueryOptions<ServiceListItem[], ApiError>,
  'queryKey' | 'queryFn'
>;

export function useServices(options?: UseServicesOptions) {
  return useQuery<ServiceListItem[], ApiError>({
    queryKey: serviceKeys.list(),
    queryFn: serviceService.getAll,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });
}

type UseEnterpriseServicesOptions = Omit<
  UseQueryOptions<ServiceListItem[], ApiError>,
  'queryKey' | 'queryFn'
>;

export function useEnterpriseServices(
  enterpriseId: string,
  options?: UseEnterpriseServicesOptions,
) {
  return useQuery<ServiceListItem[], ApiError>({
    queryKey: serviceKeys.byEnterprise(enterpriseId),
    queryFn: () => serviceService.getByEnterpriseId(enterpriseId),
    enabled: Boolean(enterpriseId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });
}

type UseServiceOptions = Omit<
  UseQueryOptions<ServiceDetailItem, ApiError>,
  'queryKey' | 'queryFn'
>;

export function useService(id: string, options?: UseServiceOptions) {
  const query = useQuery<ServiceDetailItem, ApiError>({
    queryKey: serviceKeys.detail(id),
    queryFn: () => serviceService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });

  return {
    ...query,
    service: query.data,
  };
}
