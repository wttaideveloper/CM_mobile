export type McqOption = {
  id: string;
  label: string;
};

export type McqQuestion = {
  id: string;
  prompt: string;
  options: McqOption[];
  correctOptionId: string;
};

export type TrainingExam = {
  id: string;
  title: string;
  subtitle: string;
  questionCount: number;
  passPercent: number;
  questions: McqQuestion[];
};

export type LessonKind = 'video' | 'live' | 'venue' | 'exam';

export type TrainingLesson = {
  id: string;
  kind: LessonKind;
  title: string;
  duration: string;
  /** Short description under the row */
  detail: string;
  /** Thumbnail / cover for the lesson */
  imageUrl?: string;
  /** Video lessons */
  videoUrl?: string;
  /** Live Zoom / Meet */
  joinUrl?: string;
  joinMeta?: string;
  /** Physical venue / QR check-in */
  venue?: string;
  address?: string;
  passCode?: string;
  checkInWindow?: string;
  /** Exam lessons */
  examId?: string;
  /** From content API */
  locked?: boolean;
  apiCompleted?: boolean;
};

export type TrainingDay = {
  id: string;
  dayLabel: string;
  title: string;
  summary: string;
  /** Shown when all content lessons in this day are done */
  unlockHint: string;
  lessons: TrainingLesson[];
};

export type TrainingDeliveryMode = 'Virtual' | 'Hybrid' | 'Physical';

export type TrainingProgressPath = {
  trainingId: string;
  title: string;
  vendor: string;
  instructor: string;
  bannerUrl: string;
  deliveryMode: TrainingDeliveryMode;
  days: TrainingDay[];
  exams: Record<string, TrainingExam>;
};

const FOUNDATIONS_EXAM: TrainingExam = {
  id: 'exam-foundations',
  title: 'Checkpoint · Foundations',
  subtitle: 'MCQ exam · unlocks after live Zoom',
  questionCount: 3,
  passPercent: 67,
  questions: [
    {
      id: 'q1',
      prompt: 'Which best describes metabolic health foundations?',
      options: [
        { id: 'a', label: 'Only calorie counting' },
        { id: 'b', label: 'Energy balance plus nutrient quality & signals' },
        { id: 'c', label: 'Fasting every day' },
        { id: 'd', label: 'Skipping strength work' },
      ],
      correctOptionId: 'b',
    },
    {
      id: 'q2',
      prompt: 'A useful baseline signal for this cohort is:',
      options: [
        { id: 'a', label: 'Wearable recovery + labs context' },
        { id: 'b', label: 'Social media trends' },
        { id: 'c', label: 'One weigh-in only' },
        { id: 'd', label: 'Ignoring sleep' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'q3',
      prompt: 'Session notes are most useful when they:',
      options: [
        { id: 'a', label: 'Stay generic for everyone' },
        { id: 'b', label: 'Capture personal actions for the week' },
        { id: 'c', label: 'Replace attending live sessions' },
        { id: 'd', label: 'Avoid measurable goals' },
      ],
      correctOptionId: 'b',
    },
  ],
};

const NUTRITION_EXAM: TrainingExam = {
  id: 'exam-nutrition',
  title: 'Checkpoint · Nutrition timing',
  subtitle: 'MCQ exam · unlocks after Day 2 lessons',
  questionCount: 3,
  passPercent: 67,
  questions: [
    {
      id: 'nq1',
      prompt: 'Protein distribution across the day mainly helps with:',
      options: [
        { id: 'a', label: 'Muscle repair and satiety consistency' },
        { id: 'b', label: 'Drinking more coffee' },
        { id: 'c', label: 'Skipping breakfast forever' },
        { id: 'd', label: 'Avoiding vegetables' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'nq2',
      prompt: 'A glucose-friendly plate usually includes:',
      options: [
        { id: 'a', label: 'Only refined carbs' },
        { id: 'b', label: 'Protein + fiber + controlled starch' },
        { id: 'c', label: 'Sugary drinks first' },
        { id: 'd', label: 'No vegetables' },
      ],
      correctOptionId: 'b',
    },
    {
      id: 'nq3',
      prompt: 'Practical grocery swaps are meant to:',
      options: [
        { id: 'a', label: 'Make habits easier without perfection' },
        { id: 'b', label: 'Require gourmet cooking daily' },
        { id: 'c', label: 'Eliminate all carbs permanently' },
        { id: 'd', label: 'Ignore budget and time' },
      ],
      correctOptionId: 'a',
    },
  ],
};

const MID_COURSE_EXAM: TrainingExam = {
  id: 'exam-mid',
  title: 'Mid-course MCQ exam',
  subtitle: 'Final checkpoint for this block',
  questionCount: 2,
  passPercent: 50,
  questions: [
    {
      id: 'mq1',
      prompt: 'Post-meal walking mainly supports:',
      options: [
        { id: 'a', label: 'Glucose management after eating' },
        { id: 'b', label: 'Replacing all sleep' },
        { id: 'c', label: 'Avoiding hydration' },
        { id: 'd', label: 'Skipping strength forever' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 'mq2',
      prompt: 'A day is complete in this program when you:',
      options: [
        { id: 'a', label: 'Finish videos / live and submit the exam' },
        { id: 'b', label: 'Only open the app once' },
        { id: 'c', label: 'Skip all check-ins' },
        { id: 'd', label: 'Ignore trainer notes' },
      ],
      correctOptionId: 'a',
    },
  ],
};

const DEFAULT_EXAMS: Record<string, TrainingExam> = {
  [FOUNDATIONS_EXAM.id]: FOUNDATIONS_EXAM,
  [NUTRITION_EXAM.id]: NUTRITION_EXAM,
  [MID_COURSE_EXAM.id]: MID_COURSE_EXAM,
};

function buildMetabolicDays(): TrainingDay[] {
  return [
    {
      id: 'day1',
      dayLabel: 'Session 1',
      title: 'Foundations · live Zoom',
      summary: '1 live Zoom · 1 exam',
      unlockHint: 'Join Zoom, then take the session quiz',
      lessons: [
        {
          id: 'd1-live',
          kind: 'live',
          title: 'Live cohort kickoff',
          duration: 'Tue 6:30–8:00 PM',
          detail: 'Online live · Zoom join below',
          imageUrl:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
          joinUrl: 'https://zoom.us/j/884221910',
          joinMeta: 'Meeting ID 884 221 910 · Passcode 4821',
        },
        {
          id: 'd1-exam',
          kind: 'exam',
          title: FOUNDATIONS_EXAM.title,
          duration: '3 questions',
          detail: 'Unlocks after you join the live Zoom',
          imageUrl:
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
          examId: FOUNDATIONS_EXAM.id,
        },
      ],
    },
    {
      id: 'day2',
      dayLabel: 'Session 2',
      title: 'Nutrition timing · live Zoom',
      summary: '1 live Zoom · 1 exam',
      unlockHint: 'Join this week’s Zoom, then finish the quiz',
      lessons: [
        {
          id: 'd2-live',
          kind: 'live',
          title: 'Live Q&A · nutrition timing',
          duration: 'Tue 6:30–7:45 PM',
          detail: 'Online live · Zoom join below',
          imageUrl:
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
          joinUrl: 'https://zoom.us/j/884221911',
          joinMeta: 'Meeting ID 884 221 911 · Passcode 4821',
        },
        {
          id: 'd2-exam',
          kind: 'exam',
          title: NUTRITION_EXAM.title,
          duration: '3 questions',
          detail: 'Unlocks after the live Zoom',
          imageUrl:
            'https://images.unsplash.com/photo-1456513080080-7e3f5d7d0b0b?auto=format&fit=crop&w=800&q=80',
          examId: NUTRITION_EXAM.id,
        },
      ],
    },
    {
      id: 'day3',
      dayLabel: 'Session 3',
      title: 'Movement & glucose · live Zoom',
      summary: '1 live Zoom · 1 exam',
      unlockHint: 'Join Zoom, then take the mid-course quiz',
      lessons: [
        {
          id: 'd3-live',
          kind: 'live',
          title: 'Live demo · movement levers',
          duration: 'Tue 6:30–7:50 PM',
          detail: 'Online live · Zoom join below',
          imageUrl:
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
          joinUrl: 'https://zoom.us/j/884221912',
          joinMeta: 'Meeting ID 884 221 912 · Passcode 4821',
        },
        {
          id: 'd3-exam',
          kind: 'exam',
          title: MID_COURSE_EXAM.title,
          duration: '2 questions',
          detail: 'Unlocks after the live Zoom',
          imageUrl:
            'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80',
          examId: MID_COURSE_EXAM.id,
        },
      ],
    },
  ];
}

const PATH_BY_TRAINING: Record<string, TrainingProgressPath> = {
  metabolic: {
    trainingId: 'metabolic',
    title: 'Metabolic health foundations',
    vendor: 'Pulse Labs',
    instructor: 'Dr. Maya Chen',
    bannerUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    deliveryMode: 'Virtual',
    days: buildMetabolicDays(),
    exams: DEFAULT_EXAMS,
  },
  breathwork: {
    trainingId: 'breathwork',
    title: 'Breathwork & recovery lab',
    vendor: 'Restwell Studio',
    instructor: 'Jordan Lee',
    bannerUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    deliveryMode: 'Physical',
    days: [
      {
        id: 'b-day1',
        dayLabel: 'Session 1',
        title: 'Studio arrival & QR check-in',
        summary: 'Venue only · QR pass · no Zoom',
        unlockHint: 'Check in with QR at the door, then take the safety quiz',
        lessons: [
          {
            id: 'b-venue-1',
            kind: 'venue',
            title: 'Restwell Studio · Room B check-in',
            duration: 'Check-in window',
            detail: 'Show QR pass at the door · physical venue',
            imageUrl:
              'https://images.unsplash.com/photo-1599901860904-17e6ede5256a?auto=format&fit=crop&w=800&q=80',
            venue: 'Restwell Studio · Room B',
            address: '214 Oak Street, Suite 2',
            passCode: 'BW-55102',
            checkInWindow: 'Opens 8:40 AM · closes 9:20 AM',
          },
          {
            id: 'b-exam',
            kind: 'exam',
            title: 'Safety & technique MCQ',
            duration: '3 questions',
            detail: 'Unlocks after venue check-in',
            imageUrl:
              'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
            examId: FOUNDATIONS_EXAM.id,
          },
        ],
      },
      {
        id: 'b-day2',
        dayLabel: 'Session 2',
        title: 'Floor lab · breath practice',
        summary: 'In-studio practice · QR again if needed',
        unlockHint: 'Complete the floor lab QR, then finish the day quiz',
        lessons: [
          {
            id: 'b-venue-2',
            kind: 'venue',
            title: 'Floor lab · QR pass',
            duration: '90 min',
            detail: 'Physical venue · trainer-led on the floor',
            imageUrl:
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
            venue: 'Restwell Studio · Room B',
            address: '214 Oak Street, Suite 2',
            passCode: 'BW-55102-S2',
            checkInWindow: 'Opens 8:50 AM · closes 9:15 AM',
          },
          {
            id: 'b-exam-2',
            kind: 'exam',
            title: 'Studio practice checkpoint',
            duration: '2 questions',
            detail: 'Unlocks after floor lab check-in',
            imageUrl:
              'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80',
            examId: MID_COURSE_EXAM.id,
          },
        ],
      },
    ],
    exams: {
      [FOUNDATIONS_EXAM.id]: {
        ...FOUNDATIONS_EXAM,
        title: 'Safety & technique MCQ',
      },
      [MID_COURSE_EXAM.id]: {
        ...MID_COURSE_EXAM,
        title: 'Studio practice checkpoint',
      },
    },
  },
  'hybrid-strength': {
    trainingId: 'hybrid-strength',
    title: 'Hybrid strength reset',
    vendor: 'Movement Collective',
    instructor: 'Alex Rivera',
    bannerUrl:
      'https://images.unsplash.com/photo-1517836352931-b489deaec60d?auto=format&fit=crop&w=1200&q=80',
    deliveryMode: 'Hybrid',
    days: [
      {
        id: 'h-day1',
        dayLabel: 'Day 1',
        title: 'Online kickoff · live Zoom',
        summary: 'Virtual · 1 Zoom · 1 exam',
        unlockHint: 'Join Zoom, then take the online quiz',
        lessons: [
          {
            id: 'h-live-1',
            kind: 'live',
            title: 'Live Zoom kickoff',
            duration: 'Mon 7:00–8:00 PM',
            detail: 'Online live · Zoom join below',
            imageUrl:
              'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
            joinUrl: 'https://zoom.us/j/773019901',
            joinMeta: 'Meeting ID 773 019 901 · Passcode HYBRID1',
          },
          {
            id: 'h-exam-1',
            kind: 'exam',
            title: 'Online kickoff quiz',
            duration: '3 questions',
            detail: 'Unlocks after you join Zoom',
            examId: FOUNDATIONS_EXAM.id,
          },
        ],
      },
      {
        id: 'h-day2',
        dayLabel: 'Day 2',
        title: 'Venue floor lab',
        summary: 'Physical · QR check-in at Court 3',
        unlockHint: 'Check in with QR at the venue, then take the floor quiz',
        lessons: [
          {
            id: 'h-venue-1',
            kind: 'venue',
            title: 'Court 3 · QR check-in',
            duration: '90 min',
            detail: 'Physical venue day · show QR pass',
            imageUrl:
              'https://images.unsplash.com/photo-1517836352931-b489deaec60d?auto=format&fit=crop&w=800&q=80',
            venue: 'Movement Collective · Court 3',
            address: '88 Harbor Ave',
            passCode: 'HS-77301-D2',
            checkInWindow: 'Opens 6:10 PM · closes 6:50 PM',
          },
          {
            id: 'h-exam-2',
            kind: 'exam',
            title: 'Floor lab quiz',
            duration: '3 questions',
            detail: 'Unlocks after QR check-in',
            examId: NUTRITION_EXAM.id,
          },
        ],
      },
      {
        id: 'h-day3',
        dayLabel: 'Day 3',
        title: 'Recovery live + wrap',
        summary: 'Virtual Zoom · then final quiz',
        unlockHint: 'Join Zoom recovery, then submit the final quiz',
        lessons: [
          {
            id: 'h-live-2',
            kind: 'live',
            title: 'Recovery Zoom live',
            duration: '45 min',
            detail: 'Online live session',
            imageUrl:
              'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
            joinUrl: 'https://zoom.us/j/773019903',
            joinMeta: 'Meeting ID 773 019 903 · Passcode HYBRID3',
          },
          {
            id: 'h-exam-3',
            kind: 'exam',
            title: 'Hybrid wrap quiz',
            duration: '2 questions',
            detail: 'Unlocks after Zoom',
            examId: MID_COURSE_EXAM.id,
          },
        ],
      },
    ],
    exams: DEFAULT_EXAMS,
  },
};

/** Used by admin Sessions screen as curriculum preview. */
export const TRAINING_SESSIONS_PROGRESS_PATH = PATH_BY_TRAINING.metabolic;

export function getTrainingProgressPath(
  trainingId?: string | null,
): TrainingProgressPath {
  if (trainingId && PATH_BY_TRAINING[trainingId]) {
    return PATH_BY_TRAINING[trainingId];
  }
  return PATH_BY_TRAINING.metabolic;
}

export function getTrainingExam(
  trainingId: string | null | undefined,
  examId: string | null | undefined,
): TrainingExam | null {
  if (!examId) return null;
  const path = getTrainingProgressPath(trainingId);
  return path.exams[examId] ?? DEFAULT_EXAMS[examId] ?? null;
}

export function flattenLessons(path: TrainingProgressPath): TrainingLesson[] {
  return path.days.flatMap((day) => day.lessons);
}

export function getContentLessons(day: TrainingDay): TrainingLesson[] {
  return day.lessons.filter((lesson) => lesson.kind !== 'exam');
}

export function countTrackableLessons(path: TrainingProgressPath): number {
  return flattenLessons(path).length;
}

/** Legacy helpers for older curriculum preview UI. */
export type ProgressTimelineItem =
  | {
      kind: 'session';
      id: string;
      title: string;
      meta: string;
      concepts: string[];
    }
  | {
      kind: 'exam';
      id: string;
      examId: string;
      title: string;
      meta: string;
    }
  | {
      kind: 'milestone';
      id: string;
      milestoneId: string;
      title: string;
      meta: string;
    };

export function pathToTimeline(
  path: TrainingProgressPath,
): ProgressTimelineItem[] {
  const items: ProgressTimelineItem[] = [];
  for (const day of path.days) {
    items.push({
      kind: 'session',
      id: day.id,
      title: `${day.dayLabel} · ${day.title}`,
      meta: day.summary,
      concepts: day.lessons
        .filter((l) => l.kind !== 'exam')
        .map((l) => {
          const prefix =
            l.kind === 'live'
              ? 'Zoom · '
              : l.kind === 'venue'
                ? 'QR · '
                : l.kind === 'video'
                  ? 'Video · '
                  : '';
          return `${prefix}${l.title}`;
        }),
    });
    for (const lesson of day.lessons) {
      if (lesson.kind === 'exam' && lesson.examId) {
        items.push({
          kind: 'exam',
          id: lesson.id,
          examId: lesson.examId,
          title: lesson.title,
          meta: lesson.detail,
        });
      }
    }
  }
  return items;
}
