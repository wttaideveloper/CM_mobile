import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { type Course } from '@/constants/courses';
import { HERO_HEIGHT, SCREEN_WIDTH, styles } from '@/screens/events/courses/CourseDetailScreen.styles';

import {
  CurriculumCard,
  HeroFadeOverlay,
  InstructorAvatar,
  ProgressBar,
  RatingStars,
  StatCard,
} from '@/screens/events/courses/CourseDetailScreenParts.shared';
import {
  instructorInitial,
  levelHeroStyle,
} from '@/screens/events/courses/CourseDetailScreenParts.utils';

export function CourseDetailHero({
  course,
  onBack,
}: {
  course: Course;
  onBack: () => void;
}) {
  const levelStyle = levelHeroStyle(course.level);

  return (
    <View style={[styles.hero, { height: HERO_HEIGHT }]}>
      <Image
        source={{ uri: course.detailImage }}
        style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
        contentFit="cover"
      />

      <HeroFadeOverlay width={SCREEN_WIDTH} height={HERO_HEIGHT} />

      <View style={styles.heroActions}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.heroBottom}>
        <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
          <Text style={[styles.levelBadgeText, { color: levelStyle.text }]}>
            {course.level.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.heroTitle}>{course.name}</Text>
      </View>
    </View>
  );
}

export function CourseDetailContent({ course }: { course: Course }) {
  const progress = course.enrollmentProgress;
  const showProgress = course.isEnrolled && progress;

  return (
    <View style={styles.contentSheet}>
      <View style={styles.instructorRow}>
        <InstructorAvatar initial={instructorInitial(course.instructor)} />
        <View style={styles.instructorInfo}>
          <Text style={styles.instructorName}>{course.instructor}</Text>
          <Text style={styles.instructorRole} numberOfLines={1}>
            Certified Trainer · {course.enterprise}
          </Text>
        </View>
        <RatingStars rating={course.rating} />
      </View>

      <View style={styles.statsRow}>
        <StatCard emoji="📚" value={String(course.lessons)} label="Lessons" />
        <StatCard emoji="⏱" value={`${course.weeks} weeks`} label="Duration" />
        <StatCard emoji="👥" value={String(course.enrolled)} label="Enrolled" />
      </View>

      {showProgress && progress ? (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressPercent}>{progress.percent}% complete</Text>
          </View>

          <ProgressBar percent={progress.percent} />

          <Text style={styles.progressMeta}>
            Week {progress.currentWeek} · Lesson {progress.currentLesson} of{' '}
            {progress.totalLessons} completed
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Course Curriculum</Text>

      <View style={styles.modulesList}>
        {course.modules.map((module) => (
          <CurriculumCard key={module.id} module={module} />
        ))}
      </View>
    </View>
  );
}

export function CourseDetailFooter({
  footerLabel,
  paddingBottom,
  onEnroll,
}: {
  footerLabel: string;
  paddingBottom: number;
  onEnroll: () => void;
}) {
  return (
    <View style={[styles.footer, { paddingBottom, paddingTop: 10 }]}>
      <LeafyGradientButton
        onPress={onEnroll}
        style={styles.footerBtn}
        borderRadius={14}
      >
        <Text style={styles.footerBtnText}>{footerLabel}</Text>
      </LeafyGradientButton>
    </View>
  );
}
