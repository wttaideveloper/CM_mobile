import type { Href } from 'expo-router';

export const SEARCH_DATA_ROUTE = '/(main)/search-data' as const;
export const FROM_SEARCH_PARAM = 'fromSearch' as const;
export const FROM_ENTERPRISE_PARAM = 'fromEnterprise' as const;

/** Main-stack list routes so back from View all returns to search, not home. */
export const SEARCH_LIST_ROUTES = {
  enterprises: '/(main)/enterprises',
  services: '/(main)/services',
  products: '/(main)/products',
  events: '/(main)/events',
  courses: '/(main)/courses',
} as const;

export function searchListHref(
  pathname: string,
  searchQuery: string,
  extraParams?: Record<string, string>,
): Href {
  const params: Record<string, string> = {
    [FROM_SEARCH_PARAM]: '1',
    ...extraParams,
  };
  const trimmed = searchQuery.trim();

  if (trimmed) {
    params.search = trimmed;
  }

  return { pathname, params } as Href;
}

export function isFromSearchParam(
  fromSearch?: string | string[] | null,
): boolean {
  const value = Array.isArray(fromSearch) ? fromSearch[0] : fromSearch;
  return value === '1';
}

type DetailParams = Record<string, string>;

export function withFromSearch(params?: DetailParams): DetailParams {
  if (!params) {
    return { [FROM_SEARCH_PARAM]: '1' };
  }

  return { ...params, [FROM_SEARCH_PARAM]: '1' };
}

export function enterpriseDetailHref(
  enterpriseId: string,
  fromSearch?: boolean,
): Href {
  const path = fromSearch ? '/(main)/enterprise' : '/(main)/(tabs)/explore';
  return detailHref(path, enterpriseId, fromSearch);
}

export function detailFromEnterpriseHref(
  pathname: string,
  itemId: string,
  enterpriseId: string,
  fromSearch?: boolean,
): Href {
  return detailHref(pathname, itemId, fromSearch, {
    [FROM_ENTERPRISE_PARAM]: enterpriseId,
  });
}

/** Service detail inside the Explore tab stack so back returns correctly. */
export function exploreTabServiceHref(serviceId: string): Href {
  return `/(main)/(tabs)/explore/service/${serviceId}` as Href;
}

export function exploreTabProductHref(productId: string): Href {
  return `/(main)/(tabs)/explore/product/${productId}` as Href;
}

export function exploreEnterpriseServicesHref(
  enterpriseId: string,
  fromSearch?: boolean,
): Href {
  const pathname = fromSearch
    ? '/(main)/enterprise/services'
    : '/(main)/(tabs)/explore/services';
  const params = new URLSearchParams({ enterpriseId });
  if (fromSearch) {
    params.set(FROM_SEARCH_PARAM, '1');
  }
  return `${pathname}?${params.toString()}` as Href;
}

export function exploreEnterpriseProductsHref(
  enterpriseId: string,
  fromSearch?: boolean,
): Href {
  const pathname = fromSearch
    ? '/(main)/enterprise/products'
    : '/(main)/(tabs)/explore/products';
  const params = new URLSearchParams({ enterpriseId });
  if (fromSearch) {
    params.set(FROM_SEARCH_PARAM, '1');
  }
  return `${pathname}?${params.toString()}` as Href;
}

export function detailHref(
  pathname: string,
  id: string,
  fromSearch?: boolean,
  params?: DetailParams,
): Href {
  const mergedParams = {
    ...params,
    ...(fromSearch ? { [FROM_SEARCH_PARAM]: '1' } : {}),
  };

  if (Object.keys(mergedParams).length === 0) {
    return `${pathname}/${id}` as Href;
  }

  const searchParams = new URLSearchParams(mergedParams);
  return `${pathname}/${id}?${searchParams.toString()}` as Href;
}
