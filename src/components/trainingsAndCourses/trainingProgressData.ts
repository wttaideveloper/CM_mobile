export type {
  McqOption,
  McqQuestionType,
  McqQuestion,
  TrainingExam,
  LessonKind,
  TrainingLesson,
  TrainingDay,
  TrainingDeliveryMode,
  TrainingProgressPath,
} from '@/components/trainingsAndCourses/trainingProgressData.types';

export type { ProgressTimelineItem } from '@/components/trainingsAndCourses/trainingProgressData.paths';

export {
  TRAINING_SESSIONS_PROGRESS_PATH,
  getTrainingProgressPath,
  getTrainingExam,
  flattenLessons,
  getContentLessons,
  countTrackableLessons,
  pathToTimeline,
} from '@/components/trainingsAndCourses/trainingProgressData.paths';
