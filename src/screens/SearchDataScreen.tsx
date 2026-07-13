import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { ChevronLeftIcon, SearchIcon } from '@/components/dashboard/DashboardIcons';
import { COURSES, type Course } from '@/constants/courses';
import { EVENTS, type Event } from '@/constants/events';
import { useGlobalSearch } from '@/hooks/useSearch';
import { useSearchStore } from '@/stores/search.store';
import { CourseCard } from '@/screens/CoursesScreen';
import { EventCard } from '@/screens/EventsScreen';
import { EnterpriseRow } from '@/screens/EnterprisesScreen';
import { ProductGridCard } from '@/screens/ProductsScreen';
import { ServiceCard } from '@/screens/ServicesScreen';
import { isSmallDevice } from '@/utils/responsive';
import { SEARCH_LIST_ROUTES, searchListHref } from '@/utils/searchNavigation';
import { shadowSm } from '@/utils/shadows';

const PRIMARY = '#1F5D4E';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const H_PAD = isSmallDevice ? 16 : 20;
const CARD_GAP = isSmallDevice ? 10 : 12;
const PREVIEW_LIMIT = 4;
const SEARCH_DEBOUNCE_MS = 400;
const SEARCH_PLACEHOLDER = isSmallDevice
  ? 'Search Enterprise, Service...'
  : 'Search by Enterprise, Service, Product...';

function matchesQuery(query: string, values: string[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return values.some((value) => value.toLowerCase().includes(normalized));
}

function filterEvents(items: Event[], query: string) {
  return items.filter((item) =>
    matchesQuery(query, [
      item.name,
      item.location,
      item.description,
      item.status,
      item.priceLabel,
      ...item.filterTags,
    ]),
  );
}

function filterCourses(items: Course[], query: string) {
  return items.filter((item) =>
    matchesQuery(query, [
      item.name,
      item.level,
      item.instructor,
      item.enterprise,
      item.description,
    ]),
  );
}

function SectionHeading({
  title,
  count,
  onViewAll,
}: {
  title: string;
  count: number;
  onViewAll?: () => void;
}) {
  const showViewAll = count > PREVIEW_LIMIT && onViewAll;

  return (
    <View style={styles.sectionHeadingRow}>
      <Text style={styles.sectionHeading} numberOfLines={1}>
        {title}{' '}
        <Text style={styles.sectionCount}>{count}</Text>
      </Text>
      {showViewAll ? (
        <Pressable
          onPress={onViewAll}
          hitSlop={8}
          style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

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
        {showLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={PRIMARY} size="large" />
          </View>
        ) : null}

        {!showLoading && !hasApiResults && filteredEvents.length === 0 && filteredCourses.length === 0 ? (
          <EmptyState entity="results" />
        ) : null}

        {!showLoading && enterprises.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading
              title="Enterprises"
              count={enterprises.length}
              onViewAll={() =>
                router.push(searchListHref(SEARCH_LIST_ROUTES.enterprises, debouncedSearch))
              }
            />
            <View style={styles.enterpriseList}>
              {enterprises.slice(0, PREVIEW_LIMIT).map((item) => (
                <EnterpriseRow key={item.id} enterprise={item} fromSearch />
              ))}
            </View>
          </View>
        ) : null}

        {!showLoading && services.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading
              title="Services"
              count={services.length}
              onViewAll={() =>
                router.push(searchListHref(SEARCH_LIST_ROUTES.services, debouncedSearch))
              }
            />
            <View style={styles.serviceList}>
              {services.slice(0, PREVIEW_LIMIT).map((item) => (
                <ServiceCard
                  key={item.id}
                  service={item}
                  enterpriseNameById={enterpriseNameById}
                  fromSearch
                />
              ))}
            </View>
          </View>
        ) : null}

        {!showLoading && products.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading
              title="Products"
              count={products.length}
              onViewAll={() =>
                router.push(searchListHref(SEARCH_LIST_ROUTES.products, debouncedSearch))
              }
            />
            <View style={styles.productGrid}>
              {products.slice(0, PREVIEW_LIMIT).map((item) => (
                <ProductGridCard key={item.id} product={item} fromSearch />
              ))}
            </View>
          </View>
        ) : null}

        {filteredEvents.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading
              title="Events"
              count={filteredEvents.length}
              onViewAll={() =>
                router.push(searchListHref(SEARCH_LIST_ROUTES.events, debouncedSearch))
              }
            />
            <View style={styles.eventList}>
              {filteredEvents.slice(0, PREVIEW_LIMIT).map((item) => (
                <EventCard key={item.id} event={item} fromSearch />
              ))}
            </View>
          </View>
        ) : null}

        {filteredCourses.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading
              title="Courses"
              count={filteredCourses.length}
              onViewAll={() =>
                router.push(searchListHref(SEARCH_LIST_ROUTES.courses, debouncedSearch))
              }
            />
            <View style={styles.courseList}>
              {filteredCourses.slice(0, PREVIEW_LIMIT).map((item) => (
                <CourseCard key={item.id} course={item} fromSearch />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 : 20,
    paddingBottom: isSmallDevice ? 8 : 10,
    backgroundColor: BODY_BG,
  },
  backBtn: {
    width: isSmallDevice ? 20 : 20,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    height: isSmallDevice ? 44 : 52,
    gap: isSmallDevice ? 8 : 10,
    overflow: 'hidden',
    ...shadowSm,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 18 : 20,
    height: isSmallDevice ? 18 : 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
    margin: 0,
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const, includeFontPadding: false }
      : {}),
  },
  resultsScroll: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
  },
  resultsContentEmpty: {
    flexGrow: 1,
  },
  section: {
    marginBottom: isSmallDevice ? 22 : 26,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 8 : 10,
    minHeight: isSmallDevice ? 22 : 24,
  },
  sectionHeading: {
    flex: 1,
    minWidth: 0,
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 24,
    fontWeight: '800',
    color: TEXT_BLACK,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  sectionCount: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 24,
    fontWeight: '600',
    color: TEXT_MUTED,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  viewAllBtn: {
    justifyContent: 'center',
    minHeight: 24,
  },
  viewAllText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 24,
    fontWeight: '600',
    color: PRIMARY,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  enterpriseList: {
    gap: isSmallDevice ? 10 : 12,
  },
  serviceList: {
    gap: isSmallDevice ? 10 : 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  eventList: {
    gap: isSmallDevice ? 10 : 12,
  },
  courseList: {
    gap: isSmallDevice ? 10 : 12,
  },
  loadingState: {
    paddingVertical: isSmallDevice ? 24 : 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
