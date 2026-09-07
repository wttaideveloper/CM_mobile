import { StarIcon } from '@/components/dashboard/DashboardIcons';
import type { Course, CourseLevel } from '@/constants/courses';
import { detailHref } from '@/utils/searchNavigation';
import {
  CONTINUE_CARD_HEIGHT,
  H_PAD,
  LEVEL_ADVANCED_BG,
  LEVEL_ADVANCED_TEXT,
  LEVEL_ALL_BG,
  LEVEL_ALL_TEXT,
  LEVEL_BEGINNER_BG,
  LIST_IMAGE_WIDTH,
  PRIMARY,
  SCREEN_WIDTH_EXPORT,
  styles,
} from '@/screens/events/courses/CoursesScreen.styles';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export function levelChipStyle(level: CourseLevel) {
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

export function ContinueLearningCard({ course }: { course: Course }) {
  const router = useRouter();
  const progress = course.enrollmentProgress;
  const cardWidth = SCREEN_WIDTH_EXPORT - H_PAD * 2;

  if (!progress) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.push(detailHref('/(main)/course', course.id))}
      accessibilityRole="button"
      accessibilityLabel={`Continue ${course.name}, ${progress.percent}% complete`}
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
      accessibilityRole="button"
      accessibilityLabel={`${course.name}, ${course.level}, ${course.priceLabel}`}
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
