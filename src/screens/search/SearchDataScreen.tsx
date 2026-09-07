import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { ChevronLeftIcon, SearchIcon } from '@/components/dashboard/DashboardIcons';
import { filterCourses, filterEvents } from '@/components/search/searchFilters';
import { SearchDataResults } from '@/components/search/SearchDataResults';
import { COURSES } from '@/constants/courses';
import { EVENTS } from '@/constants/events';
import { useGlobalSearch } from '@/hooks/useSearch';
import { useSearchStore } from '@/stores/search.store';
import {
  PRIMARY,
  SEARCH_DEBOUNCE_MS,
  SEARCH_PLACEHOLDER,
  styles,
  TEXT_MUTED,
} from '@/screens/search/SearchDataScreen.styles';

export function SearchDataScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const statusBarFill = useStatusBarBackground();
  const inputRef = useRef<TextInput>(null);
  const hasAutoFocused = useRef(false);
  const search = useSearchStore((state) => state.query);
  const setSearch = useSearchStore((state) => state.setQuery);
  const clearSearch = useSearchStore((state) => state.clearQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim());

  useEffect(() => {
    const nextQuery = search.trim();

    // Prefill from home category should filter immediately.
    if (nextQuery && debouncedSearch !== nextQuery && debouncedSearch === '') {
      setDebouncedSearch(nextQuery);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(nextQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const {
    enterprises,
    products,
    services,
    isLoading,
    isFetching,
  } = useGlobalSearch(debouncedSearch);

  useEffect(() => {
    if (!hasAutoFocused.current) {
      hasAutoFocused.current = true;
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const enterpriseNameById = useMemo(
    () => Object.fromEntries(enterprises.map((item) => [item.id, item.name])),
    [enterprises],
  );

  const filteredEvents = useMemo(
    () => filterEvents(EVENTS, debouncedSearch),
    [debouncedSearch],
  );

  const filteredCourses = useMemo(
    () => filterCourses(COURSES, debouncedSearch),
    [debouncedSearch],
  );

  const hasApiResults =
    enterprises.length > 0 || services.length > 0 || products.length > 0;

  const showLoading = isLoading || (isFetching && !hasApiResults);

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.header}>
        <Pressable
          onPress={() => {
            clearSearch();
            router.back();
          }}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={22} color={PRIMARY} />
        </Pressable>

        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={TEXT_MUTED} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder={SEARCH_PLACEHOLDER}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
            multiline={false}
            numberOfLines={1}
            scrollEnabled={false}
            onSubmitEditing={() => setDebouncedSearch(search.trim())}
          />
        </View>
      </View>

      <ScrollView
        style={styles.resultsScroll}
        contentContainerStyle={[
          styles.resultsContent,
          !showLoading &&
            !hasApiResults &&
            filteredEvents.length === 0 &&
            filteredCourses.length === 0 &&
            styles.resultsContentEmpty,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SearchDataResults
          showLoading={showLoading}
          hasApiResults={hasApiResults}
          debouncedSearch={debouncedSearch}
          enterprises={enterprises}
          services={services}
          products={products}
          filteredEvents={filteredEvents}
          filteredCourses={filteredCourses}
          enterpriseNameById={enterpriseNameById}
          onViewAll={(route) => router.push(route)}
        />
      </ScrollView>
    </View>
  );
}
