export const COURSE_BG = '#f2fff3';
export const COURSE_GREEN = '#257d3f';
export const COURSE_TEAL = '#164744';
export const COURSE_MUTED = '#7c9585';
export const COURSE_SOFT = '#a8bdae';
export const COURSE_BORDER = '#dbeadd';
export const COURSE_TRACK = '#eef4ee';

export const COURSE_LEARNING = {
  eyebrow: 'Pulse Labs · 6 week course',
  title: 'Metabolic health foundations',
  progressLabel: 'Week 3 of 6 · 9 of 18 lessons',
  progressPercent: 50,
  continueLabel: 'Continue where you left off',
  lessonBadge: 'LESSON 10',
  lessonMeta: 'Video · 12 min',
  lessonTitle: 'Reading your glucose curve',
  lessonBody:
    'What a healthy post-meal response looks like, and the three shapes that flag a problem.',
  currentTime: '4:12',
  totalTime: '12:05',
  videoProgress: 34,
  weekLabel: 'Week 3 · Glucose & energy',
  liveTitle: 'Live Q&A · Tue 8 Sep, 6:00 PM',
  liveMeta: '45 min with Dr. Amara Osei',
  certificateTitle: 'Certificate at 100%',
  certificateBody:
    'Finish all 18 lessons and both quizzes to unlock your completion certificate.',
};

export type CourseLessonStatus = 'done' | 'active' | 'download' | 'locked';

export type CourseLesson = {
  id: string;
  title: string;
  meta: string;
  status: CourseLessonStatus;
};

export const COURSE_WEEK_LESSONS: CourseLesson[] = [
  {
    id: '1',
    title: 'Fuel timing basics',
    meta: 'Video · 9 min',
    status: 'done',
  },
  {
    id: '2',
    title: 'Reading your glucose curve',
    meta: 'In progress · 8 min left',
    status: 'active',
  },
  {
    id: '3',
    title: 'Worksheet: your week of meals',
    meta: 'Download · PDF',
    status: 'download',
  },
  {
    id: '4',
    title: 'Week 3 knowledge check',
    meta: 'Quiz · 6 questions',
    status: 'locked',
  },
];
