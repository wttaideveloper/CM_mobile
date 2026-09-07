export const HOME_DASH_BG = '#f2fff3';
export const HOME_DASH_GREEN = '#257d3f';
export const HOME_DASH_TEAL = '#164744';
export const HOME_DASH_MUTED = '#7c9585';
export const HOME_DASH_LINK = '#368849';
export const HOME_DASH_BORDER = '#dbeadd';
export const HOME_DASH_TRACK = '#eef4ee';

export type HomeQuickMetric = {
  id: string;
  value: string;
  unit: string;
  label: string;
  iconBg: string;
  iconColor: string;
  icon: 'flame' | 'trend' | 'bolt' | 'heart';
};

export type HomePillar = {
  id: string;
  title: string;
  score: number;
  detail: string;
  delta: string;
  deltaPositive: boolean;
  color: string;
  iconBg: string;
  icon: 'leaf' | 'drop' | 'sun' | 'wind' | 'moon' | 'dumbbell';
};

export const HOME_QUICK_METRICS: HomeQuickMetric[] = [
  {
    id: 'streak',
    value: '80',
    unit: 'days',
    label: 'Active Streak',
    iconBg: '#fde8e8',
    iconColor: '#d94848',
    icon: 'flame',
  },
  {
    id: 'weekly',
    value: '83',
    unit: 'HWI™',
    label: 'Weekly Avg',
    iconBg: '#e6f4e8',
    iconColor: '#2f7d32',
    icon: 'trend',
  },
  {
    id: 'calories',
    value: '1,840',
    unit: 'kcal',
    label: 'Calories',
    iconBg: '#efe9fd',
    iconColor: '#6b46c1',
    icon: 'bolt',
  },
  {
    id: 'heart',
    value: '68',
    unit: 'bpm',
    label: 'Heart Rate',
    iconBg: '#e8f0fe',
    iconColor: '#1e6fd9',
    icon: 'heart',
  },
];

export const HOME_PILLARS: HomePillar[] = [
  {
    id: 'nutrition',
    title: 'Nutrition',
    score: 88,
    detail: 'Meals logged',
    delta: '+3',
    deltaPositive: true,
    color: '#2f7d32',
    iconBg: '#e6f4e8',
    icon: 'leaf',
  },
  {
    id: 'water',
    title: 'Water',
    score: 75,
    detail: '6 of 8 glasses',
    delta: '+1',
    deltaPositive: true,
    color: '#1e6fd9',
    iconBg: '#e8f0fe',
    icon: 'drop',
  },
  {
    id: 'sunshine',
    title: 'Sunshine',
    score: 60,
    detail: '0 min today',
    delta: '−5',
    deltaPositive: false,
    color: '#e08b00',
    iconBg: '#fff4e0',
    icon: 'sun',
  },
  {
    id: 'fresh-air',
    title: 'Fresh Air',
    score: 78,
    detail: 'Walk logged',
    delta: '+2',
    deltaPositive: true,
    color: '#0f8a8a',
    iconBg: '#e0f5f4',
    icon: 'wind',
  },
  {
    id: 'rest',
    title: 'Rest',
    score: 85,
    detail: '7h 12m last night',
    delta: '+2',
    deltaPositive: true,
    color: '#6b46c1',
    iconBg: '#efe9fd',
    icon: 'moon',
  },
  {
    id: 'exercise',
    title: 'Exercise',
    score: 72,
    detail: '60 min pending',
    delta: '−2',
    deltaPositive: false,
    color: '#d94848',
    iconBg: '#fde8e8',
    icon: 'dumbbell',
  },
];

export const HOME_STREAK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export const HOME_DAILY_INSIGHT = {
  title: 'Why fibre is the foundation of gut health',
  meta: 'Evidence-based · 4 min read',
  tag: 'Nutrition',
};

export function getHomeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
