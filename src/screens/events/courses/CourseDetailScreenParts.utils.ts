import {
  type Course,
  type CourseLevel,
} from '@/constants/courses';
import {
  LEVEL_ADVANCED_BG,
  LEVEL_ADVANCED_TEXT,
  LEVEL_ALL_BG,
  LEVEL_ALL_TEXT,
  LEVEL_BEGINNER_BG,
} from '@/screens/events/courses/CourseDetailScreen.styles';

export function instructorInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function levelHeroStyle(level: CourseLevel) {
  switch (level) {
    case 'Beginner':
      return { bg: LEVEL_BEGINNER_BG, text: '#FFFFFF' };
    case 'Advanced':
      return { bg: LEVEL_ADVANCED_BG, text: LEVEL_ADVANCED_TEXT };
    default:
      return { bg: LEVEL_ALL_BG, text: LEVEL_ALL_TEXT };
  }
}

export function getCourseFooterLabel(course: Course): string {
  const progress = course.enrollmentProgress;
  const showProgress = course.isEnrolled && progress;

  if (showProgress) {
    return 'Continue Learning →';
  }

  if (course.isFree) {
    return 'Enroll Now — Free';
  }

  return `Enroll Now — ${course.priceLabel}`;
}
