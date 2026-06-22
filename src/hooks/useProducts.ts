import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { productService } from '@/services/product.service';
import type { ApiError } from '@/types/api.types';
import type { ProductListItem } from '@/types/product.types';

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  byEnterprise: (enterpriseId: string) =>
    [...productKeys.all, 'enterprise', enterpriseId] as const,
};

type UseProductsOptions = Omit<
  UseQueryOptions<ProductListItem[], ApiError>,
  'queryKey' | 'queryFn'
>;

export function useProducts(options?: UseProductsOptions) {
  return useQuery<ProductListItem[], ApiError>({
    queryKey: productKeys.list(),
    queryFn: productService.getAll,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });
}

type UseEnterpriseProductsOptions = Omit<
  UseQueryOptions<ProductListItem[], ApiError>,
  'queryKey' | 'queryFn'
>;

export function useEnterpriseProducts(
  enterpriseId: string,
  options?: UseEnterpriseProductsOptions,
) {
  return useQuery<ProductListItem[], ApiError>({
    queryKey: productKeys.byEnterprise(enterpriseId),
    queryFn: () => productService.getByEnterpriseId(enterpriseId),
    enabled: Boolean(enterpriseId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });
}

type UseProductOptions = Omit<
  UseQueryOptions<ProductListItem, ApiError>,
  'queryKey' | 'queryFn'
>;

export function useProduct(id: string, options?: UseProductOptions) {
  const query = useQuery<ProductListItem, ApiError>({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    ...options,
  });

  return {
    ...query,
    product: query.data,
  };
}
