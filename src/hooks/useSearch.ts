import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { searchService } from '@/services/search.service';
import type { ApiError } from '@/types/api.types';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import type { ProductListItem } from '@/types/product.types';
import type { ServiceListItem } from '@/types/service.types';

export const searchKeys = {
  all: ['search'] as const,
  enterprises: (query: string) => [...searchKeys.all, 'enterprises', query] as const,
  products: (query: string) => [...searchKeys.all, 'products', query] as const,
  services: (query: string) => [...searchKeys.all, 'services', query] as const,
};

type UseGlobalSearchOptions = {
  enabled?: boolean;
};

export function useGlobalSearch(searchQuery: string, options?: UseGlobalSearchOptions) {
  const normalizedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);
  const enabled = options?.enabled ?? true;

  const enterprisesQuery = useQuery<EnterpriseListItem[], ApiError>({
    queryKey: searchKeys.enterprises(normalizedQuery),
    queryFn: () =>
      searchService.searchEnterprises({
        query: normalizedQuery || undefined,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    enabled,
  });

  const productsQuery = useQuery<ProductListItem[], ApiError>({
    queryKey: searchKeys.products(normalizedQuery),
    queryFn: () =>
      searchService.searchProducts({
        query: normalizedQuery || undefined,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    enabled,
  });

  const servicesQuery = useQuery<ServiceListItem[], ApiError>({
    queryKey: searchKeys.services(normalizedQuery),
    queryFn: () =>
      searchService.searchServices({
        query: normalizedQuery || undefined,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    enabled,
  });

  const isLoading =
    (enterprisesQuery.isLoading && !enterprisesQuery.data) ||
    (productsQuery.isLoading && !productsQuery.data) ||
    (servicesQuery.isLoading && !servicesQuery.data);

  const isFetching =
    enterprisesQuery.isFetching ||
    productsQuery.isFetching ||
    servicesQuery.isFetching;

  return {
    enterprises: enterprisesQuery.data ?? [],
    products: productsQuery.data ?? [],
    services: servicesQuery.data ?? [],
    isLoading,
    isFetching,
    isError:
      enterprisesQuery.isError ||
      productsQuery.isError ||
      servicesQuery.isError,
    refetch: () => {
      void enterprisesQuery.refetch();
      void productsQuery.refetch();
      void servicesQuery.refetch();
    },
  };
}
