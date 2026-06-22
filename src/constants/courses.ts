export const COURSE_LEVEL_FILTERS = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

export type CourseLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'All Levels';

export type CourseModule = {
  id: string;
  weekRange: string;
  title: string;
  lessonCount: number;
};

export type Course = {
  id: string;
  name: string;
  level: CourseLevel;
  instructor: string;
  enterprise: string;
  lessons: number;
  weeks: number;
  enrolled: number;
  image: string;
  detailImage: string;
  description: string;
  isFree: boolean;
  priceLabel: string;
  modules: CourseModule[];
};

const FOUNDATION_DETAIL_IMAGE =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=375&h=350&fit=crop';

export const COURSES: Course[] = [
  {
    id: 'foundation-fitness',
    name: 'Foundation Fitness Program',
    level: 'Beginner',
    instructor: 'Alex Martinez',
    enterprise: 'Pinnacle Wellness Co.',
    lessons: 24,
    weeks: 8,
    enrolled: 142,
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop',
    detailImage: FOUNDATION_DETAIL_IMAGE,
    description:
      'A comprehensive 8-week beginner program covering strength fundamentals, cardio basics, mobility work, and nutrition principles to build a solid wellness foundation.',
    isFree: true,
    priceLabel: 'Free',
    modules: [
      {
        id: 'week-1-2',
        weekRange: 'Week 1–2',
        title: 'Foundation & Mobility',
        lessonCount: 6,
      },
      {
        id: 'week-3-4',
        weekRange: 'Week 3–4',
        title: 'Strength Basics',
        lessonCount: 6,
      },
      {
        id: 'week-5-6',
        weekRange: 'Week 5–6',
        title: 'Cardio & Endurance',
        lessonCount: 6,
      },
      {
        id: 'week-7-8',
        weekRange: 'Week 7–8',
        title: 'Nutrition & Recovery',
        lessonCount: 6,
      },
    ],
  },
  {
    id: 'advanced-strength',
    name: 'Advanced Strength Training',
    level: 'Advanced',
    instructor: 'Jordan Lee',
    enterprise: 'Pinnacle Wellness Co.',
    lessons: 32,
    weeks: 12,
    enrolled: 89,
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=160&h=160&fit=crop',
    detailImage:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=375&h=350&fit=crop',
    description:
      'An advanced strength program focused on progressive overload, compound lifts, and performance tracking for experienced athletes.',
    isFree: false,
    priceLabel: '$129',
    modules: [
      {
        id: 'week-1-3',
        weekRange: 'Week 1–3',
        title: 'Power & Compound Lifts',
        lessonCount: 8,
      },
      {
        id: 'week-4-6',
        weekRange: 'Week 4–6',
        title: 'Hypertrophy Blocks',
        lessonCount: 8,
      },
      {
        id: 'week-7-9',
        weekRange: 'Week 7–9',
        title: 'Peak Strength Phase',
        lessonCount: 8,
      },
      {
        id: 'week-10-12',
        weekRange: 'Week 10–12',
        title: 'Deload & Assessment',
        lessonCount: 8,
      },
    ],
  },
  {
    id: 'mindful-movement',
    name: 'Mindful Movement',
    level: 'All Levels',
    instructor: 'Maya Patel',
    enterprise: 'Pinnacle Wellness Co.',
    lessons: 18,
    weeks: 6,
    enrolled: 210,
    image:
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=160&h=160&fit=crop',
    detailImage:
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=375&h=350&fit=crop',
    description:
      'Blend yoga, breathwork, and mindful stretching to improve mobility, reduce stress, and build body awareness at any fitness level.',
    isFree: false,
    priceLabel: '$59',
    modules: [
      {
        id: 'week-1-2-yoga',
        weekRange: 'Week 1–2',
        title: 'Breath & Alignment',
        lessonCount: 6,
      },
      {
        id: 'week-3-4-yoga',
        weekRange: 'Week 3–4',
        title: 'Flow Foundations',
        lessonCount: 6,
      },
      {
        id: 'week-5-6-yoga',
        weekRange: 'Week 5–6',
        title: 'Mindful Integration',
        lessonCount: 6,
      },
    ],
  },
];

const FILTER_MAP: Record<string, CourseLevel | null> = {
  All: null,
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
};

export function filterCourses(filter: string): Course[] {
  const level = FILTER_MAP[filter];
  if (!level) return COURSES;
  return COURSES.filter(
    (course) => course.level === level || course.level === 'All Levels',
  );
}

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id);
}
