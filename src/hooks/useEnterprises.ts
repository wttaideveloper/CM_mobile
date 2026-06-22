import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { enterpriseService } from '@/services/enterprise.service';
import type { ApiError } from '@/types/api.types';
import type { EnterpriseListItem } from '@/types/enterprise.types';

export const enterpriseKeys = {
  all: ['enterprises'] as const,
  list: () => [...enterpriseKeys.all, 'list'] as const,
  detail: (id: string) => [...enterpriseKeys.all, 'detail', id] as const,
};

type UseEnterprisesOptions = Omit<
  UseQueryOptions<EnterpriseListItem[], ApiError>,
  'queryKey' | 'queryFn'
>;

export function useEnterprises(options?: UseEnterprisesOptions) {
  return useQuery<EnterpriseListItem[], ApiError>({
    queryKey: enterpriseKeys.list(),
    queryFn: enterpriseService.getAll,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });
}

type UseEnterpriseOptions = Omit<
  UseQueryOptions<EnterpriseListItem, ApiError>,
  'queryKey' | 'queryFn'
>;

export function useEnterprise(id: string, options?: UseEnterpriseOptions) {
  const query = useQuery<EnterpriseListItem, ApiError>({
    queryKey: enterpriseKeys.detail(id),
    queryFn: () => enterpriseService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });

  return {
    ...query,
    enterprise: query.data,
  };
}
