import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { enterpriseKeys } from '@/hooks/useEnterprises';
import { productKeys } from '@/hooks/useProducts';
import { serviceKeys } from '@/hooks/useServices';
import { enterpriseService } from '@/services/enterprise.service';
import { productService } from '@/services/product.service';
import { serviceService } from '@/services/service.service';

const MARKET_HOME_FEATURED_BIZ = 2;
const MARKET_HOME_SEARCH_PAGE_SIZE = 20;

/** Market home: enterprises + products + services, optionally filtered by search. */
export function useMarketHomeData(searchQuery: string) {
  const normalized = useMemo(() => searchQuery.trim(), [searchQuery]);
  const isSearching = normalized.length > 0;

  const enterprisesQuery = useQuery({
    queryKey: [
      ...enterpriseKeys.all,
      'market-home',
      normalized || 'featured',
    ] as const,
    queryFn: async () => {
      const { items } = await enterpriseService.getList({
        status: 'active',
        search: isSearching ? normalized : undefined,
        page: 1,
        page_size: isSearching
          ? MARKET_HOME_SEARCH_PAGE_SIZE
          : MARKET_HOME_FEATURED_BIZ,
      });
      return items;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const productsQuery = useQuery({
    queryKey: [
      ...productKeys.all,
      'market-home',
      normalized || 'featured',
    ] as const,
    queryFn: async () => {
      const { items } = await productService.getList({
        status: 'active',
        search: isSearching ? normalized : undefined,
        page: 1,
        page_size: isSearching ? MARKET_HOME_SEARCH_PAGE_SIZE : 1,
      });
      return items;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const servicesQuery = useQuery({
    queryKey: [
      ...serviceKeys.all,
      'market-home',
      normalized || 'featured',
    ] as const,
    queryFn: async () => {
      const { items } = await serviceService.getList({
        status: 'active',
        search: isSearching ? normalized : undefined,
        page: 1,
        page_size: isSearching ? MARKET_HOME_SEARCH_PAGE_SIZE : 1,
      });
      return items;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
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
    isSearching,
    enterprises: enterprisesQuery.data ?? [],
    products: productsQuery.data ?? [],
    services: servicesQuery.data ?? [],
    isLoading,
    isFetching,
    isError:
      enterprisesQuery.isError ||
      productsQuery.isError ||
      servicesQuery.isError,
  };
}
