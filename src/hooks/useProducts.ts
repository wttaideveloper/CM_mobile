import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { productService } from '@/services/product.service';
import type { ApiError } from '@/types/api.types';
import type { ProductDetailItem, ProductListItem, ProductListQuery } from '@/types/product.types';

export const PRODUCT_PAGE_SIZE = 20;

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  infiniteList: (params: ProductListQuery) =>
    [...productKeys.all, 'infinite', params] as const,
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

type UseInfiniteProductsOptions = {
  enabled?: boolean;
};

export function useInfiniteProducts(
  params: ProductListQuery = {},
  options?: UseInfiniteProductsOptions,
) {
  const queryParams = useMemo(() => {
    const normalized: ProductListQuery = {
      page_size: params.page_size ?? PRODUCT_PAGE_SIZE,
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
    queryKey: productKeys.infiniteList(queryParams),
    queryFn: ({ pageParam }) =>
      productService.getList({
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
  UseQueryOptions<ProductDetailItem, ApiError>,
  'queryKey' | 'queryFn'
>;

export function useProduct(id: string, options?: UseProductOptions) {
  const query = useQuery<ProductDetailItem, ApiError>({
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
