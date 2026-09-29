import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { downloadTrainingToLibrary, openTrainingFile } from '@/utils/downloadTrainingFile';

import {
  CourseCheckIcon,
  CoursePlayFillIcon,
} from '@/components/market/CourseLearningIcons';
import { MarketCheckoutLockIcon } from '@/components/market/MarketCheckoutIcons';
import { TrainingStickyVideoPlayer } from '@/components/market/TrainingStickyVideoPlayer';
import { TrainingAnnouncementsPanel } from '@/components/market/TrainingAnnouncementsPanel';
import { TrainingDiscussionsPanel } from '@/components/market/TrainingDiscussionsPanel';
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import {
  getTrainingProgressPath,
  type LessonKind,
  type TrainingDay,
  type TrainingLesson,
  type TrainingProgressPath,
} from '@/components/market/marketTrainingProgressData';
import {
  isApiTrainingId,
  useCompleteTrainingLesson,
  useRecordLessonAttendance,
  useRecordLiveSessionAttendance,
  useSaveLessonProgress,
  useTrainingCertificate,
  useTrainingContent,
  useTrainingDiscussions,
  useTrainingProgress,
} from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { useTrainingDownloadsStore } from '@/stores/trainingDownloads.store';
import {
  useTrainingProgressStore,
  VIDEO_COMPLETE_THRESHOLD,
} from '@/stores/trainingProgress.store';
import { ENDPOINTS } from '@/services/api/endpoints';
import { formatAttendanceDateTime } from '@/utils/dateTime';
import { resolveAbsoluteApiUrl } from '@/utils/trainingLessonMedia';
import { c, NU } from '@/utils/newUiCompact';

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80';

const LESSON_TYPE_META: Record<
  LessonKind,
  { label: string; color: string; bg: string }
> = {
  video: { label: 'Video', color: '#257d3f', bg: '#e6f4e8' },
  youtube: { label: 'YouTube', color: '#c4302b', bg: '#fdecea' },
  live: { label: 'Live', color: '#c45c26', bg: '#fff0e8' },
  venue: { label: 'Venue', color: '#1f6f8b', bg: '#e5f4f8' },
  exam: { label: 'Quiz', color: '#8352c0', bg: '#f2e9fb' },
  text: { label: 'Topic', color: '#4a5568', bg: '#eef1f5' },
  document: { label: 'PDF', color: '#b42318', bg: '#fdecea' },
};

function LessonDownloadIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="m7 11 5 5 5-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 20h14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CurriculumChevron({ expanded }: { expanded: boolean }) {
  return (
    <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="m6 9 6 6 6-6"
          stroke={expanded ? TRAINING_GREEN : TRAINING_MUTED}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function LessonTypeIcon({
  kind,
  color,
  size = 14,
}: {
  kind: LessonKind;
  color: string;
  size?: number;
}) {

  if (kind === 'video') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
        <Path d="M10 8.5v7l6-3.5-6-3.5z" fill={color} />
      </Svg>
    );
  }
  if (kind === 'youtube') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="3.5"
          stroke={color}
          strokeWidth={1.8}
        />
        <Path d="M10 9.2v5.6l5.2-2.8-5.2-2.8z" fill={color} />
      </Svg>
    );
  }
  if (kind === 'live') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 8h10a2 2 0 0 1 2 2v6H4V8z"
          stroke={color}
          strokeWidth={1.8}
        />
        <Path
          d="m16 11 4-2.5v7L16 13"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (kind === 'venue') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"
          stroke={color}
          strokeWidth={1.8}
        />
        <Circle cx="12" cy="10" r="2.2" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }
  if (kind === 'document') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path
          d="M14 3v5h5M9 13h6M9 17h4"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (kind === 'text') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M5 5h14M5 9h14M5 13h10M5 17h7"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M9 8h6M9 12h6M9 16h3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function LessonStatusIcon({
  done,
  locked,
}: {
  done: boolean;
  locked: boolean;
}) {
  if (done) {
    return (
      <View style={styles.statusDone}>
        <CourseCheckIcon color="#FFFFFF" size={12} />
      </View>
    );
  }
  if (locked) {
    return <MarketCheckoutLockIcon color={TRAINING_MUTED} size={16} />;
  }
  return <View style={styles.statusOpen} />;
}

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
    courseNotes: [],
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

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value ?? ''}</Text>
    </View>
  );
}

function ApiLessonJoinPanel({
  lesson,
  onJoin,
}: {
  lesson: TrainingLesson;
  onJoin: () => void;
}) {
  const meetingLink = lesson.joinUrl ?? '';
  const canJoin = Boolean(meetingLink.trim());

  return (
    <View style={styles.inlineLive}>
      <View style={styles.liveJoinCard}>
        <Text style={styles.liveJoinEyebrow}>Session details</Text>
        <Text style={styles.liveJoinTitle}>{lesson.title}</Text>
        <FieldRow label="Meeting link" value={meetingLink} />
        <FieldRow label="Meeting ID" value={lesson.joinMeta ?? ''} />
        <FieldRow
          label="Duration"
          value={lesson.duration === '—' ? '' : lesson.duration}
        />
        {canJoin ? (
          <Pressable style={styles.primaryBtn} onPress={onJoin}>
            <Text style={styles.primaryBtnText}>Join session</Text>
          </Pressable>
        ) : (
          <Text style={styles.inlineHint}>
            Join when the meeting link is available.
          </Text>
        )}
      </View>
    </View>
  );
}

function SessionMeetingPanel({
  day,
  onJoin,
}: {
  day: TrainingDay;
  onJoin: () => void;
}) {
  const meetingLink = day.meetingLink?.trim() ?? '';
  const schedule = day.schedule?.trim() ?? '';
  const venue = day.venue?.trim() ?? '';
  const address = day.address?.trim() ?? '';
  const passCode = day.passCode?.trim() ?? '';
  const qrImageUri = day.qrImageBase64?.trim() ?? '';
  const attended = Boolean(day.isAttended);
  const attendedLabel = formatAttendanceDateTime(day.attendedAt);
  const isVenueSection =
    (day.sectionType ?? '').toLowerCase() === 'venue' ||
    ((!meetingLink && (venue || address || passCode || qrImageUri)) &&
      (day.sectionType ?? '').toLowerCase() !== 'live');

  if (isVenueSection) {
    if (!schedule && !venue && !address && !passCode && !qrImageUri && !attended) {
      return null;
    }
    return (
      <View style={styles.inlineLive}>
        <View
          style={[
            styles.liveJoinCard,
            attended && styles.liveJoinCardAttended,
          ]}
        >
          <Text style={styles.liveJoinEyebrow}>
            {attended ? 'Venue · attended' : 'Venue check-in'}
          </Text>
          <Text style={styles.liveJoinTitle}>{day.dayLabel}</Text>
          {schedule ? <FieldRow label="When" value={schedule} /> : null}
          {attended ? (
            <>
              <Text style={styles.attendedBanner}>
                Check-in complete
                {attendedLabel ? ` · ${attendedLabel}` : ''}
              </Text>
              {venue ? <FieldRow label="Venue" value={venue} /> : null}
              {address ? <FieldRow label="Address" value={address} /> : null}
              <Text style={styles.inlineHint}>
                You’ve already checked in. Continue with the materials below.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.venueQrBlock}>
                <Text style={styles.qrSectionLabel}>Show this QR at the door</Text>
                <SessionQrImage uri={qrImageUri} seed={passCode || day.id} />
                {passCode ? (
                  <Text style={styles.passCode}>Pass {passCode}</Text>
                ) : null}
              </View>
              {venue ? <FieldRow label="Venue" value={venue} /> : null}
              {address ? <FieldRow label="Address" value={address} /> : null}
              <Text style={styles.inlineHint}>
                Session materials are listed below — work through them after
                check-in.
              </Text>
            </>
          )}
        </View>
      </View>
    );
  }

  if (!meetingLink && !schedule && !attended) return null;

  return (
    <View style={styles.inlineLive}>
      <View
        style={[styles.liveJoinCard, attended && styles.liveJoinCardAttended]}
      >
        <Text style={styles.liveJoinEyebrow}>
          {attended ? 'Live · attended' : 'Live meeting'}
        </Text>
        <Text style={styles.liveJoinTitle}>{day.dayLabel}</Text>
        {schedule ? <FieldRow label="When" value={schedule} /> : null}
        {attended ? (
          <>
            <Text style={styles.attendedBanner}>
              Attendance recorded
              {attendedLabel ? ` · ${attendedLabel}` : ''}
            </Text>
            <Text style={styles.inlineHint}>
              You’ve already joined this session. Continue with the materials
              below.
            </Text>
          </>
        ) : (
          <>
            {meetingLink ? (
              <FieldRow label="Meeting link" value={meetingLink} />
            ) : null}
            {venue ? <FieldRow label="Venue" value={venue} /> : null}
            {address ? <FieldRow label="Address" value={address} /> : null}
            {meetingLink ? (
              <Pressable style={styles.primaryBtn} onPress={onJoin}>
                <Text style={styles.primaryBtnText}>Join meeting</Text>
              </Pressable>
            ) : (
              <Text style={styles.inlineHint}>
                Meeting link will appear when the host shares it.
              </Text>
            )}
            <Text style={styles.inlineHint}>
              Session materials are listed below — work through them in order.
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

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

/** Decorative static QR (not a real encoded QR). Used only when API image is missing. */
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

/** Prefer content API `qr_image_base64`; fall back to decorative pass. */
function SessionQrImage({
  uri,
  seed,
}: {
  uri?: string | null;
  seed: string;
}) {
  const imageUri = uri?.trim() ?? '';
  if (imageUri) {
    return (
      <View style={styles.qrOuter}>
        <Image
          source={{ uri: imageUri }}
          style={styles.qrApiImage}
          contentFit="contain"
        />
      </View>
    );
  }
  return <StaticQrPass seed={seed} />;
}

function InlineTextLessonPanel({ lesson }: { lesson: TrainingLesson }) {
  const body =
    lesson.bodyText?.trim() ||
    lesson.detail?.trim() ||
    'No written content for this topic yet.';

  return (
    <View style={styles.inlineLive}>
      <View style={styles.liveJoinCard}>
        <Text style={styles.liveJoinEyebrow}>Topic</Text>
        <Text style={styles.liveJoinTitle}>{lesson.title}</Text>
        <Text style={styles.lessonBodyText}>{body}</Text>
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
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const isApiId = isApiTrainingId(id);
  const contentQuery = useTrainingContent(id);
  // Fetch Q&A in parallel with content (not only after panel mounts)
  useTrainingDiscussions(isApiId ? id : undefined);
  const certificateQuery = useTrainingCertificate(isApiId ? id : undefined);
  const progressQuery = useTrainingProgress(isApiId ? id : undefined);
  const completeLessonMutation = useCompleteTrainingLesson(
    isApiId ? id : undefined,
  );
  const saveLessonProgressMutation = useSaveLessonProgress(
    isApiId ? id : undefined,
  );
  const liveAttendanceMutation = useRecordLiveSessionAttendance(
    isApiId ? id : undefined,
  );
  const lessonAttendanceMutation = useRecordLessonAttendance(
    isApiId ? id : undefined,
  );
  const completingLessonIdsRef = useRef<Set<string>>(new Set());
  const attendingSessionIdsRef = useRef<Set<string>>(new Set());
  const attendingLessonIdsRef = useRef<Set<string>>(new Set());
  const didAutoResumeRef = useRef<string | null>(null);
  const lastPlaybackRef = useRef({ lessonId: '', seconds: 0, duration: 0 });
  const lastSavedProgressRef = useRef({
    lessonId: '',
    at: 0,
    seconds: -1,
  });
  const [downloadingLessonId, setDownloadingLessonId] = useState<string | null>(
    null,
  );
  const [openingCertificate, setOpeningCertificate] = useState(false);
  const path =
    isApiId
      ? (contentQuery.path ?? loadingPathFor(id))
      : getTrainingProgressPath(id);
  const trainingId = path.trainingId || id || '';

  const hydrateDownloads = useTrainingDownloadsStore((s) => s.hydrate);
  const hasDownloaded = useTrainingDownloadsStore((s) => s.has);

  useEffect(() => {
    void hydrateDownloads();
  }, [hydrateDownloads]);

  const markLessonComplete = (lessonId: string) => {
    completeLesson(trainingId, lessonId);
    if (!isApiId) return;
    if (completingLessonIdsRef.current.has(lessonId)) return;
    completingLessonIdsRef.current.add(lessonId);
    completeLessonMutation.mutate(lessonId, {
      onSettled: () => {
        completingLessonIdsRef.current.delete(lessonId);
      },
      onError: () => {
        // Keep local checkmark; content refetch will correct if needed.
        if (__DEV__) {
          console.warn('[complete-lesson] failed for', lessonId);
        }
      },
    });
  };

  const openCertificate = () => {
    if (!isApiId || !trainingId || openingCertificate) return;
    const fromApi = certificateQuery.certificate?.certificate_url?.trim();
    const url = resolveAbsoluteApiUrl(
      fromApi || ENDPOINTS.TRAININGS.CERTIFICATE_PDF(trainingId),
    );
    if (!url) {
      Alert.alert('Certificate', 'Certificate link is not available yet.');
      return;
    }
    setOpeningCertificate(true);
    void openTrainingFile({
      url,
      suggestedName: `${path.title || 'certificate'}.pdf`,
    }).finally(() => setOpeningCertificate(false));
  };

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

  const [expandedDayId, setExpandedDayId] = useState<string | undefined>(
    undefined,
  );
  const firstDayId = path.days[0]?.id ?? '';
  // undefined = not touched yet → keep first section open; '' = user collapsed all
  const resolvedExpandedDayId =
    expandedDayId === undefined ? firstDayId : expandedDayId;

  useEffect(() => {
    // New course → open first section again
    setExpandedDayId(undefined);
  }, [trainingId]);

  /** Lesson currently open inline inside a day (live / venue / text) */
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  /** Video plays in sticky top player (Udemy-style), not under the row */
  const [activeVideoLessonId, setActiveVideoLessonId] = useState<string | null>(
    null,
  );
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(false);

  const videoPlaylist = useMemo(() => {
    const items: { day: TrainingDay; lesson: TrainingLesson }[] = [];
    for (const day of path.days) {
      for (const lesson of day.lessons) {
        if (lesson.kind !== 'video') continue;
        if (isApiId && !lesson.videoUrl) continue;
        items.push({ day, lesson });
      }
    }
    return items;
  }, [path.days, isApiId]);

  const activeVideo = useMemo(() => {
    if (!activeVideoLessonId) return null;
    for (const day of path.days) {
      for (const lesson of day.lessons) {
        if (lesson.id === activeVideoLessonId) {
          return { day, lesson };
        }
      }
    }
    return null;
  }, [path.days, activeVideoLessonId]);

  const activeVideoIndex = useMemo(
    () =>
      videoPlaylist.findIndex(
        (item) => item.lesson.id === activeVideoLessonId,
      ),
    [videoPlaylist, activeVideoLessonId],
  );

  const selectVideoLesson = (day: TrainingDay, lesson: TrainingLesson) => {
    const last = lastPlaybackRef.current;
    if (
      isApiId &&
      last.lessonId &&
      last.lessonId !== lesson.id &&
      last.seconds > 0 &&
      last.duration > 0
    ) {
      persistLessonPlayback(last.lessonId, last.seconds, last.duration, true);
    }
    setExpandedDayId(day.id);
    setActiveVideoLessonId(lesson.id);
    setOpenLessonId(null);
    setPlaying(false);
    setActiveLesson(trainingId, lesson.id);
  };

  const progressSecondsForLesson = (lessonId: string): number => {
    for (const day of path.days) {
      const lesson = day.lessons.find((item) => item.id === lessonId);
      if (lesson?.progressSeconds != null && lesson.progressSeconds > 0) {
        return lesson.progressSeconds;
      }
    }
    const fromProgress = progressQuery.data?.lessons?.find(
      (item) => item.lesson_id === lessonId,
    );
    const raw = fromProgress?.position_seconds;
    const n =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
          ? Number(raw)
          : NaN;
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const persistLessonPlayback = (
    lessonId: string,
    currentSeconds: number,
    durationSeconds: number,
    force = false,
  ) => {
    if (!isApiId || !lessonId) return;
    const now = Date.now();
    const last = lastSavedProgressRef.current;
    const movedEnough = Math.abs(currentSeconds - last.seconds) >= 10;
    const timedOut = now - last.at >= 15_000;
    if (
      !force &&
      last.lessonId === lessonId &&
      !movedEnough &&
      !timedOut
    ) {
      return;
    }
    lastSavedProgressRef.current = {
      lessonId,
      at: now,
      seconds: currentSeconds,
    };
    const matchedDay = path.days.find((day) =>
      day.lessons.some((l) => l.id === lessonId),
    );
    const matchedLesson = matchedDay?.lessons.find((l) => l.id === lessonId);
    saveLessonProgressMutation.mutate({
      lessonId,
      positionSeconds: currentSeconds,
      durationSeconds,
      sectionId: matchedLesson?.sectionId ?? matchedDay?.id,
    });
  };

  /** Seed local watch % + auto-open last resume lesson once content is ready. */
  useEffect(() => {
    if (!isApiId || !contentQuery.path) return;

    for (const day of contentQuery.path.days) {
      for (const lesson of day.lessons) {
        const seconds =
          lesson.progressSeconds ??
          (() => {
            const row = progressQuery.data?.lessons?.find(
              (item) => item.lesson_id === lesson.id,
            );
            const raw = row?.position_seconds;
            if (typeof raw === 'number') return raw;
            if (typeof raw === 'string') {
              const n = Number(raw);
              return Number.isFinite(n) ? n : undefined;
            }
            return undefined;
          })();
        const duration =
          lesson.durationSeconds ??
          (() => {
            const row = progressQuery.data?.lessons?.find(
              (item) => item.lesson_id === lesson.id,
            );
            const raw = row?.duration_seconds;
            if (typeof raw === 'number') return raw;
            if (typeof raw === 'string') {
              const n = Number(raw);
              return Number.isFinite(n) ? n : undefined;
            }
            return undefined;
          })();
        if (seconds != null && seconds > 0 && duration != null && duration > 0) {
          const pct = Math.min(
            100,
            Math.round((seconds / duration) * 100),
          );
          if (pct > 0) setVideoWatchPercent(trainingId, lesson.id, pct);
        }
      }
    }

    if (didAutoResumeRef.current === trainingId) return;

    const resumeId =
      contentQuery.path.resumeLessonId ||
      progressQuery.data?.resume_lesson_id ||
      progressQuery.data?.resume_lesson ||
      (() => {
        for (const day of contentQuery.path.days) {
          for (const lesson of day.lessons) {
            if (!lesson.locked && !lesson.apiCompleted) return lesson.id;
          }
        }
        return null;
      })();

    if (!resumeId) {
      didAutoResumeRef.current = trainingId;
      return;
    }

    let resumeDay: TrainingDay | null = null;
    let resumeLesson: TrainingLesson | null = null;
    for (const day of contentQuery.path.days) {
      const lesson = day.lessons.find((item) => item.id === resumeId);
      if (lesson) {
        resumeDay = day;
        resumeLesson = lesson;
        break;
      }
    }
    if (!resumeDay || !resumeLesson || resumeLesson.locked) {
      didAutoResumeRef.current = trainingId;
      return;
    }

    didAutoResumeRef.current = trainingId;
    setExpandedDayId(resumeDay.id);
    setActiveLesson(trainingId, resumeLesson.id);
    if (
      (resumeLesson.kind === 'video' || resumeLesson.kind === 'youtube') &&
      resumeLesson.videoUrl
    ) {
      setActiveVideoLessonId(resumeLesson.id);
      setOpenLessonId(null);
    } else {
      setOpenLessonId(resumeLesson.id);
    }
  }, [
    isApiId,
    contentQuery.path,
    progressQuery.data,
    trainingId,
    setVideoWatchPercent,
    setActiveLesson,
  ]);

  const findLessonPosition = (lessonId: string) => {
    for (let dayIndex = 0; dayIndex < path.days.length; dayIndex += 1) {
      const day = path.days[dayIndex];
      if (!day) continue;
      const lessonIndex = day.lessons.findIndex((item) => item.id === lessonId);
      if (lessonIndex >= 0) {
        return { day, dayIndex, lessonIndex, lesson: day.lessons[lessonIndex]! };
      }
    }
    return null;
  };

  const goAdjacentVideo = (delta: number) => {
    const next = videoPlaylist[activeVideoIndex + delta];
    if (!next) return;
    const position = findLessonPosition(next.lesson.id);
    if (
      position &&
      (position.lesson.locked ||
        isSequentiallyLocked(position.dayIndex, position.lessonIndex))
    ) {
      Alert.alert(
        'Locked',
        position.day.unlockHint ||
          'Finish the previous lesson (and earlier sessions) first.',
      );
      return;
    }
    selectVideoLesson(next.day, next.lesson);
  };

  const downloadUrlForLesson = (lesson: TrainingLesson): string | null => {
    // Only when API sets is_downloadable: true — videos & documents only.
    if (lesson.isDownloadable !== true) return null;
    // Live online sessions are meeting-based — don't offer course-video downloads.
    if (isLiveOnlineTraining && lesson.kind === 'video') return null;
    if (lesson.kind === 'video') return lesson.videoUrl?.trim() || null;
    if (lesson.kind === 'document') {
      return lesson.documentUrls?.[0]?.trim() || null;
    }
    return null;
  };

  const onDownloadLesson = (lesson: TrainingLesson) => {
    const url = downloadUrlForLesson(lesson);
    if (!url) {
      Alert.alert('Download', 'This lesson is not available for download.');
      return;
    }
    if (downloadingLessonId) return;

    const kind = lesson.kind === 'document' ? 'document' : 'video';
    const suggestedName =
      kind === 'document'
        ? lesson.documentFileName || `${lesson.title}.pdf`
        : `${lesson.title}.mp4`;

    if (hasDownloaded(trainingId, lesson.id)) {
      Alert.alert(
        'Already downloaded',
        'This file is already in My Trainings → Downloads. Download again to replace it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download again',
            onPress: () => {
              setDownloadingLessonId(lesson.id);
              void downloadTrainingToLibrary({
                trainingId,
                trainingTitle: path.title,
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                kind,
                url,
                suggestedName,
              }).finally(() => setDownloadingLessonId(null));
            },
          },
        ],
      );
      return;
    }

    setDownloadingLessonId(lesson.id);
    void downloadTrainingToLibrary({
      trainingId,
      trainingTitle: path.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      kind,
      url,
      suggestedName,
    }).finally(() => setDownloadingLessonId(null));
  };

  const onStickyWatchPercent = (percent: number) => {
    if (!activeVideoLessonId) return;
    setVideoWatchPercent(trainingId, activeVideoLessonId, percent);
    if (
      percent >= VIDEO_COMPLETE_THRESHOLD &&
      !bucket.completedLessons[activeVideoLessonId]
    ) {
      markLessonComplete(activeVideoLessonId);
    }
  };

  const onStickyPlaybackTime = (
    currentSeconds: number,
    durationSeconds: number,
  ) => {
    if (!activeVideoLessonId) return;
    lastPlaybackRef.current = {
      lessonId: activeVideoLessonId,
      seconds: currentSeconds,
      duration: durationSeconds,
    };
    persistLessonPlayback(
      activeVideoLessonId,
      currentSeconds,
      durationSeconds,
      false,
    );
  };

  const closeStickyPlayer = () => {
    const last = lastPlaybackRef.current;
    if (
      isApiId &&
      last.lessonId &&
      last.seconds > 0 &&
      last.duration > 0
    ) {
      persistLessonPlayback(last.lessonId, last.seconds, last.duration, true);
    }
    setActiveVideoLessonId(null);
  };

  useEffect(() => {
    playRef.current = playing;
  }, [playing]);

  /** Simulate watch progress while playing (demo — no real video file). */
  useEffect(() => {
    if (isApiId) return;
    if (!playing || !activeVideoLessonId) return;

    const lesson = path.days
      .flatMap((day) => day.lessons)
      .find((item) => item.id === activeVideoLessonId);
    if (!lesson || lesson.kind !== 'video') return;
    if (bucket.completedLessons[activeVideoLessonId]) {
      setPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      if (!playRef.current) return;
      const current =
        useTrainingProgressStore.getState().getVideoWatchPercent(
          trainingId,
          activeVideoLessonId,
        );
      const next = Math.min(100, current + 8);
      setVideoWatchPercent(trainingId, activeVideoLessonId, next);
      if (next >= VIDEO_COMPLETE_THRESHOLD) {
        setPlaying(false);
        Alert.alert(
          'Video completed',
          `You watched ${next}% — this lesson is checked off. Continue with the next item in this day.`,
        );
      }
    }, 700);

    return () => clearInterval(timer);
  }, [
    isApiId,
    playing,
    activeVideoLessonId,
    path.days,
    trainingId,
    bucket.completedLessons,
    setVideoWatchPercent,
  ]);

  const percent = useMemo(() => {
    const apiPercent = contentQuery.content?.progress_percent;
    const localTotal = path.days.reduce(
      (sum, day) => sum + day.lessons.length,
      0,
    );
    const localDone = path.days.reduce(
      (sum, day) =>
        sum +
        day.lessons.filter((lesson) =>
          Boolean(bucket.completedLessons[lesson.id] || lesson.apiCompleted),
        ).length,
      0,
    );
    const localPercent =
      localTotal === 0 ? 0 : Math.round((localDone / localTotal) * 100);

    if (
      isApiId &&
      typeof apiPercent === 'number' &&
      Number.isFinite(apiPercent)
    ) {
      return Math.max(Math.round(apiPercent), localPercent);
    }
    return localPercent;
  }, [
    path.days,
    bucket.completedLessons,
    isApiId,
    contentQuery.content?.progress_percent,
  ]);

  const progressLabel = useMemo(() => {
    // Count the same curriculum items shown in My Learning (includes quizzes).
    // Prefer this over API `completed_lessons` — that field often excludes quizzes
    // and can show e.g. 8/12 while the UI has all 12 items done.
    const total = path.days.reduce((sum, day) => sum + day.lessons.length, 0);
    const done = path.days.reduce(
      (sum, day) =>
        sum +
        day.lessons.filter((lesson) =>
          Boolean(bucket.completedLessons[lesson.id] || lesson.apiCompleted),
        ).length,
      0,
    );
    const daysDone = path.days.filter((day) =>
      day.lessons.every((lesson) =>
        Boolean(bucket.completedLessons[lesson.id] || lesson.apiCompleted),
      ),
    ).length;
    const sessionWord = isApiId ? 'sessions' : 'days';
    return `${done}/${total} lessons · ${daysDone}/${path.days.length} ${sessionWord}`;
  }, [isApiId, path.days, bucket.completedLessons]);

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
    // Keep first section as the default open state; only auto-open inline
    // panels for live/venue continue items (do not jump to another section).
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
    if (lesson.kind === 'youtube') {
      return `Open ${day.dayLabel} and watch “${lesson.title}” on YouTube.`;
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
      };
    }
    if (path.deliveryMode === 'Hybrid') {
      return {
        title: 'How hybrid days work',
        text: `1. Online days: open the session and Join meeting\n2. Venue days: show QR at the studio\n3. Quizzes unlock after that day’s session is done`,
      };
    }
    if (path.deliveryMode === 'Self-paced') {
      return {
        title: 'How self-paced learning works',
        text: `1. Open a section and watch recorded videos in order\n2. Open PDFs / notes when you need them\n3. Complete quizzes to mark progress — go at your own pace`,
      };
    }
    return {
      title: 'How online live sessions work',
      text: `1. Open a session to see the meeting link and time\n2. Join the live meeting from the top of the session\n3. Complete topics, PDFs, and other materials below in order`,
    };
  }, [path.deliveryMode]);

  const isLiveOnlineTraining = useMemo(() => {
    if (path.deliveryMode !== 'Virtual') return false;
    return path.days.some(
      (day) =>
        day.sectionType === 'live' || Boolean(day.meetingLink?.trim()),
    );
  }, [path.days, path.deliveryMode]);

  const isLessonDone = (lesson: TrainingLesson) =>
    Boolean(
      bucket.completedLessons[lesson.id] ||
        lesson.apiCompleted ||
        ((lesson.kind === 'live' || lesson.kind === 'venue') &&
          lesson.isAttended),
    );

  const isDayContentDone = (day: TrainingDay) =>
    day.lessons
      .filter((lesson) => lesson.kind !== 'exam')
      .every((lesson) => isLessonDone(lesson));

  // API quizzes: unlock when not locked by API (content lessons optional gate).
  const isExamUnlocked = (day: TrainingDay) => {
    if (isApiId) {
      return true;
    }
    return isDayContentDone(day);
  };

  const isDayComplete = (day: TrainingDay) =>
    day.lessons.every((lesson) => isLessonDone(lesson));

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

  /**
   * Virtual path: finish lessons in order (can't skip ahead), and finish a
   * whole session before the next session unlocks.
   */
  const isSequentiallyLocked = (dayIndex: number, lessonIndex: number) => {
    if (path.deliveryMode !== 'Virtual') return false;

    for (let d = 0; d < dayIndex; d += 1) {
      const prevDay = path.days[d];
      if (!prevDay) continue;
      for (const prevLesson of prevDay.lessons) {
        if (!isLessonDone(prevLesson)) return true;
      }
    }

    const day = path.days[dayIndex];
    if (!day) return false;
    for (let i = 0; i < lessonIndex; i += 1) {
      const prevLesson = day.lessons[i];
      if (prevLesson && !isLessonDone(prevLesson)) return true;
    }
    return false;
  };

  const onLessonPress = (
    day: TrainingDay,
    lesson: TrainingLesson,
    dayIndex: number,
    lessonIndex: number,
  ) => {
    if (lesson.locked || isSequentiallyLocked(dayIndex, lessonIndex)) {
      Alert.alert(
        'Locked',
        day.unlockHint ||
          'Finish the previous lesson (and earlier sessions) first.',
      );
      return;
    }

    const done = isLessonDone(lesson);

    if (
      (lesson.kind === 'video' || lesson.kind === 'youtube') &&
      done &&
      !isApiId
    ) {
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
      if (!lesson.examId) {
        Alert.alert(
          'Quiz unavailable',
          'Assessment id is missing for this quiz.',
        );
        return;
      }
      router.push({
        pathname: '/(main)/market/training-exam',
        params: { trainingId, examId: lesson.examId, lessonId: lesson.id },
      });
      return;
    }

    if (lesson.kind === 'document') {
      const url = lesson.documentUrls?.[0];
      if (!url) {
        Alert.alert('PDF', 'No file is attached to this lesson yet.');
        return;
      }
      void openTrainingFile({
        url,
        suggestedName:
          lesson.documentFileName || `${lesson.title || 'document'}.pdf`,
      }).then((opened) => {
        if (opened && !done) {
          markLessonComplete(lesson.id);
        }
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
      setActiveVideoLessonId(null);
      setExpandedDayId(day.id);
      setOpenLessonId(lesson.id);
      setPlaying(false);
      setActiveLesson(trainingId, lesson.id);
      return;
    }

    if (lesson.kind === 'youtube') {
      const url = lesson.videoUrl?.trim();
      if (!url) {
        Alert.alert('YouTube', 'No YouTube link is attached to this item yet.');
        return;
      }
      void Linking.openURL(url)
        .then(() => {
          if (!done) markLessonComplete(lesson.id);
        })
        .catch(() => {
          Alert.alert('YouTube', url);
        });
      return;
    }

    if (lesson.kind === 'video') {
      // Online live trainings are meeting-based — open clip links externally,
      // never the sticky course video player.
      if (isLiveOnlineTraining) {
        const url = lesson.videoUrl?.trim();
        if (!url) {
          Alert.alert('Link', 'No link is attached to this item yet.');
          return;
        }
        void Linking.openURL(url)
          .then(() => {
            if (!done) markLessonComplete(lesson.id);
          })
          .catch(() => {
            Alert.alert('Link', url);
          });
        return;
      }
      if (isApiId && !lesson.videoUrl) {
        Alert.alert('Video', 'No video URL in this lesson yet.');
        return;
      }
      selectVideoLesson(day, lesson);
      return;
    }

    // Text / topic — expand under row and mark read via complete-lesson
    const willOpen = openLessonId !== lesson.id;
    setExpandedDayId(day.id);
    setOpenLessonId(willOpen ? lesson.id : null);
    setPlaying(false);
    setActiveLesson(trainingId, lesson.id);
    if (!isLiveOnlineTraining && lesson.videoUrl) {
      setActiveVideoLessonId(lesson.id);
    } else {
      setActiveVideoLessonId(null);
    }
    if (willOpen && !done) {
      markLessonComplete(lesson.id);
    }
  };

  const recordSessionAttendance = async (sessionId: string) => {
    if (!isApiId || !sessionId.trim()) return;
    if (attendingSessionIdsRef.current.has(sessionId)) return;
    attendingSessionIdsRef.current.add(sessionId);
    try {
      await liveAttendanceMutation.mutateAsync(sessionId);
    } catch (error) {
      if (__DEV__) {
        console.warn('[live-session attendance] failed for', sessionId, error);
      }
    } finally {
      attendingSessionIdsRef.current.delete(sessionId);
    }
  };

  const recordLessonAttendance = async (lessonId: string) => {
    if (!isApiId || !lessonId.trim()) return;
    if (attendingLessonIdsRef.current.has(lessonId)) return;
    attendingLessonIdsRef.current.add(lessonId);
    try {
      await lessonAttendanceMutation.mutateAsync(lessonId);
    } catch (error) {
      if (__DEV__) {
        console.warn('[lesson attendance] failed for', lessonId, error);
      }
    } finally {
      attendingLessonIdsRef.current.delete(lessonId);
    }
  };

  const joinSessionMeeting = async (day: TrainingDay) => {
    if (day.isAttended) {
      Alert.alert(
        'Already attended',
        'You have already joined this session.',
      );
      return;
    }
    const link = (day.meetingLink ?? '').trim();
    if (!link) {
      Alert.alert('Join link', 'Meeting link is empty.');
      return;
    }
    // Session-level meeting → session attendance API
    await recordSessionAttendance(day.id);
    try {
      await Linking.openURL(link);
    } catch {
      Alert.alert('Join link', link);
    }
  };

  const joinLive = async (lesson: TrainingLesson) => {
    if (lesson.isAttended) {
      Alert.alert(
        'Already attended',
        'You have already joined this live lesson.',
      );
      return;
    }
    const link = (lesson.joinUrl ?? '').trim();
    if (!link) {
      Alert.alert('Join link', 'meeting_link is empty.');
      return;
    }
    // Lesson-level meeting → lesson attendance API
    await recordLessonAttendance(lesson.id);
    try {
      await Linking.openURL(link);
    } catch {
      Alert.alert('Join link', link);
    }
    // API enrolments: do not locally mark complete — wait for backend progress.
    if (!isApiId) {
      completeLesson(trainingId, lesson.id);
      setOpenLessonId(null);
      setActiveLesson(trainingId, undefined);
    }
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
    sequentialLocked?: boolean,
  ) => {
    if (sequentialLocked) {
      return 'Locked · finish previous item first';
    }
    if (lesson.kind === 'video') {
      if (isLiveOnlineTraining) {
        return done ? 'Resource · opened' : 'Resource · tap to open link';
      }
      if (done) return 'Video · completed';
      if (watchPercent > 0) return `Video · ${watchPercent}% watched`;
      return `Video lesson · ${lesson.duration}`;
    }
    if (lesson.kind === 'youtube') {
      return done ? 'YouTube · opened' : 'YouTube · tap to watch';
    }
    if (lesson.kind === 'text') {
      return done ? 'Topic · read' : 'Topic · tap to read';
    }
    if (lesson.kind === 'document') {
      return 'PDF · tap to open';
    }
    if (lesson.kind === 'live') {
      if (done || lesson.isAttended) {
        const when = formatAttendanceDateTime(lesson.attendedAt);
        return when ? `Live · attended · ${when}` : 'Live · attended';
      }
      return `Live Zoom · tap to join · ${lesson.duration}`;
    }
    if (lesson.kind === 'venue') {
      if (done || lesson.isAttended) {
        const when = formatAttendanceDateTime(lesson.attendedAt);
        return when ? `Venue · attended · ${when}` : 'Venue · attended';
      }
      return `Venue QR · ${lesson.duration}`;
    }
    if (lockedExam) {
      return path.deliveryMode === 'Physical'
        ? 'Quiz locked · finish QR check-in first'
        : 'Quiz locked · finish day content first';
    }
    return done ? 'Quiz · submitted' : `Quiz · ${lesson.duration}`;
  };

  if (isApiId && contentQuery.isLoading && !contentQuery.path) {
    return (
      <MarketTrainingScreenShell eyebrow="My learning" title="Loading…" flatBottom>
        <View style={styles.stateWrap}>
          <ActivityIndicator color={TRAINING_GREEN} size="large" />
          <Text style={styles.stateText}>Loading your course content…</Text>
        </View>
      </MarketTrainingScreenShell>
    );
  }

  if (isApiId && contentQuery.isError && !contentQuery.path) {
    return (
      <MarketTrainingScreenShell eyebrow="My learning" title="Course" flatBottom>
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
      eyebrow={`${
        path.deliveryMode === 'Virtual'
          ? 'Online'
          : path.deliveryMode === 'Self-paced'
            ? 'Self-paced'
            : path.deliveryMode
      } · My learning`}
      title={path.title}
      flatBottom
      keyboardAware
      rightLabel={isApiId ? 'My Assessments' : undefined}
      onRightPress={
        isApiId
          ? () =>
              router.push({
                pathname: '/(main)/market/my-training-assessments',
                params: { id: trainingId },
              })
          : undefined
      }
      stickyBelowHeader={
        !isLiveOnlineTraining && activeVideo?.lesson.videoUrl ? (
          <TrainingStickyVideoPlayer
            url={activeVideo.lesson.videoUrl}
            title={activeVideo.lesson.title}
            subtitle={`${activeVideo.day.dayLabel} · ${path.title}`}
            initialSeekSeconds={progressSecondsForLesson(activeVideo.lesson.id)}
            hasPrevious={activeVideoIndex > 0}
            hasNext={
              activeVideoIndex >= 0 &&
              activeVideoIndex < videoPlaylist.length - 1
            }
            onPrevious={() => goAdjacentVideo(-1)}
            onNext={() => goAdjacentVideo(1)}
            onWatchPercent={onStickyWatchPercent}
            onPlaybackTime={onStickyPlaybackTime}
            onClose={() => {
              closeStickyPlayer();
              setActiveLesson(trainingId, undefined);
            }}
          />
        ) : !isLiveOnlineTraining && activeVideo && !isApiId ? (
          <View style={styles.stickyDemoWrap}>
            <InlineVideoPlayer
              lesson={activeVideo.lesson}
              watchPercent={watchPercentFor(activeVideo.lesson.id)}
              playing={playing}
              onTogglePlay={() => setPlaying((p) => !p)}
            />
            <View style={styles.stickyDemoToolbar}>
              <Pressable
                style={[
                  styles.stickyDemoNav,
                  activeVideoIndex <= 0 && styles.toolDisabled,
                ]}
                disabled={activeVideoIndex <= 0}
                onPress={() => goAdjacentVideo(-1)}
              >
                <Text style={styles.stickyDemoNavText}>Prev</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.stickyDemoNav,
                  (activeVideoIndex < 0 ||
                    activeVideoIndex >= videoPlaylist.length - 1) &&
                    styles.toolDisabled,
                ]}
                disabled={
                  activeVideoIndex < 0 ||
                  activeVideoIndex >= videoPlaylist.length - 1
                }
                onPress={() => goAdjacentVideo(1)}
              >
                <Text style={styles.stickyDemoNavText}>Next</Text>
              </Pressable>
              <Pressable
                style={styles.stickyDemoClose}
                onPress={() => {
                  setActiveVideoLessonId(null);
                  setPlaying(false);
                }}
              >
                <Text style={styles.stickyDemoCloseText}>Close</Text>
              </Pressable>
            </View>
          </View>
        ) : null
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

      {isApiId && certificateQuery.isAvailable ? (
        <View style={styles.certificateCard}>
          <Text style={styles.certificateEyebrow}>Certificate</Text>
          <Text style={styles.certificateTitle}>
            You’ve unlocked your completion certificate
          </Text>
          <Text style={styles.certificateMeta}>
            {certificateQuery.certificate?.completed_at
              ? `Completed · ${new Date(
                  certificateQuery.certificate.completed_at,
                ).toLocaleDateString()}`
              : 'All mandatory lessons complete'}
          </Text>
          <Pressable
            style={[
              styles.certificateBtn,
              openingCertificate && styles.certificateBtnBusy,
            ]}
            onPress={openCertificate}
            disabled={openingCertificate}
            accessibilityRole="button"
          >
            {openingCertificate ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.certificateBtnText}>Download certificate</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <View style={styles.howtoCard}>
        <Text style={styles.howtoTitle}>{howto.title}</Text>
        <Text style={styles.howtoText}>{howto.text}</Text>
      </View>

      <View style={styles.curriculumPanel}>
        <Text style={styles.curriculumLabel}>
          {isLiveOnlineTraining
            ? 'Sessions'
            : activeVideo
              ? 'Lectures'
              : 'Curriculum'}
        </Text>
        <Text style={styles.curriculumHelp}>
          {isLiveOnlineTraining
            ? `${path.days.length} live session${path.days.length === 1 ? '' : 's'} · open one for meeting details, then materials below`
            : activeVideo
              ? 'Tap another video to play it above · scroll while watching'
              : `${path.days.length} section${path.days.length === 1 ? '' : 's'} · ${path.days.reduce((sum, day) => sum + day.lessons.length, 0)} items · tap a video to play at the top`}
        </Text>

        <View style={styles.curriculumCard}>
          {path.days.map((day, dayIndex) => {
          const expanded = Boolean(
            resolvedExpandedDayId && resolvedExpandedDayId === day.id,
          );
          const dayDone = isDayComplete(day);
          const contentDone = isDayContentDone(day);
          const examOpen = isExamUnlocked(day);
          const doneCount = day.lessons.filter((lesson) =>
            isLessonDone(lesson),
          ).length;
          const total = day.lessons.length;
          const dayAttendedAt = formatAttendanceDateTime(day.attendedAt);
          const status = dayStatusLabel(
            dayDone,
            contentDone,
            doneCount,
            total,
          );

          return (
            <View
              key={day.id}
              style={
                dayIndex < path.days.length - 1
                  ? styles.curriculumSectionBorder
                  : undefined
              }
            >
              <Pressable
                style={[
                  styles.curriculumSectionHeader,
                  expanded && styles.curriculumSectionHeaderOpen,
                ]}
                onPress={() =>
                  setExpandedDayId((current) => {
                    const openId =
                      current === undefined ? firstDayId : current;
                    return openId === day.id ? '' : day.id;
                  })
                }
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <View
                  style={[
                    styles.curriculumSectionBadge,
                    dayDone && styles.curriculumSectionBadgeDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.curriculumSectionBadgeText,
                      dayDone && styles.curriculumSectionBadgeTextDone,
                    ]}
                  >
                    {dayIndex + 1}
                  </Text>
                </View>
                <View style={styles.curriculumSectionCopy}>
                  <Text style={styles.curriculumSectionTitle} numberOfLines={2}>
                    {day.title}
                  </Text>
                  <Text style={styles.curriculumSectionMeta} numberOfLines={1}>
                    {day.isAttended
                      ? dayAttendedAt
                        ? `Attended · ${dayAttendedAt}`
                        : 'Attended'
                      : day.schedule || day.summary || status.text}
                  </Text>
                </View>
                <Text style={styles.curriculumProgressPill}>
                  {doneCount}/{total}
                </Text>
                <CurriculumChevron expanded={expanded} />
              </Pressable>

              {expanded ? (
                <View style={styles.curriculumLessonList}>
                  {/*
                    Session-wise meeting / venue panel (above lessons).
                    Hidden for now — join + venue QR show under each live/venue lesson.
                    Uncomment if we need session-level meeting link / venue check-in again.
                  <SessionMeetingPanel
                    day={day}
                    onJoin={() => {
                      void joinSessionMeeting(day);
                    }}
                  />
                  */}
                  <View style={styles.curriculumLessonNest}>
                    {day.lessons.length === 0 ? (
                      <Text style={styles.curriculumEmptyText}>
                        No items in this section yet.
                      </Text>
                    ) : (
                      day.lessons.map((lesson, lessonIndex) => {
                        const done = isLessonDone(lesson);
                        const lockedExam =
                          lesson.kind === 'exam' && !examOpen && !done;
                        const sequentialLocked = isSequentiallyLocked(
                          dayIndex,
                          lessonIndex,
                        );
                        const locked =
                          Boolean(lesson.locked) ||
                          lockedExam ||
                          sequentialLocked;
                        const typeMeta = LESSON_TYPE_META[lesson.kind];
                        const isActiveVideo =
                          activeVideoLessonId === lesson.id;
                        const open =
                          openLessonId === lesson.id &&
                          lesson.kind !== 'video' &&
                          lesson.kind !== 'youtube';
                        const watchPercent = watchPercentFor(lesson.id);
                        const attendedAtLabel = formatAttendanceDateTime(
                          lesson.attendedAt,
                        );

                        return (
                          <View
                            key={lesson.id}
                            style={styles.curriculumLessonWrap}
                          >
                            <Pressable
                              style={[
                                styles.curriculumLessonItem,
                                locked && styles.curriculumLessonLocked,
                                (open || isActiveVideo) &&
                                  styles.curriculumLessonOpen,
                                isActiveVideo &&
                                  styles.curriculumLessonActive,
                                done && styles.curriculumLessonDone,
                              ]}
                              onPress={() =>
                                onLessonPress(
                                  day,
                                  lesson,
                                  dayIndex,
                                  lessonIndex,
                                )
                              }
                              accessibilityRole="button"
                              accessibilityState={{
                                disabled:
                                  done &&
                                  (lesson.kind === 'video' ||
                                    lesson.kind === 'youtube') &&
                                  !isApiId,
                                checked: done,
                                selected: isActiveVideo,
                              }}
                            >
                              <View
                                style={[
                                  styles.curriculumTypeIconWrap,
                                  { backgroundColor: typeMeta.bg },
                                ]}
                              >
                                <LessonTypeIcon
                                  kind={lesson.kind}
                                  color={typeMeta.color}
                                />
                              </View>
                              <View style={styles.curriculumLessonCopy}>
                                <Text
                                  style={[
                                    styles.curriculumLessonTitle,
                                    done &&
                                      styles.curriculumLessonTitleDone,
                                  ]}
                                  numberOfLines={2}
                                >
                                  {lesson.title}
                                </Text>
                                <Text
                                  style={styles.curriculumLessonMeta}
                                  numberOfLines={
                                    (lesson.kind === 'live' ||
                                      lesson.kind === 'venue') &&
                                    (done || lesson.isAttended)
                                      ? 2
                                      : 1
                                  }
                                >
                                  {kindLine(
                                    lesson,
                                    done,
                                    lockedExam,
                                    watchPercent,
                                    sequentialLocked,
                                  )}
                                </Text>
                              </View>
                              {downloadUrlForLesson(lesson) ? (
                                <View style={styles.downloadCluster}>
                                  {hasDownloaded(trainingId, lesson.id) ? (
                                    <Text style={styles.downloadedLabel}>
                                      Downloaded
                                    </Text>
                                  ) : null}
                                  <Pressable
                                    style={[
                                      styles.downloadIconBtn,
                                      hasDownloaded(trainingId, lesson.id) &&
                                        styles.downloadIconBtnDone,
                                    ]}
                                    hitSlop={8}
                                    disabled={
                                      downloadingLessonId === lesson.id
                                    }
                                    onPress={(event) => {
                                      event.stopPropagation?.();
                                      onDownloadLesson(lesson);
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                      hasDownloaded(trainingId, lesson.id)
                                        ? `${lesson.title} already downloaded`
                                        : `Download ${lesson.title}`
                                    }
                                  >
                                    {downloadingLessonId === lesson.id ? (
                                      <ActivityIndicator
                                        color={TRAINING_GREEN}
                                        size="small"
                                      />
                                    ) : (
                                      <LessonDownloadIcon
                                        color={
                                          hasDownloaded(
                                            trainingId,
                                            lesson.id,
                                          )
                                            ? TRAINING_GREEN
                                            : TRAINING_TEAL
                                        }
                                      />
                                    )}
                                  </Pressable>
                                </View>
                              ) : null}
                              <LessonStatusIcon
                                done={done}
                                locked={locked}
                              />
                            </Pressable>

                            {open &&
                            lesson.kind === 'live' &&
                            isApiId &&
                            !lesson.isAttended ? (
                              <ApiLessonJoinPanel
                                lesson={lesson}
                                onJoin={() => {
                                  void joinLive(lesson);
                                }}
                              />
                            ) : null}

                            {open &&
                            lesson.kind === 'live' &&
                            isApiId &&
                            lesson.isAttended ? (
                              <View style={styles.inlineLive}>
                                <View
                                  style={[
                                    styles.liveJoinCard,
                                    styles.liveJoinCardAttended,
                                  ]}
                                >
                                  <Text style={styles.liveJoinEyebrow}>
                                    Live · attended
                                  </Text>
                                  <Text style={styles.attendedBanner}>
                                    Attendance already recorded
                                    {attendedAtLabel
                                      ? ` · ${attendedAtLabel}`
                                      : ''}
                                  </Text>
                                </View>
                              </View>
                            ) : null}

                            {open && lesson.kind === 'text' ? (
                              <InlineTextLessonPanel lesson={lesson} />
                            ) : null}

                            {open &&
                            lesson.kind === 'live' &&
                            !isApiId ? (
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
                                  <Text
                                    style={styles.liveUrl}
                                    numberOfLines={2}
                                  >
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
                                    Opens the meeting link, then marks this
                                    session attended so the quiz can unlock.
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
                                <Text style={styles.liveJoinEyebrow}>
                                  {lesson.isAttended
                                    ? 'Venue · attended'
                                    : 'Venue check-in'}
                                </Text>
                                <Text style={styles.venueName}>
                                  {lesson.venue ?? path.title}
                                </Text>
                                {lesson.isAttended ? (
                                  <Text style={styles.attendedBanner}>
                                    Check-in complete
                                    {attendedAtLabel
                                      ? ` · ${attendedAtLabel}`
                                      : ''}
                                  </Text>
                                ) : (
                                  <>
                                    {lesson.address ? (
                                      <Text style={styles.lessonMeta}>
                                        {lesson.address}
                                      </Text>
                                    ) : (
                                      <Text style={styles.lessonMeta}>
                                        Show this QR at the door for in-person
                                        attendance
                                      </Text>
                                    )}
                                    {lesson.checkInWindow ? (
                                      <Text style={styles.lessonMeta}>
                                        {lesson.checkInWindow}
                                      </Text>
                                    ) : null}
                                    <SessionQrImage
                                      uri={
                                        lesson.qrImageBase64 || day.qrImageBase64
                                      }
                                      seed={lesson.passCode ?? lesson.id}
                                    />
                                    {lesson.passCode ? (
                                      <Text style={styles.passCode}>
                                        Pass {lesson.passCode}
                                      </Text>
                                    ) : null}
                                  </>
                                )}
                              </View>
                            ) : null}
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      </View>

      {path.courseNotes.length > 0 ? (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesHelp}>
            Course notes and documents · tap to open
          </Text>
          <View style={styles.notesCard}>
            {path.courseNotes.map((note, index) => (
              <Pressable
                key={note.id}
                style={[
                  styles.notesRow,
                  index < path.courseNotes.length - 1 && styles.notesRowBorder,
                ]}
                onPress={() => {
                  void openTrainingFile({
                    url: note.url,
                    suggestedName: `${note.title}.pdf`,
                  });
                }}
                accessibilityRole="button"
              >
                <View style={styles.notesIconWrap}>
                  <LessonTypeIcon kind="document" color="#b42318" />
                </View>
                <View style={styles.notesCopy}>
                  <Text style={styles.notesTitle} numberOfLines={2}>
                    {note.title}
                  </Text>
                  <Text style={styles.notesMeta}>
                    {note.kind === 'notes_pdf'
                      ? 'Course notes · PDF'
                      : note.kind === 'note'
                        ? 'Note · open'
                        : 'Document · open'}
                  </Text>
                </View>
                <Text style={styles.notesOpen}>Open</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <TrainingAnnouncementsPanel
        trainingId={isApiId ? (id ?? trainingId) : trainingId}
        enabled={isApiId}
      />

      <TrainingDiscussionsPanel
        trainingId={isApiId ? (id ?? trainingId) : trainingId}
        enabled={isApiId}
      />
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  stateWrap: {
    minHeight: Math.max(Dimensions.get('window').height * 0.62, 360),
    justifyContent: 'center',
    alignItems: 'center',
    gap: c(12, 10),
    paddingHorizontal: c(12, 10),
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
  certificateCard: {
    backgroundColor: '#e6f4e8',
    borderWidth: 1,
    borderColor: '#c8e0cc',
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(6, 5),
  },
  certificateEyebrow: {
    fontSize: c(11, 10),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: TRAINING_GREEN,
  },
  certificateTitle: {
    fontSize: NU.body,
    fontWeight: '800',
    color: '#14352a',
  },
  certificateMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    marginBottom: c(4, 2),
  },
  certificateBtn: {
    marginTop: c(4, 2),
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: TRAINING_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificateBtnBusy: {
    opacity: 0.75,
  },
  certificateBtnText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
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
    alignSelf: 'flex-start',
    fontSize: c(12, 11),
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    backgroundColor: TRAINING_GREEN,
    paddingHorizontal: c(10, 8),
    paddingVertical: c(5, 4),
    borderRadius: c(8, 7),
    overflow: 'hidden',
  },
  curriculumHelp: {
    fontSize: c(13, 12),
    lineHeight: c(18, 16),
    fontWeight: '700',
    color: '#1f6b36',
    backgroundColor: '#c8ebd2',
    paddingHorizontal: c(10, 8),
    paddingVertical: c(7, 6),
    borderRadius: c(8, 7),
    overflow: 'hidden',
  },
  curriculumPanel: {
    gap: c(8, 6),
    padding: c(12, 10),
    borderRadius: NU.cardRadius,
    backgroundColor: '#e8f6ec',
    borderWidth: 1,
    borderColor: '#b9dfc2',
  },
  curriculumCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#9ed0aa',
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  notesSection: {
    gap: c(8, 6),
  },
  notesLabel: {
    marginTop: c(4, 2),
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  notesHelp: {
    marginTop: -c(8, 6),
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
    lineHeight: c(17, 15),
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: c(12, 10),
    paddingHorizontal: c(12, 10),
  },
  notesRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: TRAINING_TRACK,
  },
  notesIconWrap: {
    width: c(28, 26),
    height: c(28, 26),
    borderRadius: c(7, 6),
    backgroundColor: '#fdecea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  notesTitle: {
    fontSize: c(13.5, 12.5),
    fontWeight: '600',
    color: TRAINING_TEAL,
  },
  notesMeta: {
    fontSize: c(11, 10),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  notesOpen: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  curriculumSectionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#c5e3cd',
  },
  curriculumSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: c(13, 11),
    paddingHorizontal: c(12, 10),
    backgroundColor: '#f2faf4',
  },
  curriculumSectionHeaderOpen: {
    paddingBottom: c(10, 8),
    backgroundColor: '#d9f0df',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#a8d4b4',
  },
  curriculumSectionBadge: {
    width: c(30, 28),
    height: c(30, 28),
    borderRadius: c(15, 14),
    backgroundColor: TRAINING_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumSectionBadgeDone: {
    backgroundColor: '#1f6b36',
  },
  curriculumSectionBadgeText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  curriculumSectionBadgeTextDone: {
    color: '#FFFFFF',
  },
  curriculumSectionCopy: {
    flex: 1,
    minWidth: 0,
    gap: c(2, 1),
  },
  curriculumSectionTitle: {
    fontSize: c(14.5, 13.5),
    fontWeight: '800',
    color: TRAINING_TEAL,
    lineHeight: c(19, 17),
  },
  curriculumSectionMeta: {
    fontSize: c(11.5, 10.5),
    color: '#4a7a58',
  },
  curriculumProgressPill: {
    fontSize: c(11, 10),
    fontWeight: '800',
    color: '#1f6b36',
    backgroundColor: '#c8ebd2',
    paddingHorizontal: c(7, 6),
    paddingVertical: c(3, 2),
    borderRadius: c(6, 5),
    overflow: 'hidden',
  },
  curriculumLessonList: {
    paddingTop: c(8, 6),
    paddingBottom: c(10, 8),
    paddingHorizontal: c(10, 8),
    backgroundColor: '#dff3e5',
    gap: c(8, 6),
  },
  curriculumLessonNest: {
    marginLeft: c(14, 12),
    paddingLeft: c(10, 8),
    borderLeftWidth: 3,
    borderLeftColor: TRAINING_GREEN,
    gap: c(5, 4),
  },
  curriculumEmptyText: {
    fontSize: c(12, 11),
    color: '#4a7a58',
    paddingVertical: c(8, 6),
    paddingHorizontal: c(4, 2),
  },
  curriculumLessonWrap: {
    gap: c(5, 4),
  },
  curriculumLessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    paddingVertical: c(6, 5),
    paddingHorizontal: c(8, 7),
    borderRadius: c(8, 7),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#b9dfc2',
  },
  curriculumLessonLocked: {
    opacity: 0.88,
    backgroundColor: '#f4faf6',
  },
  curriculumLessonOpen: {
    borderColor: TRAINING_GREEN,
    backgroundColor: '#e4f5ea',
  },
  curriculumLessonActive: {
    borderColor: '#1f6b36',
    backgroundColor: '#d2edd9',
  },
  curriculumLessonDone: {
    backgroundColor: '#f0faf3',
    borderColor: '#a8d4b4',
  },
  stickyDemoWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: TRAINING_BORDER,
  },
  stickyDemoToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    paddingHorizontal: c(14, 12),
    paddingBottom: c(10, 8),
  },
  stickyDemoNav: {
    paddingHorizontal: c(10, 8),
    paddingVertical: c(7, 6),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#eef3f0',
  },
  stickyDemoNavText: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  stickyDemoClose: {
    marginLeft: 'auto',
    paddingHorizontal: c(10, 8),
    paddingVertical: c(7, 6),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#14352a',
  },
  stickyDemoCloseText: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toolDisabled: {
    opacity: 0.4,
  },
  curriculumTypeIconWrap: {
    width: c(22, 20),
    height: c(22, 20),
    borderRadius: c(6, 5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumLessonCopy: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  downloadIconBtn: {
    width: c(26, 24),
    height: c(26, 24),
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef3f0',
  },
  downloadCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(4, 3),
  },
  downloadIconBtnDone: {
    backgroundColor: '#e6f4e8',
    borderWidth: 1,
    borderColor: '#c8e0cc',
  },
  downloadedLabel: {
    fontSize: c(9.5, 9),
    fontWeight: '800',
    color: TRAINING_GREEN,
    letterSpacing: 0.2,
  },
  curriculumLessonTitle: {
    fontSize: c(12.5, 11.5),
    lineHeight: c(16, 15),
    fontWeight: '600',
    color: TRAINING_TEAL,
  },
  curriculumLessonTitleDone: {
    color: TRAINING_MUTED,
  },
  curriculumLessonMeta: {
    fontSize: c(10.5, 9.5),
    color: TRAINING_MUTED,
    fontWeight: '500',
  },
  statusDone: {
    width: c(18, 16),
    height: c(18, 16),
    borderRadius: 99,
    backgroundColor: TRAINING_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOpen: {
    width: c(18, 16),
    height: c(18, 16),
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: '#c5d4c8',
    backgroundColor: '#FFFFFF',
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
  lessonMeta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  inlinePlayer: {
    paddingHorizontal: c(14, 12),
    paddingBottom: c(14, 12),
    gap: c(8, 6),
  },
  apiVideoView: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#000000',
  },
  apiVideoLoading: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#14352a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(8, 6),
  },
  lessonBodyText: {
    fontSize: c(13, 12),
    lineHeight: c(20, 18),
    color: TRAINING_TEAL,
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
  liveJoinCardAttended: {
    borderColor: '#c8e0cc',
    backgroundColor: '#e6f4e8',
  },
  attendedBanner: {
    fontSize: c(13, 12),
    fontWeight: '700',
    color: TRAINING_GREEN,
    lineHeight: c(18, 16),
  },
  fieldRow: {
    gap: c(2, 1),
  },
  fieldLabel: {
    fontSize: c(11, 10),
    fontWeight: '700',
    color: TRAINING_MUTED,
    letterSpacing: 0.3,
  },
  fieldValue: {
    minHeight: c(18, 16),
    fontSize: c(13, 12),
    color: TRAINING_TEAL,
    lineHeight: c(18, 16),
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
  venueQrBlock: {
    width: '100%',
    alignItems: 'center',
    gap: c(8, 6),
    paddingVertical: c(6, 4),
  },
  qrSectionLabel: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_MUTED,
    textAlign: 'center',
  },
  qrOuter: {
    padding: c(10, 8),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
  },
  qrApiImage: {
    width: c(168, 148),
    height: c(168, 148),
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
