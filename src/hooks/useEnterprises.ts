import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import {
  enterpriseService,
} from '@/services/enterprise.service';
import type { ApiError } from '@/types/api.types';
import type {
  EnterpriseListItem,
  EnterpriseListQuery,
} from '@/types/enterprise.types';

export const ENTERPRISE_PAGE_SIZE = 20;

export const enterpriseKeys = {
  all: ['enterprises'] as const,
  list: () => [...enterpriseKeys.all, 'list'] as const,
  infiniteList: (params: EnterpriseListQuery) =>
    [...enterpriseKeys.all, 'infinite', params] as const,
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

type UseInfiniteEnterprisesOptions = {
  enabled?: boolean;
};

export function useInfiniteEnterprises(
  params: EnterpriseListQuery = {},
  options?: UseInfiniteEnterprisesOptions,
) {
  const queryParams = useMemo(() => {
    const normalized: EnterpriseListQuery = {
      page_size: params.page_size ?? ENTERPRISE_PAGE_SIZE,
    };

    if (params.search?.trim()) {
      normalized.search = params.search.trim();
    }

    if (params.category?.trim()) {
      normalized.category = params.category.trim();
    }

    if (params.status?.trim()) {
      normalized.status = params.status.trim();
    }

    if (params.tenant_id?.trim()) {
      normalized.tenant_id = params.tenant_id.trim();
    }

    return normalized;
  }, [
    params.category,
    params.page_size,
    params.search,
    params.status,
    params.tenant_id,
  ]);

  return useInfiniteQuery({
    queryKey: enterpriseKeys.infiniteList(queryParams),
    queryFn: ({ pageParam }) =>
      enterpriseService.getList({
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
