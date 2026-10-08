import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { downloadTrainingToLibrary, openTrainingFile, probeTrainingFileSizeBytes } from '@/utils/downloadTrainingFile';
import { formatTrainingFileSize } from '@/utils/trainingFileSize';

import { TrainingCoverImage } from '@/components/trainingsAndCourses/TrainingCoverImage';
import { TrainingStickyVideoPlayer } from '@/components/trainingsAndCourses/TrainingStickyVideoPlayer';
import { TrainingAnnouncementsPanel } from '@/components/trainingsAndCourses/TrainingAnnouncementsPanel';
import { TrainingDiscussionsPanel } from '@/components/trainingsAndCourses/TrainingDiscussionsPanel';
import {
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';
import {
  getTrainingProgressPath,
  type TrainingDay,
  type TrainingLesson,
  type TrainingProgressPath,
} from '@/components/trainingsAndCourses/trainingProgressData';
import {
  isApiTrainingId,
  useCompleteTrainingLesson,
  useMyTrainingEnrolments,
  useRecordLessonAttendance,
  useRecordLiveSessionAttendance,
  useSaveLessonProgress,
  useTraining,
  useTrainingCertificate,
  useTrainingContent,
  useTrainingDiscussions,
  useTrainingProgress,
} from '@/hooks/useTrainings';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';
import { useAuthStore } from '@/stores/auth.store';
import { useTrainingDownloadsStore } from '@/stores/trainingDownloads.store';
import {
  useTrainingProgressStore,
  VIDEO_COMPLETE_THRESHOLD,
} from '@/stores/trainingProgress.store';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  formatAttendanceDateTime,
  formatSessionStartLabel,
  parseSessionStart,
} from '@/utils/dateTime';
import {
  asPlainText,
  clampDisplayText,
  isYoutubeUrl,
  resolveAbsoluteApiUrl,
} from '@/utils/trainingLessonMedia';

import {
  ApiLessonJoinPanel,
  CurriculumChevron,
  EMPTY_BUCKET,
  FieldRow,
  InlineTextLessonPanel,
  InlineVideoPlayer,
  LessonDownloadIcon,
  LessonStatusIcon,
  LessonTypeIcon,
  LESSON_TYPE_META,
  ProgressTracker,
  SessionMeetingPanel,
  SessionQrImage,
  VenuePassCodeRow,
  formatSessionWhenLabel,
  isStickyCourseVideo,
  loadingPathFor,
  useIosKeyboardOpen,
  useKeyboardBottomInset,
} from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.parts';
import { styles } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.styles';



export function useMyTrainingProgressSetupCore() {
  const router = useRouter();
  const iosKeyboardOpen = useIosKeyboardOpen();
  const keyboardBottomInset = useKeyboardBottomInset();
  const keyboardHeightRef = useRef(0);
  keyboardHeightRef.current = keyboardBottomInset;
  const { id: idParam, focus: focusParam } = useLocalSearchParams<{
    id?: string | string[];
    focus?: string | string[];
  }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const focusRaw = Array.isArray(focusParam) ? focusParam[0] : focusParam;
  const focus = (focusRaw?.trim().toLowerCase() || '') as string;
  const isApiId = isApiTrainingId(id);
  const trainingQuery = useTraining(id);
  const enrolments = useMyTrainingEnrolments();
  const pendingApproval =
    Boolean(trainingQuery.training?.isPendingApproval) ||
    enrolments.isPendingApproval(id);
  const contentQuery = useTrainingContent(pendingApproval ? undefined : id);
  // Wait for curriculum before secondary calls — avoids a 4-request storm
  // during token refresh that often logs as Network Error on My Learning.
  const contentReady =
    !pendingApproval &&
    Boolean(contentQuery.path) &&
    !contentQuery.isError;
  useTrainingDiscussions(isApiId && contentReady ? id : undefined);
  const certificateQuery = useTrainingCertificate(
    isApiId && contentReady ? id : undefined,
  );
  const progressQuery = useTrainingProgress(
    isApiId && contentReady ? id : undefined,
  );
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
  /** Topic/text: delay complete-lesson so opening ≠ instantly "read". */
  const TOPIC_COMPLETE_DELAY_MS = 5_000;
  const pendingTopicCompleteRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());
  const openLessonIdRef = useRef<string | null>(null);
  const [downloadingLessonId, setDownloadingLessonId] = useState<string | null>(
    null,
  );
  const [downloadingNoteId, setDownloadingNoteId] = useState<string | null>(
    null,
  );
  const [openingNoteId, setOpeningNoteId] = useState<string | null>(null);
  const [noteSizeById, setNoteSizeById] = useState<Record<string, string>>({});
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [openingCertificate, setOpeningCertificate] = useState(false);
  const path =
    isApiId
      ? (contentQuery.path ?? loadingPathFor(id))
      : getTrainingProgressPath(id);
  const trainingId = path.trainingId || id || '';
  const userId = useAuthStore((s) => s.user?.id?.trim() || '');

  const hydrateDownloads = useTrainingDownloadsStore((s) => s.hydrate);
  const hasDownloaded = useTrainingDownloadsStore((s) => s.has);

  useEffect(() => {
    void hydrateDownloads();
  }, [hydrateDownloads]);

  useEffect(() => {
    const notes = path.courseNotes ?? [];
    const missing = notes.filter(
      (note) => !note.sizeLabel && !noteSizeById[note.id] && note.url,
    );
    if (missing.length === 0) return;

    let cancelled = false;
    void (async () => {
      const next: Record<string, string> = {};
      await Promise.all(
        missing.map(async (note) => {
          const bytes = await probeTrainingFileSizeBytes(asPlainText(note.url));
          const label = formatTrainingFileSize(bytes);
          if (label) next[note.id] = label;
        }),
      );
      if (!cancelled && Object.keys(next).length > 0) {
        setNoteSizeById((prev) => ({ ...prev, ...next }));
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally depend on note ids/urls, not noteSizeById (avoids loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path.courseNotes]);

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

  const clearPendingTopicComplete = (lessonId?: string) => {
    if (lessonId) {
      const timer = pendingTopicCompleteRef.current.get(lessonId);
      if (timer) clearTimeout(timer);
      pendingTopicCompleteRef.current.delete(lessonId);
      return;
    }
    for (const timer of pendingTopicCompleteRef.current.values()) {
      clearTimeout(timer);
    }
    pendingTopicCompleteRef.current.clear();
  };

  const scheduleTopicLessonComplete = (lessonId: string) => {
    clearPendingTopicComplete(lessonId);
    const timer = setTimeout(() => {
      pendingTopicCompleteRef.current.delete(lessonId);
      // Only complete if this topic is still open after the delay.
      if (openLessonIdRef.current !== lessonId) return;
      markLessonComplete(lessonId);
    }, TOPIC_COMPLETE_DELAY_MS);
    pendingTopicCompleteRef.current.set(lessonId, timer);
  };

  useEffect(() => {
    return () => clearPendingTopicComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCertificate = () => {
    if (!isApiId || !trainingId || openingCertificate) return;
    const fromApi = asPlainText(certificateQuery.certificate?.certificate_url);
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
    (s) =>
      (userId ? s.byUser[userId]?.[trainingId] : undefined) ?? EMPTY_BUCKET,
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

  // null = not touched yet → keep first section open; Set = user-controlled (multi-open)
  const [expandedDayIds, setExpandedDayIds] = useState<Set<string> | null>(null);
  const firstDayId = path.days[0]?.id ?? '';

  const isDayExpanded = (dayId: string) => {
    if (expandedDayIds === null) return Boolean(firstDayId) && dayId === firstDayId;
    return expandedDayIds.has(dayId);
  };

  const ensureDayExpanded = (dayId: string) => {
    setExpandedDayIds((prev) => {
      const next = new Set(
        prev === null ? (firstDayId ? [firstDayId] : []) : prev,
      );
      next.add(dayId);
      return next;
    });
  };

  const scrollRef = useRef<ScrollView | null>(null);
  const certificateSectionRef = useRef<View | null>(null);
  const announcementsSectionRef = useRef<View | null>(null);
  const discussionsSectionRef = useRef<View | null>(null);
  const didApplyFocusRef = useRef<string | null>(null);
  const scrollOffsetYRef = useRef(0);
  const pendingDiscussionFocusRef = useRef<View | null>(null);

  const scrollTargetIntoView = (target: View | null) => {
    const scroll = scrollRef.current;
    if (!target || !scroll) return;
    target.measureInWindow((_x, y) => {
      scroll.measureInWindow((_sx, sy) => {
        const targetY = Math.max(0, scrollOffsetYRef.current + (y - sy) - 12);
        scroll.scrollTo({ y: targetY, animated: true });
      });
    });
  };

  useEffect(() => {
    if (!focus || pendingApproval || !contentReady) return;
    const key = `${trainingId}:${focus}`;
    if (didApplyFocusRef.current === key) return;

    const target =
      focus === 'certificate'
        ? certificateSectionRef.current
        : focus === 'announcements'
          ? announcementsSectionRef.current
          : focus === 'discussions'
            ? discussionsSectionRef.current
            : null;

    if (focus === 'content') {
      didApplyFocusRef.current = key;
      return;
    }

    if (!target) {
      // Panels may mount a beat later (certificate only when available).
      const timer = setTimeout(() => {
        const retry =
          focus === 'certificate'
            ? certificateSectionRef.current
            : focus === 'announcements'
              ? announcementsSectionRef.current
              : focus === 'discussions'
                ? discussionsSectionRef.current
                : null;
        if (!retry) return;
        didApplyFocusRef.current = key;
        scrollTargetIntoView(retry);
      }, 350);
      return () => clearTimeout(timer);
    }

    didApplyFocusRef.current = key;
    const timer = setTimeout(() => scrollTargetIntoView(target), 200);
    return () => clearTimeout(timer);
  }, [contentReady, focus, pendingApproval, trainingId, certificateQuery.isAvailable]);

  /** Keep Q&A reply/ask fields above the keyboard without keyboard insets. */
  const scrollDiscussionInputIntoView = (target: View | null) => {
    pendingDiscussionFocusRef.current = target;
    if (!target) return;
    const run = () => {
      const scroll = scrollRef.current;
      const node = pendingDiscussionFocusRef.current;
      if (!scroll || !node) return;
      node.measureInWindow((_x, y, _w, h) => {
        scroll.measureInWindow((_sx, sy, _sw, sh) => {
          const kb = keyboardHeightRef.current;
          const gap = 20;
          const visibleBottom = sy + sh - kb - gap;
          const fieldBottom = y + h;
          if (fieldBottom <= visibleBottom) return;
          const delta = fieldBottom - visibleBottom;
          scroll.scrollTo({
            y: Math.max(0, scrollOffsetYRef.current + delta),
            animated: true,
          });
        });
      });
    };
    requestAnimationFrame(() => {
      setTimeout(run, Platform.OS === 'ios' ? 120 : 60);
    });
  };

  useEffect(() => {
    if (keyboardBottomInset <= 0) return;
    if (!pendingDiscussionFocusRef.current) return;
    scrollDiscussionInputIntoView(pendingDiscussionFocusRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardBottomInset]);

  const toggleExpandedDay = (dayId: string) => {
    // Stay at the tap position — do not scroll. Keep other sessions open.
    setExpandedDayIds((prev) => {
      const next = new Set(
        prev === null ? (firstDayId ? [firstDayId] : []) : prev,
      );
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  useEffect(() => {
    // New course → open first section again
    setExpandedDayIds(null);
  }, [trainingId]);

  /** Lesson currently open inline inside a day (live / venue / text) */
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);

  useEffect(() => {
    openLessonIdRef.current = openLessonId;
    for (const [id, timer] of pendingTopicCompleteRef.current) {
      if (id === openLessonId) continue;
      clearTimeout(timer);
      pendingTopicCompleteRef.current.delete(id);
    }
  }, [openLessonId]);

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
        if (!isStickyCourseVideo(lesson)) continue;
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


  return {
    TOPIC_COMPLETE_DELAY_MS,
    activeVideo,
    activeVideoIndex,
    activeVideoLessonId,
    announcementsSectionRef,
    attendingLessonIdsRef,
    attendingSessionIdsRef,
    bucket,
    certificateQuery,
    certificateSectionRef,
    checkingApproval,
    clearPendingTopicComplete,
    completeLesson,
    completeLessonMutation,
    completingLessonIdsRef,
    contentQuery,
    contentReady,
    didApplyFocusRef,
    didAutoResumeRef,
    discussionsSectionRef,
    downloadingLessonId,
    downloadingNoteId,
    enrolments,
    ensureDayExpanded,
    expandedDayIds,
    firstDayId,
    focus,
    focusRaw,
    hasDownloaded,
    hydrateDownloads,
    id,
    iosKeyboardOpen,
    isApiId,
    isDayExpanded,
    keyboardBottomInset,
    keyboardHeightRef,
    lastPlaybackRef,
    lastSavedProgressRef,
    lessonAttendanceMutation,
    liveAttendanceMutation,
    markLessonComplete,
    noteSizeById,
    openCertificate,
    openLessonId,
    openLessonIdRef,
    openingCertificate,
    openingNoteId,
    path,
    pendingApproval,
    pendingDiscussionFocusRef,
    pendingTopicCompleteRef,
    playRef,
    playing,
    progressQuery,
    router,
    saveLessonProgressMutation,
    scheduleTopicLessonComplete,
    scrollDiscussionInputIntoView,
    scrollOffsetYRef,
    scrollRef,
    scrollTargetIntoView,
    seededRef,
    setActiveLesson,
    setActiveVideoLessonId,
    setCheckingApproval,
    setDownloadingLessonId,
    setDownloadingNoteId,
    setExpandedDayIds,
    setNoteSizeById,
    setOpenLessonId,
    setOpeningCertificate,
    setOpeningNoteId,
    setPlaying,
    setVideoWatchPercent,
    toggleExpandedDay,
    trainingId,
    trainingQuery,
    userId,
    videoPlaylist,
  };
}
