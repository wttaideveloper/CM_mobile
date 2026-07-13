import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { useCallback } from 'react';

import {
  enterpriseDetailHref,
  FROM_ENTERPRISE_PARAM,
  SEARCH_DATA_ROUTE,
} from '@/utils/searchNavigation';

function isExploreTabDetailRoute(segments: string[]) {
  const exploreIndex = segments.indexOf('explore');
  if (exploreIndex === -1) {
    return false;
  }

  const nextSegment = segments[exploreIndex + 1];
  return nextSegment === 'service' || nextSegment === 'product';
}

export function useDetailBack() {
  const router = useRouter();
  const segments = useSegments();
  const params = useLocalSearchParams<{
    fromSearch?: string | string[];
    [key: string]: string | string[] | undefined;
  }>();

  return useCallback(() => {
    if (isExploreTabDetailRoute(segments)) {
      router.back();
      return;
    }

    const searchFlag = Array.isArray(params.fromSearch)
      ? params.fromSearch[0]
      : params.fromSearch;
    const enterpriseParam = params[FROM_ENTERPRISE_PARAM];
    const enterpriseId = Array.isArray(enterpriseParam)
      ? enterpriseParam[0]
      : enterpriseParam;
    const openedFromSearch = searchFlag === '1';

    if (enterpriseId && openedFromSearch) {
      router.back();
      return;
    }

    if (enterpriseId) {
      router.push(enterpriseDetailHref(enterpriseId, false));
      return;
    }

    if (openedFromSearch) {
      router.push(SEARCH_DATA_ROUTE);
      return;
    }

    router.back();
  }, [params, router, segments]);
}
