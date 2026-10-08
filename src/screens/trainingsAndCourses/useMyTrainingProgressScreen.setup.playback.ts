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



import { useMyTrainingProgressSetupCore } from '@/screens/trainingsAndCourses/useMyTrainingProgressScreen.setup.core';

export function useMyTrainingProgressSetup() {
  const core = useMyTrainingProgressSetupCore();
  const {
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
    videoPlaylist
  } = core;

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
    ensureDayExpanded(day.id);
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

    const resumeSeconds =
      resumeLesson.progressSeconds ??
      (() => {
        const row = progressQuery.data?.lessons?.find(
          (item) => item.lesson_id === resumeLesson.id,
        );
        const raw = row?.position_seconds;
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string') {
          const n = Number(raw);
          return Number.isFinite(n) ? n : 0;
        }
        return 0;
      })();
    const alreadyStarted =
      resumeLesson.apiCompleted ||
      (typeof resumeSeconds === 'number' && resumeSeconds > 1);

    // Fresh enroll: open the first section only. Do not mount/play a video
    // until the learner taps a lesson — autoplay is confusing.
    if (!alreadyStarted) {
      const openId = contentQuery.path.days[0]?.id ?? resumeDay.id;
      setExpandedDayIds(openId ? new Set([openId]) : new Set());
      return;
    }

    ensureDayExpanded(resumeDay.id);
    setActiveLesson(trainingId, resumeLesson.id);
    if (isStickyCourseVideo(resumeLesson)) {
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

  const goAdjacentVideo = (delta: number) => {
    const next = videoPlaylist[activeVideoIndex + delta];
    if (!next) return;
    selectVideoLesson(next.day, next.lesson);
  };

  const isLiveOnlineTraining = useMemo(() => {
    if (path.deliveryMode !== 'Virtual') return false;
    return path.days.some(
      (day) =>
        day.sectionType === 'live' || Boolean(asPlainText(day.meetingLink)),
    );
  }, [path.days, path.deliveryMode]);

  const downloadUrlForLesson = (lesson: TrainingLesson): string | null => {
    // Only when API sets is_downloadable: true — videos & documents only.
    if (lesson.isDownloadable !== true) return null;
    // Live online sessions are meeting-based — don't offer course-video downloads.
    if (isLiveOnlineTraining && lesson.kind === 'video') return null;
    if (lesson.kind === 'video') return asPlainText(lesson.videoUrl) || null;
    if (lesson.kind === 'document') {
      return asPlainText(lesson.documentUrls?.[0]) || null;
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


  return {
    ...core,
    closeStickyPlayer,
    downloadUrlForLesson,
    goAdjacentVideo,
    isLiveOnlineTraining,
    onDownloadLesson,
    onStickyPlaybackTime,
    onStickyWatchPercent,
    persistLessonPlayback,
    progressSecondsForLesson,
    selectVideoLesson,
  };
}
