import { Alert, Linking } from 'react-native';

import type {
  TrainingDay,
  TrainingLesson,
} from '@/components/trainingsAndCourses/trainingProgressData';
import { asPlainText } from '@/utils/trainingLessonMedia';

type SessionDeps = Record<string, any>;

/** Attendance / join handlers extracted from the progress screen hook (behavior unchanged). */
export function createProgressSessionActions(d: SessionDeps) {
  const {
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
  } = d;

  const recordSessionAttendance = async (sessionId: string) => {
    if (!isApiId || !asPlainText(sessionId)) return;
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
    if (!isApiId || !asPlainText(lessonId)) return;
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
    const liveLesson =
      day.lessons.find((item) => item.kind === 'live') ??
      ({
        id: day.id,
        kind: 'live' as const,
        title: day.title,
        duration: '—',
        detail: '',
        startsAt: day.schedule,
      } satisfies TrainingLesson);
    if (alertIfLiveVenueTooEarly(day, liveLesson)) return;
    const link = asPlainText(day.meetingLink);
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

  const joinLive = async (lesson: TrainingLesson, day?: TrainingDay) => {
    if (lesson.isAttended) {
      Alert.alert(
        'Already attended',
        'You have already joined this live lesson.',
      );
      return;
    }
    const hostDay =
      day ??
      path.days.find((item: TrainingDay) =>
        item.lessons.some((row) => row.id === lesson.id),
      );
    if (hostDay && alertIfLiveVenueTooEarly(hostDay, lesson)) return;
    const link = asPlainText(lesson.joinUrl);
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

  return {
    recordSessionAttendance,
    recordLessonAttendance,
    joinSessionMeeting,
    joinLive,
  };
}
