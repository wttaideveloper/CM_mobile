import { EmptyState } from '@/components/EmptyState';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChevronLeftIcon, SearchIcon } from '@/components/dashboard/DashboardIcons';
import { ContinueLearningCard, CourseCard } from '@/components/courses/CourseCards';
import {
  COURSE_LEVEL_FILTERS,
  filterCourses,
  getBrowseCourses,
  getEnrolledCourse,
} from '@/constants/courses';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import { isFromSearchParam } from '@/utils/searchNavigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRIMARY, styles, TEXT_MUTED } from '@/screens/events/courses/CoursesScreen.styles';
import { isSmallDevice } from '@/utils/responsive';

export { CourseCard } from '@/components/courses/CourseCards';

const LIST_GAP = isSmallDevice ? 10 : 12;

export function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const routeSearch = useRouteSearchParam();
  const { fromSearch } = useLocalSearchParams<{ fromSearch?: string }>();
  const openedFromSearch = isFromSearchParam(fromSearch);
  const { search, setSearch } = useSyncedSearchState(routeSearch);
  const [activeLevel, setActiveLevel] = useState<string>('All');

  const enrolledCourse = getEnrolledCourse();
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return filterCourses(activeLevel).filter((course) => {
      if (query.length === 0) return true;
      return (
        course.name.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.level.toLowerCase().includes(query)
      );
    });
  }, [activeLevel, search]);

  const browseCourses = useMemo(() => getBrowseCourses(filteredCourses), [filteredCourses]);
  const showContinue =
    enrolledCourse &&
    (activeLevel === 'All' ||
      filteredCourses.some((course) => course.id === enrolledCourse.id));

  const listHeader = (
    <>
      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.headerRow}>
          {openedFromSearch ? (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.backBtn, pressed && styles.cardPressed]}
              hitSlop={8}
            >
              <ChevronLeftIcon size={22} color={PRIMARY} />
            </Pressable>
          ) : null}
          <Text style={styles.title}>Learn</Text>
          {!openedFromSearch ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="My Courses"
              style={({ pressed }) => [styles.myCoursesBtn, pressed && styles.cardPressed]}
            >
              <Text style={styles.myCoursesBtnText}>My Courses</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            accessibilityLabel="Search courses"
          />
        </View>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {COURSE_LEVEL_FILTERS.map((level) => {
            const isActive = activeLevel === level;
            return (
              <Pressable
                key={level}
                onPress={() => setActiveLevel(level)}
                accessibilityRole="button"
                accessibilityLabel={level}
                accessibilityState={{ selected: isActive }}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {showContinue && enrolledCourse ? (
          <>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <ContinueLearningCard course={enrolledCourse} />
          </>
        ) : null}

        {browseCourses.length > 0 ? (
          <Text style={[styles.sectionTitle, showContinue && styles.sectionTitleSpaced]}>
            Browse Courses
          </Text>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      {openedFromSearch ? (
        <>
          <AppStatusBar />
          <StatusBarFill />
        </>
      ) : null}
      <FlatList
        data={browseCourses}
        keyExtractor={(item) => item.id}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={!showContinue ? <EmptyState entity="courses" /> : null}
        ItemSeparatorComponent={() => <View style={{ height: LIST_GAP }} />}
        renderItem={({ item }) => (
          <View style={styles.content}>
            <CourseCard course={item} />
          </View>
        )}
      />
    </View>
  );
}
