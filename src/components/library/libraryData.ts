export const LIB_BG = '#f2fff3';
export const LIB_GREEN = '#257d3f';
export const LIB_TEAL = '#164744';
export const LIB_MUTED = '#7c9585';
export const LIB_SOFT = '#a8bdae';
export const LIB_BORDER = '#dbeadd';
export const LIB_BODY = '#4c6b58';

export type LibraryItem = {
  id: string;
  kind: 'Article';
  kindColor: string;
  kindBg: string;
  title: string;
  author: string;
  meta: string;
  mediaBg: string;
};

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'fibre',
    kind: 'Article',
    kindColor: '#2f7d32',
    kindBg: '#e6f4e8',
    title: 'Why fibre is the foundation of gut health',
    author: 'Invigorate Health',
    meta: '4 min read · Nutrition',
    mediaBg: '#e0f2e9',
  },
  {
    id: 'beans',
    kind: 'Article',
    kindColor: '#2f7d32',
    kindBg: '#e6f4e8',
    title: 'The Blue Zones Kitchen',
    author: 'Dan Buettner',
    meta: 'Chapter 4 · 8 min read',
    mediaBg: '#e6f4e8',
  },
  {
    id: 'sleep-article',
    kind: 'Article',
    kindColor: '#2f7d32',
    kindBg: '#e6f4e8',
    title: 'Why late meals disrupt Rest',
    author: 'Invigorate Health',
    meta: '5 min read · Rest',
    mediaBg: '#eef7ef',
  },
  {
    id: 'movement-article',
    kind: 'Article',
    kindColor: '#2f7d32',
    kindBg: '#e6f4e8',
    title: 'Ten-minute walks after meals',
    author: 'Invigorate Health',
    meta: '3 min read · Movement',
    mediaBg: '#e0f2e9',
  },
];

export type ReadingContent = {
  id: string;
  eyebrow: string;
  title: string;
  progress: string;
  kind: string;
  remaining: string;
  headline: string;
  quote: string;
  body: string[];
  practiceLabel: string;
  practice: string;
  practiceCta: string;
};

export const READING_CONTENT: Record<string, ReadingContent> = {
  fibre: {
    id: 'fibre',
    eyebrow: 'Daily Insight · Nutrition',
    title: 'Gut Health Essentials',
    progress: '0%',
    kind: 'Article',
    remaining: '4 min read',
    headline: 'Why fibre is the foundation of gut health',
    quote:
      '“Diverse fibre feeds a diverse microbiome — and that shows up in energy, mood and metabolic markers.”',
    body: [
      'Most people under-eat fibre by half. Raising intake slowly with beans, oats, fruit and vegetables supports satiety and steadies blood sugar.',
      'Pair fibre with water and give your gut a few days to adjust. Log Nutrition after meals so your HWI™ can reflect the change.',
    ],
    practiceLabel: 'PRACTICE THIS WEEK',
    practice:
      'Add one high-fibre food to lunch each day and note how afternoon energy feels.',
    practiceCta: 'Add to Nutrition log',
  },
  beans: {
    id: 'beans',
    eyebrow: 'Chapter 4 · Beans are the cornerstone',
    title: 'The Blue Zones Kitchen',
    progress: '36%',
    kind: 'Article',
    remaining: '8 min read',
    headline:
      'Why a cup of beans a day is the closest thing to a longevity drug',
    quote:
      '“People who eat beans daily live an estimated four years longer than people who do not.”',
    body: [
      'Across Blue Zones, beans are a daily staple — inexpensive, filling and packed with fibre and plant protein.',
      'Start with a half cup and build up. Season simply and keep a batch ready for weeknight meals.',
    ],
    practiceLabel: 'PRACTICE THIS WEEK',
    practice:
      'Cook one pot of beans on Sunday and eat from it three times before Wednesday.',
    practiceCta: 'Add to Nutrition log',
  },
  'sleep-article': {
    id: 'sleep-article',
    eyebrow: 'Rest · Daily Insight',
    title: 'Rest Essentials',
    progress: '0%',
    kind: 'Article',
    remaining: '5 min read',
    headline: 'Why late meals disrupt Rest',
    quote:
      '“Finishing dinner earlier is one of the simplest levers for deeper overnight recovery.”',
    body: [
      'Late meals keep digestion active when the body wants to wind down, which can lighten sleep and raise next-day Rest strain.',
      'Try closing the kitchen three hours before bed this week and log Rest each morning.',
    ],
    practiceLabel: 'PRACTICE THIS WEEK',
    practice: 'Finish dinner three hours before bed on four nights.',
    practiceCta: 'Add to Rest log',
  },
  'movement-article': {
    id: 'movement-article',
    eyebrow: 'Movement · Daily Insight',
    title: 'Movement Essentials',
    progress: '0%',
    kind: 'Article',
    remaining: '3 min read',
    headline: 'Ten-minute walks after meals',
    quote:
      '“A short post-meal walk is a quiet way to steady energy without a formal workout.”',
    body: [
      'Even ten minutes of easy walking after lunch or dinner can support glucose response and help Movement stay consistent.',
      'Keep shoes by the door and treat the walk as part of the meal, not an extra chore.',
    ],
    practiceLabel: 'PRACTICE THIS WEEK',
    practice: 'Take a ten-minute walk after two meals each day.',
    practiceCta: 'Add to Movement log',
  },
};

export const DEFAULT_READING_ID = 'fibre';

export function getReadingContent(id?: string | string[]): ReadingContent {
  const key = Array.isArray(id) ? id[0] : id;
  if (key && READING_CONTENT[key]) return READING_CONTENT[key];
  return READING_CONTENT[DEFAULT_READING_ID];
}

export const LISTENING_CONTENT = {
  eyebrow: 'Fresh Air · Guided session',
  title: 'Now Listening',
  track: 'Breathing for Fresh Air',
  artist: 'Coach Lena Ortiz · Session 2 of 8',
  elapsed: '4:12',
  remaining: '-7:48',
  progress: 0.35,
};

export const WATCHING_CONTENT = {
  eyebrow: 'IH Talks · Rest',
  title: 'Now Watching',
  track: 'Rest is a skill, not a luxury',
  meta: '12:58 / 18:04',
  progress: 0.72,
};
