import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  CourseCheckIcon,
  CoursePlayFillIcon,
} from '@/components/market/CourseLearningIcons';
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import {
  getTrainingProgressPath,
  type TrainingDay,
  type TrainingLesson,
  type TrainingProgressPath,
} from '@/components/market/marketTrainingProgressData';
import {
  isApiTrainingId,
  useTrainingContent,
} from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import {
  useTrainingProgressStore,
  VIDEO_COMPLETE_THRESHOLD,
} from '@/stores/trainingProgress.store';
import { c, NU } from '@/utils/newUiCompact';

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80';

function loadingPathFor(id?: string): TrainingProgressPath {
  return {
    trainingId: id ?? '',
    title: 'Loading…',
    vendor: '',
    instructor: '',
    bannerUrl: FALLBACK_BANNER,
    deliveryMode: 'Virtual',
    days: [],
    exams: {},
  };
}

const EMPTY_BUCKET = {
  completedLessons: {} as Record<string, string>,
  videoWatchPercent: {} as Record<string, number>,
  examAttempts: {} as Record<
    string,
    {
      examId: string;
      answers: Record<string, string>;
      scorePercent: number;
      passed: boolean;
      submittedAt: string;
    }
  >,
  activeLessonId: undefined as string | undefined,
};

function ProgressTracker({
  percent,
  label,
}: {
  percent: number;
  label: string;
}) {
  return (
    <View style={styles.tracker}>
      <View style={styles.trackerRow}>
        <Text style={styles.trackerLabel}>{label}</Text>
        <Text style={styles.trackerPercent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, percent)}%` }]} />
      </View>
    </View>
  );
}

function DoneCheckbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked ? <CourseCheckIcon color="#FFFFFF" size={12} /> : null}
    </View>
  );
}

/** Decorative static QR (not a real encoded QR). */
function StaticQrPass({ seed }: { seed: string }) {
  const size = 17;
  const cells = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false),
    );
    const paintFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y += 1) {
        for (let x = 0; x < 7; x += 1) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = edge || center;
        }
      }
    };
    paintFinder(0, 0);
    paintFinder(size - 7, 0);
    paintFinder(0, size - 7);
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const inFinder =
          (x < 8 && y < 8) ||
          (x >= size - 8 && y < 8) ||
          (x < 8 && y >= size - 8);
        if (inFinder) continue;
        hash = (hash * 1664525 + 1013904223) >>> 0;
        grid[y][x] = hash % 3 !== 0;
      }
    }
    return grid;
  }, [seed]);

  return (
    <View style={styles.qrOuter}>
      <View style={styles.qrInner}>
        {cells.map((row, y) => (
          <View key={`r-${y}`} style={styles.qrRow}>
            {row.map((on, x) => (
              <View
                key={`c-${y}-${x}`}
                style={[styles.qrCell, on ? styles.qrCellOn : styles.qrCellOff]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function InlineVideoPlayer({
  lesson,
  watchPercent,
  playing,
  onTogglePlay,
}: {
  lesson: TrainingLesson;
  watchPercent: number;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <View style={styles.inlinePlayer}>
      <View style={styles.videoStage}>
        {lesson.imageUrl ? (
          <Image
            source={{ uri: lesson.imageUrl }}
            style={styles.videoStageImage}
            contentFit="cover"
            transition={200}
          />
        ) : null}
        <View style={styles.videoStageScrim} />
        <Pressable
          style={styles.playOuter}
          onPress={onTogglePlay}
          accessibilityRole="button"
        >
          <View style={styles.playInner}>
            <CoursePlayFillIcon size={18} color="#FFFFFF" />
          </View>
        </Pressable>
        <Text style={styles.videoCaption}>
          {playing
            ? `Watching · ${watchPercent}% seen`
            : watchPercent > 0
              ? `Paused · ${watchPercent}% seen`
              : 'Tap play to watch this lesson'}
        </Text>
      </View>
      <View style={styles.watchMetaRow}>
        <Text style={styles.watchMeta}>
          Seen {watchPercent}% · completes at {VIDEO_COMPLETE_THRESHOLD}%
        </Text>
        <Text style={styles.watchMeta}>{lesson.duration}</Text>
      </View>
      <View style={styles.watchTrack}>
        <View
          style={[
            styles.watchFill,
            { width: `${Math.min(100, watchPercent)}%` },
          ]}
        />
      </View>
    </View>
  );
}

export function MarketMyTrainingProgressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isApiId = isApiTrainingId(id);
  const contentQuery = useTrainingContent(id);
  const path =
    isApiId
      ? (contentQuery.path ?? loadingPathFor(id))
      : getTrainingProgressPath(id);
  const trainingId = path.trainingId || id || '';

  const bucket = useTrainingProgressStore(
    (s) => s.byTraining[trainingId] ?? EMPTY_BUCKET,
  );
  const completeLesson = useTrainingProgressStore((s) => s.completeLesson);
  const setActiveLesson = useTrainingProgressStore((s) => s.setActiveLesson);
  const setVideoWatchPercent = useTrainingProgressStore(
    (s) => s.setVideoWatchPercent,
  );

  const seededRef = useRef<string | null>(null);
  useEffect(() => {
    if (!contentQuery.path) return;
    const key = contentQuery.path.trainingId;
    if (seededRef.current === key) return;
    seededRef.current = key;
    for (const day of contentQuery.path.days) {
      for (const lesson of day.lessons) {
        if (lesson.apiCompleted) {
          completeLesson(key, lesson.id);
        }
      }
    }
  }, [contentQuery.path, completeLesson]);

  const [expandedDayId, setExpandedDayId] = useState('');
  useEffect(() => {
    if (!expandedDayId && path.days[0]?.id) {
      setExpandedDayId(path.days[0].id);
    }
  }, [path.days, expandedDayId]);

  /** Lesson currently open inline inside a day */
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(false);

  useEffect(() => {
    playRef.current = playing;
  }, [playing]);

  /** Simulate watch progress while playing (demo — no real video file). */
  useEffect(() => {
    if (!playing || !openLessonId) return;

    const lesson = path.days
      .flatMap((day) => day.lessons)
      .find((item) => item.id === openLessonId);
    if (!lesson || lesson.kind !== 'video') return;
    if (bucket.completedLessons[openLessonId]) {
      setPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      if (!playRef.current) return;
      const current =
        useTrainingProgressStore.getState().getVideoWatchPercent(
          trainingId,
          openLessonId,
        );
      const next = Math.min(100, current + 8);
      setVideoWatchPercent(trainingId, openLessonId, next);
      if (next >= VIDEO_COMPLETE_THRESHOLD) {
        setPlaying(false);
        setOpenLessonId(null);
        setActiveLesson(trainingId, undefined);
        Alert.alert(
          'Video completed',
          `You watched ${next}% — this lesson is checked off. Continue with the next item in this day.`,
        );
      }
    }, 700);

    return () => clearInterval(timer);
  }, [
    playing,
    openLessonId,
    path.days,
    trainingId,
    bucket.completedLessons,
    setVideoWatchPercent,
    setActiveLesson,
  ]);

  const percent = useMemo(() => {
    const apiPercent = contentQuery.content?.progress_percent;
    if (
      isApiId &&
      typeof apiPercent === 'number' &&
      Number.isFinite(apiPercent)
    ) {
      const localTotal = path.days.reduce(
        (sum, day) => sum + day.lessons.length,
        0,
      );
      const localDone = path.days.reduce(
        (sum, day) =>
          sum +
          day.lessons.filter((lesson) =>
            Boolean(bucket.completedLessons[lesson.id]),
          ).length,
        0,
      );
      const localPercent =
        localTotal === 0 ? 0 : Math.round((localDone / localTotal) * 100);
      return Math.max(Math.round(apiPercent), localPercent);
    }
    const total = path.days.reduce((sum, day) => sum + day.lessons.length, 0);
    if (total === 0) return 0;
    const done = path.days.reduce(
      (sum, day) =>
        sum +
        day.lessons.filter((lesson) =>
          Boolean(bucket.completedLessons[lesson.id]),
        ).length,
      0,
    );
    return Math.round((done / total) * 100);
  }, [
    path.days,
    bucket.completedLessons,
    isApiId,
    contentQuery.content?.progress_percent,
  ]);

  const progressLabel = useMemo(() => {
    if (isApiId) {
      const completed =
        contentQuery.content?.completed_lessons ??
        path.days.reduce(
          (sum, day) =>
            sum +
            day.lessons.filter((lesson) =>
              Boolean(bucket.completedLessons[lesson.id]),
            ).length,
          0,
        );
      const total =
        contentQuery.content?.total_lessons ??
        path.days.reduce((sum, day) => sum + day.lessons.length, 0);
      const daysDone = path.days.filter((day) =>
        day.lessons.every((lesson) =>
          Boolean(bucket.completedLessons[lesson.id]),
        ),
      ).length;
      return `${completed}/${total} lessons · ${daysDone}/${path.days.length} sessions`;
    }
    const total = path.days.reduce((sum, day) => sum + day.lessons.length, 0);
    const done = path.days.reduce(
      (sum, day) =>
        sum +
        day.lessons.filter((lesson) =>
          Boolean(bucket.completedLessons[lesson.id]),
        ).length,
      0,
    );
    const daysDone = path.days.filter((day) =>
      day.lessons.every((lesson) =>
        Boolean(bucket.completedLessons[lesson.id]),
      ),
    ).length;
    return `${done}/${total} lessons · ${daysDone}/${path.days.length} days`;
  }, [
    isApiId,
    contentQuery.content?.completed_lessons,
    contentQuery.content?.total_lessons,
    path.days,
    bucket.completedLessons,
  ]);

  const continueItem = useMemo(() => {
    for (const day of path.days) {
      const contentDone = day.lessons
        .filter((lesson) => lesson.kind !== 'exam')
        .every((lesson) => Boolean(bucket.completedLessons[lesson.id]));

      for (const lesson of day.lessons) {
        if (lesson.kind === 'exam') {
          if (!contentDone) continue;
          if (bucket.completedLessons[lesson.id]) continue;
          return { day, lesson };
        }
        if (!bucket.completedLessons[lesson.id]) {
          return { day, lesson };
        }
      }
    }
    return null;
  }, [path.days, bucket.completedLessons]);

  useEffect(() => {
    if (continueItem?.day.id) setExpandedDayId(continueItem.day.id);
    if (
      continueItem?.lesson.kind === 'live' ||
      continueItem?.lesson.kind === 'venue'
    ) {
      setOpenLessonId(continueItem.lesson.id);
    }
  }, [continueItem?.day.id, continueItem?.lesson.id, continueItem?.lesson.kind]);

  const nextStepText = useMemo(() => {
    if (!continueItem) return 'You finished this training. Great work!';
    const { day, lesson } = continueItem;
    if (lesson.kind === 'video') {
      return `Open ${day.dayLabel} and watch “${lesson.title}” inside the session.`;
    }
    if (lesson.kind === 'live') {
      return `Open ${day.dayLabel} and join Zoom for “${lesson.title}”.`;
    }
    if (lesson.kind === 'venue') {
      return `Open ${day.dayLabel} and show your QR pass for “${lesson.title}”.`;
    }
    return `Take the ${day.dayLabel} quiz to finish the day.`;
  }, [continueItem]);

  const howto = useMemo(() => {
    if (path.deliveryMode === 'Physical') {
      return {
        title: 'How venue check-in works',
        text: `1. Open a session and tap the venue item\n2. Show the QR pass at the door\n3. Tap “Checked in” — the checkbox turns on and the quiz unlocks`,
        curriculum:
          'Physical sessions use QR check-in only — no Zoom or recorded videos here.',
      };
    }
    if (path.deliveryMode === 'Hybrid') {
      return {
        title: 'How hybrid days work',
        text: `1. Online days: open the session and Join Zoom\n2. Venue days: show QR at the studio\n3. Quizzes unlock after that day’s session is done`,
        curriculum:
          'Online sessions show Zoom join links here. Venue days use QR check-in.',
      };
    }
    return {
      title: 'How live Zoom sessions work',
      text: `1. Open a session in the list below\n2. Tap Join Zoom (meeting link + ID are shown there)\n3. After you join, mark attended — then the quiz unlocks`,
      curriculum:
        'These are online live sessions — join Zoom from each session row. No recorded course videos.',
    };
  }, [path.deliveryMode]);

  const showQrHeader =
    path.deliveryMode === 'Physical' || path.deliveryMode === 'Hybrid';

  const isDayContentDone = (day: TrainingDay) =>
    day.lessons
      .filter((lesson) => lesson.kind !== 'exam')
      .every((lesson) => Boolean(bucket.completedLessons[lesson.id]));

  const isExamUnlocked = (day: TrainingDay) => isDayContentDone(day);

  const isDayComplete = (day: TrainingDay) =>
    day.lessons.every((lesson) => Boolean(bucket.completedLessons[lesson.id]));

  const watchPercentFor = (lessonId: string) => {
    if (bucket.completedLessons[lessonId]) return 100;
    return bucket.videoWatchPercent[lessonId] ?? 0;
  };

  const examLockMessage = (day: TrainingDay) => {
    const kinds = new Set(
      day.lessons.filter((l) => l.kind !== 'exam').map((l) => l.kind),
    );
    if (kinds.has('venue') && (kinds.has('video') || kinds.has('live'))) {
      return 'Finish this day’s videos, Zoom, and venue QR first.';
    }
    if (kinds.has('venue')) {
      return 'Check in with QR at the venue first. The quiz unlocks automatically.';
    }
    return 'Join this day’s live Zoom first. The quiz unlocks automatically.';
  };

  const onLessonPress = (day: TrainingDay, lesson: TrainingLesson) => {
    if (lesson.locked) {
      Alert.alert(
        'Locked',
        day.unlockHint || 'Complete the previous session first.',
      );
      return;
    }

    const done = Boolean(bucket.completedLessons[lesson.id]);

    if (lesson.kind === 'video' && done) {
      Alert.alert(
        'Already completed',
        'You finished this video. The checkbox stays checked — open the next unfinished lesson.',
      );
      return;
    }

    if (lesson.kind === 'exam') {
      if (!isExamUnlocked(day)) {
        Alert.alert('Quiz locked', examLockMessage(day));
        return;
      }
      if (!lesson.examId || !path.exams[lesson.examId]) {
        Alert.alert(
          'Quiz unavailable',
          'Assessment details are not in the content API yet.',
        );
        return;
      }
      router.push({
        pathname: '/(main)/market/training-exam',
        params: { trainingId, examId: lesson.examId, lessonId: lesson.id },
      });
      return;
    }

    if (lesson.kind === 'live' || lesson.kind === 'venue') {
      if (done) {
        Alert.alert(
          lesson.kind === 'venue' ? 'Already checked in' : 'Already attended',
          lesson.kind === 'venue'
            ? 'This venue session is already checked off.'
            : 'This live class is already checked off.',
        );
        return;
      }
      setExpandedDayId(day.id);
      setOpenLessonId(lesson.id);
      setPlaying(false);
      setActiveLesson(trainingId, lesson.id);
      return;
    }

    // Video / text content — open inline under this session row
    if (isApiId && !lesson.videoUrl) {
      setExpandedDayId(day.id);
      setOpenLessonId(lesson.id);
      setPlaying(false);
      setActiveLesson(trainingId, lesson.id);
      return;
    }

    setExpandedDayId(day.id);
    setOpenLessonId((current) => (current === lesson.id ? null : lesson.id));
    setPlaying(false);
    setActiveLesson(trainingId, lesson.id);
  };

  const joinLive = async (lesson: TrainingLesson) => {
    if (lesson.kind !== 'live') return;
    if (!lesson.joinUrl) {
      Alert.alert(
        'Join link',
        'Meeting link is not available from the API yet.',
      );
      return;
    }
    try {
      await Linking.openURL(lesson.joinUrl);
    } catch {
      Alert.alert('Join link', lesson.joinUrl);
    }
    completeLesson(trainingId, lesson.id);
    setOpenLessonId(null);
    setActiveLesson(trainingId, undefined);
  };

  const markVenueCheckIn = (lesson: TrainingLesson) => {
    if (lesson.kind !== 'venue') return;
    completeLesson(trainingId, lesson.id);
    setOpenLessonId(null);
    setActiveLesson(trainingId, undefined);
    Alert.alert(
      'Checked in',
      'Venue QR marked complete. Take the quiz when you’re ready.',
    );
  };

  const dayStatusLabel = (
    dayDone: boolean,
    contentDone: boolean,
    doneCount: number,
    total: number,
  ) => {
    if (dayDone) return { text: 'Finished', style: styles.dayStatusDone };
    if (contentDone) return { text: 'Quiz ready', style: styles.dayStatusExam };
    if (doneCount === 0) return { text: 'Not started', style: styles.dayStatus };
    return { text: `${doneCount} of ${total} done`, style: styles.dayStatus };
  };

  const kindLine = (
    lesson: TrainingLesson,
    done: boolean,
    lockedExam: boolean,
    watchPercent: number,
  ) => {
    if (lesson.kind === 'video') {
      if (done) return 'Video · completed';
      if (watchPercent > 0) return `Video · ${watchPercent}% watched`;
      return `Video lesson · ${lesson.duration}`;
    }
    if (lesson.kind === 'live') {
      return done
        ? 'Live Zoom · attended'
        : `Live Zoom · tap to join · ${lesson.duration}`;
    }
    if (lesson.kind === 'venue') {
      return done
        ? 'Venue · QR checked in'
        : `Venue QR · ${lesson.duration}`;
    }
    if (lockedExam) {
      return path.deliveryMode === 'Physical'
        ? 'Quiz locked · finish QR check-in first'
        : 'Quiz locked · finish day content first';
    }
    return done ? 'Quiz · submitted' : `Quiz · ${lesson.duration}`;
  };

  const dayContentDoneLabel = (day: TrainingDay) => {
    const hasVenue = day.lessons.some((l) => l.kind === 'venue');
    const hasOnline = day.lessons.some(
      (l) => l.kind === 'video' || l.kind === 'live',
    );
    if (hasVenue && hasOnline) return 'Online + venue done — take the quiz';
    if (hasVenue) return 'QR check-in done — take the quiz';
    return 'Live Zoom done — take the quiz';
  };

  if (isApiId && contentQuery.isLoading && !contentQuery.path) {
    return (
      <MarketTrainingScreenShell eyebrow="My learning" title="Loading…">
        <View style={styles.stateWrap}>
          <ActivityIndicator color={TRAINING_GREEN} size="large" />
          <Text style={styles.stateText}>Loading your course content…</Text>
        </View>
      </MarketTrainingScreenShell>
    );
  }

  if (isApiId && contentQuery.isError && !contentQuery.path) {
    return (
      <MarketTrainingScreenShell eyebrow="My learning" title="Course">
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>
            Could not load course content. Pull back and try again.
          </Text>
          <Pressable
            onPress={() => {
              void contentQuery.refetch();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </MarketTrainingScreenShell>
    );
  }

  return (
    <MarketTrainingScreenShell
      eyebrow={`${path.deliveryMode} · My learning`}
      title={path.title}
      rightLabel={showQrHeader ? 'QR pass' : undefined}
      onRightPress={
        showQrHeader
          ? () =>
              router.push({
                pathname: '/(main)/market/training-attend',
                params: { id: trainingId },
              })
          : undefined
      }
    >
      <View style={styles.heroBanner}>
        <Image
          source={{ uri: path.bannerUrl }}
          style={styles.heroBannerImage}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
          recyclingKey={path.bannerUrl}
        />
        <View style={styles.heroBannerScrim} pointerEvents="none" />
        <View style={styles.heroBannerCopy}>
          <Text style={styles.heroBannerEyebrow}>Your course</Text>
          <Text style={styles.heroBannerTitle} numberOfLines={2}>
            {path.title}
          </Text>
          <Text style={styles.heroBannerMeta}>
            {path.instructor} · {path.vendor}
          </Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <ProgressTracker
          percent={percent}
          label={
            percent === 0
              ? 'Just getting started'
              : percent >= 100
                ? 'Training complete'
                : `You're ${percent}% through this training`
          }
        />
        <Text style={styles.progressSub}>{progressLabel}</Text>
        <View style={styles.nextBanner}>
          <Text style={styles.nextBannerLabel}>What to do now</Text>
          <Text style={styles.nextBannerText}>{nextStepText}</Text>
        </View>
      </View>

      <View style={styles.howtoCard}>
        <Text style={styles.howtoTitle}>{howto.title}</Text>
        <Text style={styles.howtoText}>{howto.text}</Text>
      </View>

      <Text style={styles.curriculumLabel}>Your days</Text>
      <Text style={styles.curriculumHelp}>{howto.curriculum}</Text>

      {path.days.map((day) => {
        const expanded = expandedDayId === day.id;
        const dayDone = isDayComplete(day);
        const contentDone = isDayContentDone(day);
        const examOpen = isExamUnlocked(day);
        const doneCount = day.lessons.filter((lesson) =>
          Boolean(bucket.completedLessons[lesson.id]),
        ).length;
        const status = dayStatusLabel(
          dayDone,
          contentDone,
          doneCount,
          day.lessons.length,
        );

        return (
          <View key={day.id} style={styles.dayCard}>
            <Pressable
              style={styles.dayHeader}
              onPress={() =>
                setExpandedDayId((current) =>
                  current === day.id ? '' : day.id,
                )
              }
              accessibilityRole="button"
            >
              <View style={styles.dayCopy}>
                <View style={styles.dayBadgeRow}>
                  <Text style={styles.dayBadge}>{day.dayLabel}</Text>
                  <Text style={status.style}>{status.text}</Text>
                </View>
                <Text style={styles.dayTitle}>{day.title}</Text>
                <Text style={styles.daySummary}>
                  {dayDone
                    ? 'All set for this day'
                    : contentDone
                      ? dayContentDoneLabel(day)
                      : `${doneCount} of ${day.lessons.length} items finished`}
                </Text>
              </View>
              <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
            </Pressable>

            {expanded ? (
              <View style={styles.lessonList}>
                {day.lessons.map((lesson, index) => {
                  const done = Boolean(bucket.completedLessons[lesson.id]);
                  const lockedExam =
                    lesson.kind === 'exam' && !examOpen && !done;
                  const open = openLessonId === lesson.id && !done;
                  const watchPercent = watchPercentFor(lesson.id);

                  return (
                    <View
                      key={lesson.id}
                      style={[
                        styles.lessonBlock,
                        index < day.lessons.length - 1 && styles.lessonBorder,
                        open && styles.lessonBlockOpen,
                        done && lesson.kind === 'video' && styles.lessonDoneBg,
                      ]}
                    >
                      <Pressable
                        style={[
                          styles.lessonRow,
                          done &&
                            lesson.kind === 'video' &&
                            styles.lessonRowDisabled,
                        ]}
                        onPress={() => onLessonPress(day, lesson)}
                        accessibilityRole="button"
                        accessibilityState={{
                          disabled: done && lesson.kind === 'video',
                          checked: done,
                        }}
                      >
                        {lesson.imageUrl ? (
                          <View
                            style={[
                              styles.lessonThumbWrap,
                              done && styles.lessonThumbDim,
                            ]}
                          >
                            <Image
                              source={{ uri: lesson.imageUrl }}
                              style={styles.lessonThumb}
                              contentFit="cover"
                              transition={150}
                            />
                          </View>
                        ) : (
                          <View style={styles.lessonThumbPlaceholder} />
                        )}

                        <View style={styles.lessonCopy}>
                          <Text
                            style={[
                              styles.lessonTitle,
                              done && styles.lessonTitleDone,
                            ]}
                          >
                            {lesson.locked ? 'Locked · ' : ''}
                            {lesson.title}
                          </Text>
                          <Text style={styles.lessonMeta}>
                            {kindLine(lesson, done, lockedExam, watchPercent)}
                          </Text>
                        </View>

                        <DoneCheckbox checked={done} />
                      </Pressable>

                      {open && lesson.kind === 'video' ? (
                        lesson.videoUrl ? (
                          <InlineVideoPlayer
                            lesson={lesson}
                            watchPercent={watchPercent}
                            playing={playing}
                            onTogglePlay={() => setPlaying((p) => !p)}
                          />
                        ) : (
                          <View style={styles.inlineLive}>
                            <View style={styles.liveJoinCard}>
                              <Text style={styles.liveJoinEyebrow}>
                                Lesson content
                              </Text>
                              <Text style={styles.liveJoinTitle}>
                                {lesson.title}
                              </Text>
                              <Text style={styles.lessonMeta}>
                                {lesson.detail ||
                                  'Media URL is not available from the API yet. You can still mark this lesson complete.'}
                              </Text>
                              <Pressable
                                style={styles.primaryBtn}
                                onPress={() => {
                                  completeLesson(trainingId, lesson.id);
                                  setOpenLessonId(null);
                                  setActiveLesson(trainingId, undefined);
                                }}
                                accessibilityRole="button"
                              >
                                <Text style={styles.primaryBtnText}>
                                  Mark complete
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        )
                      ) : null}

                      {open && lesson.kind === 'live' ? (
                        <View style={styles.inlineLive}>
                          <View style={styles.liveJoinCard}>
                            <Text style={styles.liveJoinEyebrow}>
                              Online live session
                            </Text>
                            <Text style={styles.liveJoinTitle}>
                              {lesson.title}
                            </Text>
                            <Text style={styles.lessonMeta}>
                              {lesson.duration}
                            </Text>
                            <Text style={styles.liveUrl} numberOfLines={2}>
                              {lesson.joinUrl}
                            </Text>
                            {lesson.joinMeta ? (
                              <Text style={styles.lessonMeta}>
                                {lesson.joinMeta}
                              </Text>
                            ) : null}
                            <Pressable
                              style={styles.primaryBtn}
                              onPress={() => joinLive(lesson)}
                            >
                              <Text style={styles.primaryBtnText}>
                                Join Zoom now
                              </Text>
                            </Pressable>
                            <Text style={styles.inlineHint}>
                              Opens the meeting link, then marks this session
                              attended so the quiz can unlock.
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      {open && lesson.kind === 'venue' ? (
                        <View style={styles.inlineVenue}>
                          {lesson.imageUrl ? (
                            <Image
                              source={{ uri: lesson.imageUrl }}
                              style={styles.liveThumb}
                              contentFit="cover"
                            />
                          ) : null}
                          <Text style={styles.venueName}>
                            {lesson.venue ?? lesson.title}
                          </Text>
                          {lesson.address ? (
                            <Text style={styles.lessonMeta}>
                              {lesson.address}
                            </Text>
                          ) : null}
                          {lesson.checkInWindow ? (
                            <Text style={styles.lessonMeta}>
                              {lesson.checkInWindow}
                            </Text>
                          ) : null}
                          <StaticQrPass
                            seed={lesson.passCode ?? lesson.id}
                          />
                          {lesson.passCode ? (
                            <Text style={styles.passCode}>
                              Pass {lesson.passCode}
                            </Text>
                          ) : null}
                          <Pressable
                            style={styles.primaryBtn}
                            onPress={() => markVenueCheckIn(lesson)}
                          >
                            <Text style={styles.primaryBtnText}>
                              Showed QR · mark checked in
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  stateWrap: {
    paddingVertical: c(40, 32),
    alignItems: 'center',
    gap: c(12, 10),
  },
  stateText: {
    fontSize: c(13.5, 12.5),
    color: TRAINING_MUTED,
    textAlign: 'center',
    lineHeight: c(20, 18),
    paddingHorizontal: c(12, 10),
  },
  retryText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  heroBanner: {
    height: c(160, 140),
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
    backgroundColor: '#d7e8db',
    position: 'relative',
  },
  heroBannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroBannerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 28, 18, 0.42)',
  },
  heroBannerCopy: {
    position: 'absolute',
    left: c(14, 12),
    right: c(14, 12),
    bottom: c(14, 12),
    gap: c(4, 3),
  },
  heroBannerEyebrow: {
    fontSize: c(11, 10),
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
  },
  heroBannerTitle: {
    fontSize: c(18, 16),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroBannerMeta: {
    fontSize: c(12.5, 11.5),
    color: 'rgba(255,255,255,0.88)',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(8, 6),
  },
  tracker: { gap: c(8, 6) },
  trackerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: c(8, 6),
  },
  trackerLabel: {
    flex: 1,
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  trackerPercent: {
    fontSize: c(18, 16),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  track: {
    height: c(10, 8),
    borderRadius: 99,
    backgroundColor: TRAINING_TRACK,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: TRAINING_GREEN,
  },
  progressSub: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  nextBanner: {
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadiusSm,
    padding: c(12, 10),
    gap: c(4, 3),
  },
  nextBannerLabel: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: TRAINING_GREEN,
  },
  nextBannerText: {
    fontSize: c(14, 13),
    fontWeight: '700',
    color: TRAINING_TEAL,
    lineHeight: c(20, 18),
  },
  howtoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(6, 4),
  },
  howtoTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  howtoText: {
    fontSize: c(13, 12),
    color: TRAINING_MUTED,
    lineHeight: c(20, 18),
  },
  curriculumLabel: {
    marginTop: c(4, 2),
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  curriculumHelp: {
    marginTop: -c(8, 6),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  dayHeader: {
    padding: c(14, 12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  dayCopy: { flex: 1, gap: c(3, 2) },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: c(8, 6),
  },
  dayBadge: {
    fontSize: NU.label,
    fontWeight: '700',
    color: '#3c63c8',
    backgroundColor: '#eaf1ff',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(7, 6),
    borderRadius: c(5, 4),
    overflow: 'hidden',
  },
  dayStatus: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
  dayStatusExam: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: '#8352c0',
  },
  dayStatusDone: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  dayTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  daySummary: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  chevron: {
    fontSize: c(18, 16),
    color: TRAINING_MUTED,
  },
  lessonList: {
    borderTopWidth: 1,
    borderTopColor: TRAINING_TRACK,
  },
  lessonBlock: {
    backgroundColor: '#FFFFFF',
  },
  lessonBlockOpen: {
    backgroundColor: '#f7fbf6',
  },
  lessonDoneBg: {
    backgroundColor: '#f4faf5',
  },
  lessonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: TRAINING_TRACK,
  },
  lessonRow: {
    paddingHorizontal: c(14, 12),
    paddingVertical: c(12, 10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  lessonRowDisabled: {
    opacity: 0.85,
  },
  lessonThumbWrap: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(10, 8),
    overflow: 'hidden',
    backgroundColor: TRAINING_TRACK,
  },
  lessonThumbDim: {
    opacity: 0.7,
  },
  lessonThumb: {
    width: '100%',
    height: '100%',
  },
  lessonThumbPlaceholder: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(10, 8),
    backgroundColor: TRAINING_TRACK,
  },
  lessonCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  lessonTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  lessonTitleDone: {
    color: TRAINING_MUTED,
  },
  lessonMeta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  checkbox: {
    width: c(24, 22),
    height: c(24, 22),
    borderRadius: c(6, 5),
    borderWidth: 2,
    borderColor: '#c8e0cc',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: TRAINING_GREEN,
    borderColor: TRAINING_GREEN,
  },
  inlinePlayer: {
    paddingHorizontal: c(14, 12),
    paddingBottom: c(14, 12),
    gap: c(8, 6),
  },
  videoStage: {
    height: c(168, 148),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#14352a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(10, 8),
    paddingHorizontal: c(16, 12),
    overflow: 'hidden',
    position: 'relative',
  },
  videoStageImage: {
    ...StyleSheet.absoluteFill,
  },
  videoStageScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 28, 18, 0.45)',
  },
  playOuter: {
    width: c(56, 50),
    height: c(56, 50),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  playInner: {
    width: c(40, 36),
    height: c(40, 36),
    borderRadius: 99,
    backgroundColor: TRAINING_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCaption: {
    fontSize: c(12.5, 11.5),
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    zIndex: 1,
  },
  watchMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchMeta: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
  watchTrack: {
    height: c(8, 7),
    borderRadius: 99,
    backgroundColor: TRAINING_TRACK,
    overflow: 'hidden',
  },
  watchFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: TRAINING_GREEN,
  },
  inlineHint: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
    lineHeight: c(17, 15),
  },
  inlineLive: {
    paddingHorizontal: c(14, 12),
    paddingBottom: c(14, 12),
    gap: c(8, 6),
  },
  liveJoinCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#c5dde8',
    backgroundColor: '#f3fafc',
    borderRadius: NU.cardRadiusSm,
    padding: c(14, 12),
    gap: c(6, 5),
  },
  liveJoinEyebrow: {
    fontSize: c(11, 10),
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: TRAINING_TEAL,
  },
  liveJoinTitle: {
    fontSize: NU.body,
    fontWeight: '800',
    color: '#14352a',
  },
  inlineVenue: {
    paddingHorizontal: c(14, 12),
    paddingBottom: c(14, 12),
    gap: c(8, 6),
    alignItems: 'center',
  },
  venueName: {
    fontSize: NU.body,
    fontWeight: '800',
    color: TRAINING_TEAL,
    textAlign: 'center',
  },
  passCode: {
    fontSize: c(13, 12),
    fontWeight: '700',
    letterSpacing: 1.2,
    color: TRAINING_MUTED,
  },
  qrOuter: {
    padding: c(10, 8),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
  },
  qrInner: {
    gap: 1,
  },
  qrRow: {
    flexDirection: 'row',
    gap: 1,
  },
  qrCell: {
    width: c(8, 7),
    height: c(8, 7),
  },
  qrCellOn: {
    backgroundColor: '#10281f',
  },
  qrCellOff: {
    backgroundColor: '#FFFFFF',
  },
  liveThumb: {
    height: c(100, 88),
    borderRadius: NU.cardRadiusSm,
    width: '100%',
  },
  liveUrl: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  primaryBtn: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  primaryBtnText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
