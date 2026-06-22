import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchIcon } from '@/components/dashboard/DashboardIcons';
import {
  COURSE_LEVEL_FILTERS,
  filterCourses,
  type Course,
} from '@/constants/courses';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';
const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SEARCH_BORDER = '#E0E7E1';
const LEVEL_BLUE_50 = '#eff6ff';
const LEVEL_BLUE_700 = '#1d4ed8';
const H_PAD = 20;
const COURSE_IMAGE_WIDTH = 120;

function CourseCard({ course }: { course: Course }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(main)/course/${course.id}`)}
      style={({ pressed }) => [styles.courseCard, pressed && styles.cardPressed]}
    >
      <Image
        source={{ uri: course.image }}
        style={styles.courseImage}
        contentFit="cover"
      />

      <View style={styles.courseContent}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{course.level}</Text>
        </View>
        <Text style={styles.courseName} numberOfLines={2}>
          {course.name}
        </Text>
        <Text style={styles.instructorName} numberOfLines={1}>
          {course.instructor}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{course.lessons} lessons</Text>
          <Text style={styles.statText}>{course.weeks} wks</Text>
          <Text style={styles.statText}>{course.enrolled} enrolled</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState<string>('All');

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

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <Text style={styles.title}>Training Courses</Text>

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

      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
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
  topSection: {
    backgroundColor: BODY_BG,
    paddingHorizontal: H_PAD,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '900',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 12 :  16,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F3',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 12 :  16,
    height: isSmallDevice ? 40 : 48,
    marginBottom: isSmallDevice ? 12 :  16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  filtersScroll: {
    gap: isSmallDevice ? 6 :  8,
    paddingBottom: isSmallDevice ? 12 :  16,
  },
  filterChip: {
    paddingHorizontal: isSmallDevice ? 12 :  16,
    paddingVertical: isSmallDevice ? 4 :  6,
    borderRadius: 20,
    backgroundColor: MINT,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  listScroll: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingBottom: 24,
    gap: 12,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 14 :  16,
    borderWidth: 1,
    borderColor: BORDER,
    ...shadowSm,
  },
  courseImage: {
    width: COURSE_IMAGE_WIDTH,
    alignSelf: 'stretch',
    minHeight: isSmallDevice ? 100 : 108,
    backgroundColor: '#E8EDEA',
    borderTopLeftRadius: isSmallDevice ? 14 :  15,
    borderBottomLeftRadius: isSmallDevice ? 14 :  15,
    overflow: 'hidden',
    flexShrink: 0,
  },
  courseContent: {
    flex: 1,
    minWidth: 0,
    paddingVertical: isSmallDevice ? 12 :  14,
    paddingRight: isSmallDevice ? 12 :    14,
    paddingLeft: 12,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: LEVEL_BLUE_50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  levelBadgeText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '600',
    color: LEVEL_BLUE_700,
  },
  courseName: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 4,
  },
  instructorName: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  cardPressed: {
    opacity: 0.92,
  },
});
