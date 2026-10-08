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



import { useMyTrainingProgressSetup } from '@/screens/trainingsAndCourses/useMyTrainingProgressScreen.setup';
import { useMyTrainingProgressLiveHelpers } from '@/screens/trainingsAndCourses/useMyTrainingProgressScreen.live';
import { createProgressSessionActions } from '@/screens/trainingsAndCourses/useMyTrainingProgressScreen.sessions';

export type MyTrainingProgressModel = ReturnType<
  typeof useMyTrainingProgressScreen
>;

export function useMyTrainingProgressScreen() {
  const setup = useMyTrainingProgressSetup();
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
    closeStickyPlayer,
    completeLesson,
    completeLessonMutation,
    completingLessonIdsRef,
    contentQuery,
    contentReady,
    didApplyFocusRef,
    didAutoResumeRef,
    discussionsSectionRef,
    downloadUrlForLesson,
    downloadingLessonId,
    downloadingNoteId,
    enrolments,
    ensureDayExpanded,
    expandedDayIds,
    firstDayId,
    focus,
    focusRaw,
    goAdjacentVideo,
    hasDownloaded,
    hydrateDownloads,
    id,
    iosKeyboardOpen,
    isApiId,
    isDayExpanded,
    isLiveOnlineTraining,
    keyboardBottomInset,
    keyboardHeightRef,
    lastPlaybackRef,
    lastSavedProgressRef,
    lessonAttendanceMutation,
    liveAttendanceMutation,
    markLessonComplete,
    noteSizeById,
    onDownloadLesson,
    onStickyPlaybackTime,
    onStickyWatchPercent,
    openCertificate,
    openLessonId,
    openLessonIdRef,
    openingCertificate,
    openingNoteId,
    path,
    pendingApproval,
    pendingDiscussionFocusRef,
    pendingTopicCompleteRef,
    persistLessonPlayback,
    playRef,
    playing,
    progressQuery,
    progressSecondsForLesson,
    router,
    saveLessonProgressMutation,
    scheduleTopicLessonComplete,
    scrollDiscussionInputIntoView,
    scrollOffsetYRef,
    scrollRef,
    scrollTargetIntoView,
    seededRef,
    selectVideoLesson,
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
  } = setup;

  const percent = useMemo(() => {
    const apiPercent = contentQuery.content?.progress_percent;
    // Trust content API when present (e.g. 50% = 1/2 lessons). Do not inflate
    // with local counts — attendance alone used to mark live/venue as done.
    if (
      isApiId &&
      typeof apiPercent === 'number' &&
      Number.isFinite(apiPercent)
    ) {
      return Math.max(0, Math.min(100, Math.round(apiPercent)));
    }
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
    return localTotal === 0 ? 0 : Math.round((localDone / localTotal) * 100);
  }, [
    path.days,
    bucket.completedLessons,
    isApiId,
    contentQuery.content?.progress_percent,
  ]);

  const progressLabel = useMemo(() => {
    const content = contentQuery.content;
    const apiDone =
      typeof content?.completed_lessons === 'number'
        ? content.completed_lessons
        : typeof content?.completed_items === 'number'
          ? content.completed_items
          : null;
    const apiTotal =
      typeof content?.total_lessons === 'number'
        ? content.total_lessons
        : typeof content?.total_items === 'number'
          ? content.total_items
          : null;

    const isDone = (lesson: (typeof path.days)[0]['lessons'][0]) => {
      if (lesson.apiCompleted) return true;
      if (isApiId && (lesson.kind === 'live' || lesson.kind === 'venue')) {
        return false;
      }
      return Boolean(bucket.completedLessons[lesson.id]);
    };

    const total =
      isApiId && apiTotal != null && apiTotal > 0
        ? apiTotal
        : path.days.reduce((sum, day) => sum + day.lessons.length, 0);
    const done =
      isApiId && apiDone != null
        ? apiDone
        : path.days.reduce(
            (sum, day) =>
              sum + day.lessons.filter((lesson) => isDone(lesson)).length,
            0,
          );
    const daysDone = path.days.filter((day) =>
      day.lessons.every((lesson) => isDone(lesson)),
    ).length;
    const sessionWord = isApiId ? 'sessions' : 'days';
    return `${done}/${total} lessons · ${daysDone}/${path.days.length} ${sessionWord}`;
  }, [
    isApiId,
    path.days,
    bucket.completedLessons,
    contentQuery.content,
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
        text: `1. Open a venue item at the scheduled start time\n2. Show the QR pass at the door\n3. Tap “Checked in” — the checkbox turns on and the quiz unlocks`,
      };
    }
    if (path.deliveryMode === 'Hybrid') {
      return {
        title: 'How hybrid days work',
        text: `1. Online / venue items open at their scheduled start time\n2. Videos, topics, and PDFs can be opened anytime\n3. Quizzes unlock after that day’s session is done`,
      };
    }
    if (path.deliveryMode === 'Self-paced') {
      return {
        title: 'How self-paced learning works',
        text: `1. Open any section and watch recorded videos\n2. Open PDFs / notes when you need them\n3. Complete quizzes to mark progress — go at your own pace`,
      };
    }
    return {
      title: 'How online live sessions work',
      text: `1. Open a session to see the meeting link and time\n2. Join live / venue items when that session’s start time arrives\n3. Videos, topics, and PDFs can be opened anytime`,
    };
  }, [path.deliveryMode]);




  const {
    isLessonDone,
    isDayContentDone,
    isExamUnlocked,
    isDayComplete,
    watchPercentFor,
    examLockMessage,
    LIVE_VENUE_JOIN_WINDOW_MS,
    getLiveVenueScheduleGate,
    getLiveVenueExpiredStatus,
    alertIfLiveVenueTooEarly,
    alertIfLiveVenueExpired,
  } = useMyTrainingProgressLiveHelpers({ bucket, isApiId, path });

  const onLessonPress = (
    day: TrainingDay,
    lesson: TrainingLesson,
    dayIndex: number,
    lessonIndex: number,
  ) => {
    void dayIndex;
    void lessonIndex;

    if (alertIfLiveVenueTooEarly(day, lesson)) {
      return;
    }
    if (alertIfLiveVenueExpired(day, lesson)) {
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
      ensureDayExpanded(day.id);
      setOpenLessonId(lesson.id);
      setPlaying(false);
      setActiveLesson(trainingId, lesson.id);
      return;
    }

    if (lesson.kind === 'youtube' || isYoutubeUrl(lesson.videoUrl)) {
      const url = asPlainText(lesson.videoUrl);
      if (!url) {
        Alert.alert('YouTube', 'No YouTube link is attached to this item yet.');
        return;
      }
      setActiveVideoLessonId(null);
      void Linking.openURL(url)
        .then(() => {
          if (!done) markLessonComplete(lesson.id);
        })
        .catch(() => {
          Alert.alert('YouTube', url);
        });
      return;
    }

    if (isStickyCourseVideo(lesson)) {
      // Online live trainings are meeting-based — open clip links externally,
      // never the sticky course video player.
      if (isLiveOnlineTraining) {
        const url = asPlainText(lesson.videoUrl);
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

    // Text / topic — expand under row; mark complete only after a short read delay
    const willOpen = openLessonId !== lesson.id;
    ensureDayExpanded(day.id);
    setOpenLessonId(willOpen ? lesson.id : null);
    setPlaying(false);
    setActiveLesson(trainingId, lesson.id);
    if (!isLiveOnlineTraining && isStickyCourseVideo(lesson)) {
      setActiveVideoLessonId(lesson.id);
    } else {
      setActiveVideoLessonId(null);
    }
    if (willOpen && !done) {
      scheduleTopicLessonComplete(lesson.id);
    } else {
      clearPendingTopicComplete(lesson.id);
    }
  };

  const {
    recordSessionAttendance,
    recordLessonAttendance,
    joinSessionMeeting,
    joinLive,
  } = createProgressSessionActions({
    isApiId,
    trainingId,
    attendingSessionIdsRef,
    attendingLessonIdsRef,
    liveAttendanceMutation,
    lessonAttendanceMutation,
    alertIfLiveVenueTooEarly,
    completeLesson,
    setOpenLessonId,
    setActiveLesson,
    path,
  });

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
    scheduleLocked?: boolean,
    scheduleWhen?: string,
    expired?: boolean,
    expiredWhen?: string,
  ) => {
    if (scheduleLocked) {
      return scheduleWhen
        ? `Opens ${scheduleWhen}`
        : 'Not started yet · wait for session time';
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
      if (expired) {
        return expiredWhen
          ? `Expired · not attended · ${expiredWhen}`
          : 'Expired · not attended';
      }
      const when = formatSessionWhenLabel(lesson.startsAt, lesson.checkInWindow);
      return when
        ? `Live · ${when}`
        : `Live Zoom · tap to join · ${lesson.duration}`;
    }
    if (lesson.kind === 'venue') {
      if (done || lesson.isAttended) {
        const when = formatAttendanceDateTime(lesson.attendedAt);
        return when ? `Venue · attended · ${when}` : 'Venue · attended';
      }
      if (expired) {
        return expiredWhen
          ? `Expired · not attended · ${expiredWhen}`
          : 'Expired · not attended';
      }
      const when = formatSessionWhenLabel(lesson.startsAt, lesson.checkInWindow);
      return when ? `Venue · ${when}` : `Venue QR · ${lesson.duration}`;
    }
    if (lockedExam) {
      return path.deliveryMode === 'Physical'
        ? 'Quiz locked · finish QR check-in first'
        : 'Quiz locked · finish day content first';
    }
    return done ? 'Quiz · submitted' : `Quiz · ${lesson.duration}`;
  };

  const onCheckApprovalStatus = async () => {
    if (checkingApproval) return;
    setCheckingApproval(true);
    try {
      // Refetch enrolment status. If approved, pending UI unmounts and content loads.
      await Promise.all([trainingQuery.refetch(), enrolments.refetch()]);
    } finally {
      setCheckingApproval(false);
    }
  };



  return {
    ...setup,

    howto,
    nextStepText,
    continueItem,
    progressLabel,
    percent,
    LIVE_VENUE_JOIN_WINDOW_MS,
    alertIfLiveVenueExpired,
    alertIfLiveVenueTooEarly,
    dayStatusLabel,
    examLockMessage,
    getLiveVenueExpiredStatus,
    getLiveVenueScheduleGate,
    isDayComplete,
    isDayContentDone,
    isExamUnlocked,
    isLessonDone,
    joinLive,
    joinSessionMeeting,
    kindLine,
    onCheckApprovalStatus,
    onLessonPress,
    recordLessonAttendance,
    recordSessionAttendance,
    watchPercentFor,
  };
}
