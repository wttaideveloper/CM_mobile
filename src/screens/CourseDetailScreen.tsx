import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BookOpenIcon,
  ChevronLeftIcon,
} from '@/components/dashboard/DashboardIcons';
import { getCourseById, type CourseModule } from '@/constants/courses';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const BODY_BG = '#F5F7F5';
const LEVEL_BLUE_50 = '#eff6ff';
const LEVEL_BLUE_700 = '#1d4ed8';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 20;
const HERO_HEIGHT = Math.round(SCREEN_WIDTH * (240 / 375));

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ModuleCard({ module }: { module: CourseModule }) {
  return (
    <View style={styles.moduleCard}>
      <View style={styles.moduleIconWrap}>
        <BookOpenIcon size={18} color={PRIMARY} />
      </View>
      <View style={styles.moduleText}>
        <Text style={styles.moduleWeek}>{module.weekRange}</Text>
        <Text style={styles.moduleTitle} numberOfLines={2}>
          {module.title}
        </Text>
      </View>
      <Text style={styles.moduleLessons}>{module.lessonCount} lessons</Text>
    </View>
  );
}

export function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();

  const course = id ? getCourseById(id) : undefined;

  if (!course) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Course not found</Text>
      </View>
    );
  }

  const enrollLabel = course.isFree
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
          contentContainerStyle={{
            paddingBottom: insets.bottom + 24,
          }}
        >
          <View style={[styles.hero, { height: HERO_HEIGHT }]}>
            <Image
              source={{ uri: course.detailImage }}
              style={[styles.heroImage, { width: SCREEN_WIDTH, height: HERO_HEIGHT }]}
              contentFit="cover"
            />

            <View style={styles.heroActions}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
                hitSlop={8}
              >
                <ChevronLeftIcon size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{course.level}</Text>
            </View>

            <Text style={styles.courseTitle}>{course.name}</Text>
            <Text style={styles.providerText}>
              by {course.instructor} · {course.enterprise}
            </Text>

            <View style={styles.statsRow}>
              <StatCard value={String(course.lessons)} label="Lessons" />
              <StatCard value={`${course.weeks} wks`} label="Duration" />
              <StatCard value={String(course.enrolled)} label="Enrolled" />
            </View>

            <Text style={styles.description}>{course.description}</Text>

            <Text style={styles.sectionTitle}>COURSE MODULES</Text>

            <View style={styles.modulesList}>
              {course.modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </View>

            <Pressable
              onPress={() => router.replace('/(main)/(tabs)/events/appointments')}
              style={({ pressed }) => [styles.enrollBtn, pressed && styles.pressed]}
            >
              <Text style={styles.enrollBtnText}>{enrollLabel}</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  hero: {
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  heroImage: {
    height: isSmallDevice ? 160 :  HERO_HEIGHT,
    backgroundColor: '#E8EDEA',
  },
  heroActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: isSmallDevice ? 12 :  16,
    paddingTop: isSmallDevice ? 6 :  8,
    paddingBottom: isSmallDevice ? 6 :  8,
  },
  heroBtn: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 16 :  20,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: LEVEL_BLUE_50,
    paddingHorizontal: isSmallDevice ? 8 :  10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: isSmallDevice ? 10 :  12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  levelBadgeText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '600',
    color: LEVEL_BLUE_700,
  },
  courseTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '900',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 6 :  8,
  },
  providerText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 16 :  20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 :  10,
    marginBottom: isSmallDevice ? 12 :  15,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: BODY_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 12 :  14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: 22,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  description: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 22,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '700',
    color: TEXT_BLACK,
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  modulesList: {
    gap: 10,
    marginBottom: 24,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BODY_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 12,
  },
  moduleIconWrap: {
    width: isSmallDevice ? 36 :   40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: 20,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleText: {
    flex: 1,
    minWidth: 0,
  },
  moduleWeek: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  moduleLessons: {
    fontSize: isSmallDevice ? 11 :    12,
    lineHeight: 16,
    fontWeight: '500',
    color: TEXT_MUTED,
    flexShrink: 0,
  },
  enrollBtn: {
    height: isSmallDevice ? 40 : 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
  errorText: {
    margin: 24,
    fontSize: isSmallDevice ? 14 : 16,
    color: TEXT_MUTED,
  },
});
