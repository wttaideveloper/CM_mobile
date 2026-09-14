import { create } from 'zustand';

import {
  countTrackableLessons,
  flattenLessons,
  getContentLessons,
  getTrainingProgressPath,
  type TrainingDay,
  type TrainingLesson,
} from '@/components/market/marketTrainingProgressData';

/** Videos auto-complete once watched at least this far. */
export const VIDEO_COMPLETE_THRESHOLD = 80;

export type ExamAttempt = {
  examId: string;
  answers: Record<string, string>;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
};

type TrainingProgressBucket = {
  completedLessons: Record<string, string>;
  /** 0–100 watch progress for video lessons */
  videoWatchPercent: Record<string, number>;
  examAttempts: Record<string, ExamAttempt>;
  activeLessonId?: string;
};

type TrainingProgressState = {
  byTraining: Record<string, TrainingProgressBucket>;
  getBucket: (trainingId: string) => TrainingProgressBucket;
  setActiveLesson: (trainingId: string, lessonId: string | undefined) => void;
  setVideoWatchPercent: (
    trainingId: string,
    lessonId: string,
    percent: number,
  ) => void;
  completeLesson: (trainingId: string, lessonId: string) => void;
  submitExam: (args: {
    trainingId: string;
    examId: string;
    lessonId?: string;
    answers: Record<string, string>;
    scorePercent: number;
    passed: boolean;
  }) => void;
  isLessonDone: (trainingId: string, lessonId: string) => boolean;
  getVideoWatchPercent: (trainingId: string, lessonId: string) => number;
  isExamSubmitted: (trainingId: string, examId: string) => boolean;
  isDayContentDone: (trainingId: string, day: TrainingDay) => boolean;
  isExamUnlocked: (trainingId: string, day: TrainingDay) => boolean;
  isDayComplete: (trainingId: string, day: TrainingDay) => boolean;
  getProgressPercent: (trainingId: string) => number;
  getProgressLabel: (trainingId: string) => string;
  getContinueLesson: (
    trainingId: string,
  ) => { day: TrainingDay; lesson: TrainingLesson } | null;
};

const EMPTY_BUCKET: TrainingProgressBucket = {
  completedLessons: {},
  videoWatchPercent: {},
  examAttempts: {},
};

const emptyBucket = (): TrainingProgressBucket => EMPTY_BUCKET;

function ensureBucket(
  state: { byTraining: Record<string, TrainingProgressBucket> },
  trainingId: string,
): TrainingProgressBucket {
  return (
    state.byTraining[trainingId] ?? {
      completedLessons: {},
      videoWatchPercent: {},
      examAttempts: {},
    }
  );
}

export const useTrainingProgressStore = create<TrainingProgressState>(
  (set, get) => ({
    byTraining: {},

    getBucket: (trainingId) => get().byTraining[trainingId] ?? emptyBucket(),

    setActiveLesson: (trainingId, lessonId) => {
      set((state) => {
        const prev = ensureBucket(state, trainingId);
        return {
          byTraining: {
            ...state.byTraining,
            [trainingId]: { ...prev, activeLessonId: lessonId },
          },
        };
      });
    },

    setVideoWatchPercent: (trainingId, lessonId, percent) => {
      const clamped = Math.max(0, Math.min(100, Math.round(percent)));
      set((state) => {
        const prev = ensureBucket(state, trainingId);
        const nextWatch = {
          ...prev.videoWatchPercent,
          [lessonId]: Math.max(
            prev.videoWatchPercent[lessonId] ?? 0,
            clamped,
          ),
        };
        const completedLessons = { ...prev.completedLessons };
        if (
          nextWatch[lessonId] >= VIDEO_COMPLETE_THRESHOLD &&
          !completedLessons[lessonId]
        ) {
          completedLessons[lessonId] = new Date().toISOString();
        }
        return {
          byTraining: {
            ...state.byTraining,
            [trainingId]: {
              ...prev,
              videoWatchPercent: nextWatch,
              completedLessons,
              activeLessonId:
                completedLessons[lessonId] && prev.activeLessonId === lessonId
                  ? undefined
                  : prev.activeLessonId,
            },
          },
        };
      });
    },

    completeLesson: (trainingId, lessonId) => {
      set((state) => {
        const prev = ensureBucket(state, trainingId);
        return {
          byTraining: {
            ...state.byTraining,
            [trainingId]: {
              ...prev,
              completedLessons: {
                ...prev.completedLessons,
                [lessonId]: new Date().toISOString(),
              },
              videoWatchPercent: {
                ...prev.videoWatchPercent,
                [lessonId]: Math.max(
                  prev.videoWatchPercent[lessonId] ?? 0,
                  100,
                ),
              },
              activeLessonId:
                prev.activeLessonId === lessonId
                  ? undefined
                  : prev.activeLessonId,
            },
          },
        };
      });
    },

    submitExam: ({
      trainingId,
      examId,
      lessonId,
      answers,
      scorePercent,
      passed,
    }) => {
      set((state) => {
        const prev = ensureBucket(state, trainingId);
        const completedLessons = { ...prev.completedLessons };
        if (lessonId) {
          completedLessons[lessonId] = new Date().toISOString();
        } else {
          const path = getTrainingProgressPath(trainingId);
          const match = flattenLessons(path).find(
            (lesson) => lesson.kind === 'exam' && lesson.examId === examId,
          );
          if (match) completedLessons[match.id] = new Date().toISOString();
        }

        return {
          byTraining: {
            ...state.byTraining,
            [trainingId]: {
              ...prev,
              completedLessons,
              examAttempts: {
                ...prev.examAttempts,
                [examId]: {
                  examId,
                  answers,
                  scorePercent,
                  passed,
                  submittedAt: new Date().toISOString(),
                },
              },
            },
          },
        };
      });
    },

    isLessonDone: (trainingId, lessonId) =>
      Boolean(get().getBucket(trainingId).completedLessons[lessonId]),

    getVideoWatchPercent: (trainingId, lessonId) => {
      const bucket = get().getBucket(trainingId);
      if (bucket.completedLessons[lessonId]) return 100;
      return bucket.videoWatchPercent[lessonId] ?? 0;
    },

    isExamSubmitted: (trainingId, examId) =>
      Boolean(get().getBucket(trainingId).examAttempts[examId]),

    isDayContentDone: (trainingId, day) => {
      const content = getContentLessons(day);
      if (content.length === 0) return true;
      return content.every((lesson) =>
        get().isLessonDone(trainingId, lesson.id),
      );
    },

    isExamUnlocked: (trainingId, day) =>
      get().isDayContentDone(trainingId, day),

    isDayComplete: (trainingId, day) =>
      day.lessons.every((lesson) => {
        if (lesson.kind === 'exam' && lesson.examId) {
          return get().isExamSubmitted(trainingId, lesson.examId);
        }
        return get().isLessonDone(trainingId, lesson.id);
      }),

    getProgressPercent: (trainingId) => {
      const path = getTrainingProgressPath(trainingId);
      const total = countTrackableLessons(path);
      if (total === 0) return 0;
      const bucket = get().getBucket(trainingId);
      const done = flattenLessons(path).filter((lesson) =>
        Boolean(bucket.completedLessons[lesson.id]),
      ).length;
      return Math.round((done / total) * 100);
    },

    getProgressLabel: (trainingId) => {
      const path = getTrainingProgressPath(trainingId);
      const total = countTrackableLessons(path);
      const bucket = get().getBucket(trainingId);
      const done = flattenLessons(path).filter((lesson) =>
        Boolean(bucket.completedLessons[lesson.id]),
      ).length;
      const daysDone = path.days.filter((day) =>
        get().isDayComplete(trainingId, day),
      ).length;
      return `${done}/${total} lessons · ${daysDone}/${path.days.length} days`;
    },

    getContinueLesson: (trainingId) => {
      const path = getTrainingProgressPath(trainingId);
      const bucket = get().getBucket(trainingId);

      if (bucket.activeLessonId) {
        for (const day of path.days) {
          const lesson = day.lessons.find((l) => l.id === bucket.activeLessonId);
          if (lesson && !bucket.completedLessons[lesson.id]) {
            return { day, lesson };
          }
        }
      }

      for (const day of path.days) {
        for (const lesson of day.lessons) {
          if (lesson.kind === 'exam') {
            if (!get().isExamUnlocked(trainingId, day)) continue;
            if (
              lesson.examId &&
              get().isExamSubmitted(trainingId, lesson.examId)
            ) {
              continue;
            }
            return { day, lesson };
          }
          if (!bucket.completedLessons[lesson.id]) {
            return { day, lesson };
          }
        }
      }
      return null;
    },
  }),
);
