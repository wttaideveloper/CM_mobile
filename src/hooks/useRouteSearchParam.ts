import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

export function useRouteSearchParam(): string {
  const { search: rawSearch } = useLocalSearchParams<{ search?: string | string[] }>();

  return useMemo(
    () => (Array.isArray(rawSearch) ? rawSearch[0] : rawSearch) ?? '',
    [rawSearch],
  );
}

export function useSyncedSearchState(routeSearch: string) {
  const [search, setSearch] = useState(routeSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(routeSearch.trim());

  useEffect(() => {
    setSearch(routeSearch);
    setDebouncedSearch(routeSearch.trim());
  }, [routeSearch]);

  return { search, setSearch, debouncedSearch, setDebouncedSearch };
}
