import { Alert } from 'react-native';
import type { TrainingDay, TrainingLesson } from '@/components/trainingsAndCourses/trainingProgressData';
import { formatSessionStartLabel, parseSessionStart } from '@/utils/dateTime';
import { asPlainText } from '@/utils/trainingLessonMedia';

type Bucket = {
  completedLessons: Record<string, string>;
  videoWatchPercent: Record<string, number>;
};

export function useMyTrainingProgressLiveHelpers({
  bucket,
  isApiId,
  path,
}: {
  bucket: Bucket;
  isApiId: boolean;
  path: { days: TrainingDay[]; deliveryMode?: string };
}) {
  const isLessonDone = (lesson: TrainingLesson) => {
    if (lesson.apiCompleted) return true;
    // Live/venue completion comes from content API only (attendance ≠ complete).
    if (isApiId && (lesson.kind === 'live' || lesson.kind === 'venue')) {
      return false;
    }
    return Boolean(bucket.completedLessons[lesson.id]);
  };

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
   * Live Zoom / venue check-in: open 15 minutes before the scheduled start.
   * Stay joinable for 5 hours after start (late joiners allowed).
   * Videos/PDFs/topics are not order-locked.
   */
  const LIVE_VENUE_JOIN_WINDOW_MS = 5 * 60 * 60 * 1000;

  const getLiveVenueScheduleGate = (
    day: TrainingDay,
    lesson: TrainingLesson,
  ): { blocked: boolean; whenLabel: string } | null => {
    if (lesson.kind !== 'live' && lesson.kind !== 'venue') return null;
    if (lesson.isAttended || lesson.apiCompleted) return null;

    const start = parseSessionStart(
      lesson.startsAt,
      day.schedule,
      lesson.checkInWindow,
    );
    if (!start) return null;

    // Inside or after the join window → not a "too early" lock
    // (expiry is handled separately).
    if (Date.now() >= start.getTime() - 15 * 60 * 1000) return null;

    return {
      blocked: true,
      whenLabel: formatSessionStartLabel(start),
    };
  };

  /**
   * Live / venue: expired only after start + 5 hours without attendance.
   * From start until then, join / check-in stays available.
   */
  const getLiveVenueExpiredStatus = (
    day: TrainingDay,
    lesson: TrainingLesson,
  ): { expired: boolean; whenLabel: string } | null => {
    if (lesson.kind !== 'live' && lesson.kind !== 'venue') return null;
    if (lesson.isAttended || lesson.apiCompleted) return null;

    const start = parseSessionStart(
      lesson.startsAt,
      day.schedule,
      lesson.checkInWindow,
    );
    if (!start) return null;

    const closesAt = start.getTime() + LIVE_VENUE_JOIN_WINDOW_MS;
    if (Date.now() <= closesAt) return null;

    return {
      expired: true,
      whenLabel: formatSessionStartLabel(start),
    };
  };

  const alertIfLiveVenueTooEarly = (
    day: TrainingDay,
    lesson: TrainingLesson,
  ): boolean => {
    const gate = getLiveVenueScheduleGate(day, lesson);
    if (!gate?.blocked) return false;
    const kindLabel = lesson.kind === 'venue' ? 'Venue session' : 'Live session';
    Alert.alert(
      'Not started yet',
      `${kindLabel} opens at ${gate.whenLabel}. Come back at that time to ${
        lesson.kind === 'venue' ? 'check in' : 'join'
      }.`,
    );
    return true;
  };

  const alertIfLiveVenueExpired = (
    day: TrainingDay,
    lesson: TrainingLesson,
  ): boolean => {
    const status = getLiveVenueExpiredStatus(day, lesson);
    if (!status?.expired) return false;
    const kindLabel = lesson.kind === 'venue' ? 'Venue session' : 'Live session';
    Alert.alert(
      'Session expired',
      `${kindLabel} was scheduled for ${status.whenLabel}. The 5-hour join window has ended.`,
    );
    return true;
  };


  return {
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
  };
}
