import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  CheckIcon,
  CirclePlayIcon,
  LockIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import {
  type CourseModule,
  type ModuleStatus,
} from '@/constants/courses';
import {
  AVATAR_RADIUS,
  INSTRUCTOR_AVATAR_SIZE,
  PRIMARY,
  styles,
} from '@/screens/events/courses/CourseDetailScreen.styles';

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

export {
  CurriculumCard,
  HeroFadeOverlay,
  InstructorAvatar,
  ProgressBar,
  RatingStars,
  StatCard,
};
