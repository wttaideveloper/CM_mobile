import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyState } from '@/components/EmptyState';
import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeftIcon, SearchIcon, StarIcon } from '@/components/dashboard/DashboardIcons';
import { useRouteSearchParam, useSyncedSearchState } from '@/hooks/useRouteSearchParam';
import { isFromSearchParam } from '@/utils/searchNavigation';
import {
  COURSE_LEVEL_FILTERS,
  filterCourses,
  getBrowseCourses,
  getEnrolledCourse,
  type Course,
  type CourseLevel,
} from '@/constants/courses';
import { detailHref } from '@/utils/searchNavigation';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F7F8F9';
const TEXT_MUTED = '#9CA3AF';
const TEXT_BLACK = '#111111';
const CHIP_INACTIVE_BG = '#F3F4F6';
const SEARCH_BG = '#F3F4F6';
const LEVEL_BEGINNER_BG = '#EAF4EC';
const LEVEL_ADVANCED_BG = '#FEE2E2';
const LEVEL_ADVANCED_TEXT = '#DC2626';
const LEVEL_ALL_BG = '#EFF6FF';
const LEVEL_ALL_TEXT = '#1D4ED8';
const PRICE_PAID_TEXT = '#B45309';
const H_PAD = isSmallDevice ? 16 : 20;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTINUE_CARD_HEIGHT = Math.round(((SCREEN_WIDTH - H_PAD * 2) * 136) / 375);
const LIST_IMAGE_WIDTH = isSmallDevice ? 100 : 108;

function levelChipStyle(level: CourseLevel) {
  switch (level) {
    case 'Beginner':
      return { bg: LEVEL_BEGINNER_BG, text: PRIMARY };
    case 'Advanced':
      return { bg: LEVEL_ADVANCED_BG, text: LEVEL_ADVANCED_TEXT };
    case 'Intermediate':
      return { bg: LEVEL_ALL_BG, text: LEVEL_ALL_TEXT };
    default:
      return { bg: LEVEL_ALL_BG, text: LEVEL_ALL_TEXT };
  }
}

function CourseImageWithMask({ uri, maskId }: { uri: string; maskId: string }) {
  const [imageHeight, setImageHeight] = useState(LIST_IMAGE_WIDTH);
  const gradientId = `courseImageFade-${maskId}`;

  return (
    <View
      style={[styles.courseImageWrap, { width: LIST_IMAGE_WIDTH }]}
      onLayout={(event) => {
        const nextHeight = event.nativeEvent.layout.height;
        if (nextHeight > 0) {
          setImageHeight(nextHeight);
        }
      }}
    >
      <Image
        source={{ uri }}
        style={[styles.courseImage, { width: LIST_IMAGE_WIDTH }]}
        contentFit="cover"
      />
      {imageHeight > 0 ? (
        <Svg
          width={LIST_IMAGE_WIDTH}
          height={imageHeight}
          style={styles.courseImageMask}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
              <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0}
            y={0}
            width={LIST_IMAGE_WIDTH}
            height={imageHeight}
            fill={`url(#${gradientId})`}
          />
        </Svg>
      ) : null}
    </View>
  );
}

function ContinueLearningCard({ course }: { course: Course }) {
  const router = useRouter();
  const progress = course.enrollmentProgress;
  const cardWidth = SCREEN_WIDTH - H_PAD * 2;

  if (!progress) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.push(detailHref('/(main)/course', course.id))}
      style={({ pressed }) => [styles.continueCard, pressed && styles.cardPressed]}
    >
      <Svg width={cardWidth} height={CONTINUE_CARD_HEIGHT} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="continueCourseGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#163D34" />
            <Stop offset="0.5" stopColor="#1F5D4E" />
            <Stop offset="1" stopColor="#2B773F" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={cardWidth}
          height={CONTINUE_CARD_HEIGHT}
          rx={20}
          fill="url(#continueCourseGrad)"
        />
      </Svg>

      <View style={styles.continueGlow} pointerEvents="none" />

      <View style={styles.continueContent}>
        <Text style={styles.continueBadge}>CURRENTLY ENROLLED</Text>
        <Text style={styles.continueTitle} numberOfLines={2}>
          {course.name}
        </Text>

        <View style={styles.continueProgressTrack}>
          <View style={[styles.continueProgressFill, { width: `${progress.percent}%` }]} />
        </View>

        <View style={styles.continueFooter}>
          <Text style={styles.continueMeta}>
            Week {progress.currentWeek} of {progress.totalWeeks} · Lesson {progress.currentLesson}/
            {progress.totalLessons}
          </Text>
          <Text style={styles.continuePercent}>{progress.percent}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function CourseCard({
  course,
  fromSearch,
}: {
  course: Course;
  fromSearch?: boolean;
}) {
  const router = useRouter();
  const levelStyle = levelChipStyle(course.level);

  return (
    <Pressable
      onPress={() => router.push(detailHref('/(main)/course', course.id, fromSearch))}
      style={({ pressed }) => [styles.courseCard, pressed && styles.cardPressed]}
    >
      <CourseImageWithMask uri={course.image} maskId={course.id} />

      <View style={styles.courseContent}>
        <View style={styles.tagRow}>
          <View style={[styles.levelChip, { backgroundColor: levelStyle.bg }]}>
            <Text style={[styles.levelChipText, { color: levelStyle.text }]}>{course.level}</Text>
          </View>
          <Text
            style={[
              styles.priceText,
              course.isFree ? styles.priceTextFree : styles.priceTextPaid,
            ]}
          >
            {course.priceLabel}
          </Text>
        </View>

        <Text style={styles.courseName} numberOfLines={2}>
          {course.name}
        </Text>
        <Text style={styles.instructorName} numberOfLines={1}>
          by {course.instructor}
        </Text>

        <View style={styles.statsRow}>
          <StarIcon size={13} color="#F59E0B" />
          <Text style={styles.statText}>{course.rating.toFixed(1)}</Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.statText}>{course.lessons} lessons</Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.statText}>{course.weeks} weeks</Text>
        </View>
      </View>
    </Pressable>
  );
}

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

  return (
    <View style={styles.screen}>
      {openedFromSearch ? (
        <>
          <AppStatusBar />
          <StatusBarFill />
        </>
      ) : null}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.topSection, { paddingTop: 12 }]}>
          <View style={styles.headerRow}>
            {openedFromSearch ? (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backBtn, pressed && styles.cardPressed]}
                hitSlop={8}
              >
                <ChevronLeftIcon size={22} color={PRIMARY} />
              </Pressable>
            ) : null}
            <Text style={styles.title}>Learn</Text>
            {!openedFromSearch ? (
              <Pressable style={({ pressed }) => [styles.myCoursesBtn, pressed && styles.cardPressed]}>
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
            <>
              <Text style={[styles.sectionTitle, showContinue && styles.sectionTitleSpaced]}>
                Browse Courses
              </Text>
              <View style={styles.list}>
                {browseCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </View>
            </>
          ) : !showContinue ? (
            <EmptyState entity="courses" />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  topSection: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 10 : 12,
    gap: 8,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
    flex: 1,
    minWidth: 0,
  },
  myCoursesBtn: {
    backgroundColor: MINT,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 8 : 10,
  },
  myCoursesBtnText: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: PRIMARY,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEARCH_BG,
    borderRadius: isSmallDevice ? 12 : 14,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    height: isSmallDevice ? 42 : 46,
    marginBottom: isSmallDevice ? 12 : 14,
    gap: isSmallDevice ? 8 : 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 18 : 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  filtersScroll: {
    gap: isSmallDevice ? 6 : 8,
    paddingBottom: isSmallDevice ? 14 : 18,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 16 : 20,
    backgroundColor: CHIP_INACTIVE_BG,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: BODY_BG,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  sectionTitleSpaced: {
    marginTop: isSmallDevice ? 16 : 20,
  },
  continueCard: {
    height: CONTINUE_CARD_HEIGHT,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    marginBottom: 4,
  },
  continueGlow: {
    position: 'absolute',
    top: isSmallDevice ? -16 : -20,
    right: isSmallDevice ? -8 : -10,
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    borderRadius: isSmallDevice ? 50 : 60,
    backgroundColor: 'rgba(76, 175, 80, 0.22)',
  },
  continueContent: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    justifyContent: 'center',
    gap: isSmallDevice ? 8 : 10,
  },
  continueBadge: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 11 : 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.6,
  },
  continueTitle: {
    fontSize: isSmallDevice ? 17 : 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  continueProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  continueProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  continueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  continueMeta: {
    flex: 1,
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  continuePercent: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  list: {
    gap: isSmallDevice ? 10 : 12,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 14 : 16,
    overflow: 'hidden',
    minHeight: LIST_IMAGE_WIDTH,
    ...shadowSm,
  },
  courseImageWrap: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
  },
  courseImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#E8EDEA',
  },
  courseImageMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    height: '100%',
  },
  courseContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingRight: isSmallDevice ? 10 : 12,
    paddingLeft: 4,
    minHeight: LIST_IMAGE_WIDTH,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  levelChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelChipText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
  },
  priceText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '800',
  },
  priceTextFree: {
    color: PRIMARY,
  },
  priceTextPaid: {
    color: PRICE_PAID_TEXT,
  },
  courseName: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: 3,
  },
  instructorName: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  statDot: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    color: TEXT_MUTED,
  },
  cardPressed: {
    opacity: 0.92,
  },
});
