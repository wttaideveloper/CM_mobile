import { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import {
  CourseCheckIcon,
} from '@/components/trainingsAndCourses/CourseLearningIcons';
import { MarketCheckoutLockIcon } from '@/components/market/MarketCheckoutIcons';
import {
  TRAINING_GREEN,
  TRAINING_MUTED,
} from '@/components/trainingsAndCourses/trainingData';
import {
  type LessonKind,
  type TrainingLesson,
  type TrainingProgressPath,
} from '@/components/trainingsAndCourses/trainingProgressData';
import {
  asPlainText,
  isPlayableVideoUrl,
  isYoutubeUrl,
} from '@/utils/trainingLessonMedia';

import { styles } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.styles';

export const FALLBACK_BANNER = '';

export const LESSON_TYPE_META: Record<
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

export function isStickyCourseVideo(lesson: TrainingLesson): boolean {
  const url = asPlainText(lesson.videoUrl);
  if (!url || !isPlayableVideoUrl(url)) return false;
  if (lesson.kind === 'youtube' || isYoutubeUrl(url)) return false;
  return lesson.kind === 'video';
}

export function useIosKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    const show = Keyboard.addListener('keyboardWillShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardWillHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

/** Keyboard height for scroll-into-view (both platforms). */
export function useKeyboardBottomInset() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) => {
      setHeight(event.endCoordinates?.height ?? 0);
    });
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

export function LessonDownloadIcon({ color }: { color: string }) {
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

export function CurriculumChevron({ expanded }: { expanded: boolean }) {
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

export function LessonTypeIcon({
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

export function LessonStatusIcon({
  done,
  locked,
  disabled = false,
}: {
  done: boolean;
  locked: boolean;
  disabled?: boolean;
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
  return (
    <View style={[styles.statusOpen, disabled && styles.statusOpenDisabled]} />
  );
}

export function loadingPathFor(id?: string): TrainingProgressPath {
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

export const EMPTY_BUCKET = {
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

