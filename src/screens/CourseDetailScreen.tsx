import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';

import {
  CheckIcon,
  ChevronLeftIcon,
  CirclePlayIcon,
  LockIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import {
  getCourseById,
  type CourseLevel,
  type CourseModule,
  type ModuleStatus,
} from '@/constants/courses';
import { useDetailBack } from '@/hooks/useDetailBack';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#6B7280';
const TEXT_BLACK = '#111111';
const CARD_BG = '#F5F7F5';
const BORDER = '#E8EDEA';
const LEVEL_BEGINNER_BG = '#2563EB';
const LEVEL_ADVANCED_BG = '#FEE2E2';
const LEVEL_ADVANCED_TEXT = '#DC2626';
const LEVEL_ALL_BG = '#EFF6FF';
const LEVEL_ALL_TEXT = '#1D4ED8';
const INSTRUCTOR_AVATAR_SIZE = isSmallDevice ? 40 : 44;
const AVATAR_RADIUS = isSmallDevice ? 10 : 12;
const MODULE_ICON_SIZE = isSmallDevice ? 32 : 36;
const MODULE_ICON_RADIUS = isSmallDevice ? 10 : 12;
const PROGRESS_HEIGHT = isSmallDevice ? 6 : 8;
const HERO_BTN_SIZE = isSmallDevice ? 34 : 38;
const HERO_BTN_BG = 'rgba(0, 0, 0, 0.45)';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = isSmallDevice ? 16 : 20;
const HERO_HEIGHT = Math.round(SCREEN_WIDTH * (isSmallDevice ? 220 / 375 : 250 / 375));

function instructorInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function levelHeroStyle(level: CourseLevel) {
  switch (level) {
    case 'Beginner':
      return { bg: LEVEL_BEGINNER_BG, text: '#FFFFFF' };
    case 'Advanced':
      return { bg: LEVEL_ADVANCED_BG, text: LEVEL_ADVANCED_TEXT };
    default:
      return { bg: LEVEL_ALL_BG, text: LEVEL_ALL_TEXT };
  }
}

function HeroFadeOverlay({ width, height }: { width: number; height: number }) {
  const fadeHeight = Math.round(height * 0.55);

  return (
    <>
      <View style={styles.heroScrim} pointerEvents="none" />
      <Svg
        width={width}
        height={fadeHeight}
        style={[styles.heroFade, { height: fadeHeight }]}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="courseHeroFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.55} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={fadeHeight} fill="url(#courseHeroFade)" />
      </Svg>
    </>
  );
}

function InstructorAvatar({ initial }: { initial: string }) {
  return (
    <View style={styles.instructorAvatar}>
      <Svg
        width={INSTRUCTOR_AVATAR_SIZE}
        height={INSTRUCTOR_AVATAR_SIZE}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="instructorAvatarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F5D4E" />
            <Stop offset="1" stopColor="#3E7041" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={INSTRUCTOR_AVATAR_SIZE}
          height={INSTRUCTOR_AVATAR_SIZE}
          rx={AVATAR_RADIUS}
          fill="url(#instructorAvatarGrad)"
        />
      </Svg>
      <Text style={styles.instructorAvatarText}>{initial}</Text>
    </View>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const count = Math.min(5, Math.max(1, Math.round(rating)));

  return (
    <View style={styles.ratingRow}>
      {Array.from({ length: count }).map((_, index) => (
        <StarIcon key={index} size={14} color="#F59E0B" />
      ))}
    </View>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${percent}%` }]} />
    </View>
  );
}

function StatCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ModuleIcon({ status }: { status?: ModuleStatus }) {
  if (status === 'done') {
    return (
      <View style={[styles.moduleIcon, styles.moduleIconDone]}>
        <CheckIcon size={16} color="#FFFFFF" />
      </View>
    );
  }

  if (status === 'in_progress') {
    return (
      <View style={[styles.moduleIcon, styles.moduleIconActive]}>
        <CirclePlayIcon size={18} color={PRIMARY} />
      </View>
    );
  }

  if (status === 'locked') {
    return (
      <View style={[styles.moduleIcon, styles.moduleIconLocked]}>
        <LockIcon size={14} color="#9CA3AF" />
      </View>
    );
  }

  return (
    <View style={[styles.moduleIcon, styles.moduleIconDefault]}>
      <Text style={styles.moduleIconDefaultText}>📖</Text>
    </View>
  );
}

function ModuleStatusLabel({ status }: { status?: ModuleStatus }) {
  if (status === 'done') {
    return <Text style={styles.moduleStatusDone}>✓ Done</Text>;
  }

  if (status === 'in_progress') {
    return <Text style={styles.moduleStatusActive}>In Progress</Text>;
  }

  return null;
}

function CurriculumCard({ module }: { module: CourseModule }) {
  const isLocked = module.status === 'locked';
  const isActive = module.status === 'in_progress';

  return (
    <View
      style={[
        styles.moduleCard,
        isActive && styles.moduleCardActive,
        isLocked && styles.moduleCardLocked,
      ]}
    >
      <ModuleIcon status={module.status} />

      <View style={styles.moduleText}>
        <Text style={[styles.moduleWeek, isLocked && styles.moduleTextLocked]}>{module.weekRange}</Text>
        <Text
          style={[styles.moduleTitle, isLocked && styles.moduleTextLocked]}
          numberOfLines={2}
        >
          {module.title}
        </Text>
      </View>

      <View style={styles.moduleMeta}>
        <Text style={[styles.moduleLessons, isLocked && styles.moduleTextLocked]}>
          {module.lessonCount} lessons
        </Text>
        <ModuleStatusLabel status={module.status} />
      </View>
    </View>
  );
}

export function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useDetailBack();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();

  const course = id ? getCourseById(id) : undefined;

  if (!course) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="notFound"
          entity="course"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const levelStyle = levelHeroStyle(course.level);
  const progress = course.enrollmentProgress;
  const showProgress = course.isEnrolled && progress;
  const footerLabel = showProgress
    ? 'Continue Learning →'
    : course.isFree
      ? 'Enroll Now — Free'
      : `Enroll Now — ${course.priceLabel}`;

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.body}>
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}
        >
          <View style={[styles.hero, { height: HERO_HEIGHT }]}>
            <Image
              source={{ uri: course.detailImage }}
              style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
              contentFit="cover"
            />

            <HeroFadeOverlay width={SCREEN_WIDTH} height={HERO_HEIGHT} />

            <View style={styles.heroActions}>
              <Pressable
                onPress={goBack}
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
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 10, paddingTop: 10 },
          ]}
        >
          <LeafyGradientButton
            onPress={() => router.replace('/(main)/(tabs)/events/appointments')}
            style={styles.footerBtn}
            borderRadius={14}
          >
            <Text style={styles.footerBtnText}>{footerLabel}</Text>
          </LeafyGradientButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  statusBarFill: {
    backgroundColor: '#1A1A1A',
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  hero: {
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  heroImage: {
    backgroundColor: '#E8EDEA',
  },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingTop: isSmallDevice ? 12 : 16,
  },
  heroBtn: {
    width: HERO_BTN_SIZE,
    height: HERO_BTN_SIZE,
    borderRadius: HERO_BTN_SIZE / 2,
    backgroundColor: HERO_BTN_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: H_PAD,
    right: H_PAD,
    bottom: isSmallDevice ? 16 : 20,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  levelBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 11 : 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: isSmallDevice ? 18 : 22,
    lineHeight: isSmallDevice ? 24 : 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  contentSheet: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 14 : 18,
    paddingBottom: 8,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  instructorAvatar: {
    width: INSTRUCTOR_AVATAR_SIZE,
    height: INSTRUCTOR_AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  instructorAvatarText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructorInfo: {
    flex: 1,
    minWidth: 0,
  },
  instructorName: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  instructorRole: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: CARD_BG,
    borderRadius: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 4 : 6,
    alignItems: 'center',
    gap: isSmallDevice ? 2 : 4,
  },
  statEmoji: {
    fontSize: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  statValue: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 18,
    fontWeight: '800',
    color: TEXT_BLACK,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: MINT,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 12 : 14,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 8 : 10,
  },
  progressTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: PRIMARY,
  },
  progressPercent: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: PRIMARY,
  },
  progressTrack: {
    height: PROGRESS_HEIGHT,
    borderRadius: PROGRESS_HEIGHT / 2,
    backgroundColor: 'rgba(31, 93, 78, 0.15)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: PROGRESS_HEIGHT / 2,
    backgroundColor: PRIMARY,
  },
  progressMeta: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: 'rgb(90, 122, 112)',
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  modulesList: {
    gap: isSmallDevice ? 8 : 10,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 10 : 12,
    gap: isSmallDevice ? 10 : 12,
    ...shadowSm,
  },
  moduleCardActive: {
    borderColor: PRIMARY,
    backgroundColor: '#F7FBF8',
  },
  moduleCardLocked: {
    backgroundColor: '#FAFAFA',
  },
  moduleIcon: {
    width: MODULE_ICON_SIZE,
    height: MODULE_ICON_SIZE,
    borderRadius: MODULE_ICON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleIconDone: {
    backgroundColor: PRIMARY,
  },
  moduleIconActive: {
    backgroundColor: '#FFFFFF',
  },
  moduleIconLocked: {
    backgroundColor: '#F5F7F6',
  },
  moduleIconDefault: {
    backgroundColor: MINT,
  },
  moduleIconDefaultText: {
    fontSize: isSmallDevice ? 12 : 14,
  },
  moduleText: {
    flex: 1,
    minWidth: 0,
  },
  moduleWeek: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 2 : 3,
  },
  moduleTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  moduleTextLocked: {
    color: '#9CA3AF',
  },
  moduleMeta: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 4,
  },
  moduleLessons: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  moduleStatusDone: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: 'rgb(34, 197, 94)',
  },
  moduleStatusActive: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: H_PAD,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    ...shadowSm,
  },
  footerBtn: {
    height: isSmallDevice ? 44 : 48,
  },
  footerBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
});
