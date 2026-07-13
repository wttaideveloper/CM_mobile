import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { serviceService } from '@/services/service.service';
import type { ApiError } from '@/types/api.types';
import type {
  ServiceDetailItem,
  ServiceListItem,
  ServiceListQuery,
} from '@/types/service.types';

export const SERVICE_PAGE_SIZE = 20;

export const serviceKeys = {
  all: ['services'] as const,
  list: () => [...serviceKeys.all, 'list'] as const,
  infiniteList: (params: ServiceListQuery) =>
    [...serviceKeys.all, 'infinite', params] as const,
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

type UseInfiniteServicesOptions = {
  enabled?: boolean;
};

export function useInfiniteServices(
  params: ServiceListQuery = {},
  options?: UseInfiniteServicesOptions,
) {
  const queryParams = useMemo(() => {
    const normalized: ServiceListQuery = {
      page_size: params.page_size ?? SERVICE_PAGE_SIZE,
    };

    if (params.search?.trim()) {
      normalized.search = params.search.trim();
    }

    if (params.tenant_id?.trim()) {
      normalized.tenant_id = params.tenant_id.trim();
    }

    if (params.enterprise_id?.trim()) {
      normalized.enterprise_id = params.enterprise_id.trim();
    }

    if (params.category?.trim()) {
      normalized.category = params.category.trim();
    }

    if (params.location_id?.trim()) {
      normalized.location_id = params.location_id.trim();
    }

    if (params.status?.trim()) {
      normalized.status = params.status.trim();
    }

    return normalized;
  }, [
    params.category,
    params.enterprise_id,
    params.location_id,
    params.page_size,
    params.search,
    params.status,
    params.tenant_id,
  ]);

  return useInfiniteQuery({
    queryKey: serviceKeys.infiniteList(queryParams),
    queryFn: ({ pageParam }) =>
      serviceService.getList({
        ...queryParams,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    enabled: options?.enabled,
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
