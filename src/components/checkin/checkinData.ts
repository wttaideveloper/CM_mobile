export const CHECKIN_BG = '#f2fff3';
export const CHECKIN_GREEN = '#257d3f';
export const CHECKIN_TEAL = '#164744';
export const CHECKIN_MUTED = '#7c9585';
export const CHECKIN_BORDER = '#dbeadd';
export const CHECKIN_TRACK = '#eef4ee';

export const CHECKIN_HEADER = {
  dateLabel: 'Sun, Jul 20',
  title: 'Daily Check-in',
  progressLabel: "Today's progress",
  goalsMet: 2,
  goalsTotal: 6,
  progressHint:
    'Log your nature-based practices below to update your HWI™ score.',
};

export type CheckinPractice = {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  goal: number;
  unitSingular: string;
  unitPlural: string;
  color: string;
  iconBg: string;
  icon: 'leaf' | 'drop' | 'sun' | 'wind' | 'moon' | 'barbell';
};

export const CHECKIN_PRACTICES: CheckinPractice[] = [
  {
    id: 'nutrition',
    title: 'Nutrition',
    subtitle: 'Whole-food meals today',
    value: 3,
    goal: 3,
    unitSingular: 'meal',
    unitPlural: 'meals',
    color: '#2f7d32',
    iconBg: '#e6f4e8',
    icon: 'leaf',
  },
  {
    id: 'water',
    title: 'Water',
    subtitle: 'Aim for 8 glasses',
    value: 6,
    goal: 8,
    unitSingular: 'glass',
    unitPlural: 'glasses',
    color: '#1e6fd9',
    iconBg: '#e8f0fe',
    icon: 'drop',
  },
  {
    id: 'sunshine',
    title: 'Sunshine',
    subtitle: 'Outdoor sunlight exposure',
    value: 0,
    goal: 20,
    unitSingular: 'min',
    unitPlural: 'min',
    color: '#e08b00',
    iconBg: '#fff4e0',
    icon: 'sun',
  },
  {
    id: 'fresh-air',
    title: 'Fresh Air',
    subtitle: 'Time in nature / open air',
    value: 1,
    goal: 2,
    unitSingular: 'walk',
    unitPlural: 'walks',
    color: '#0f8a8a',
    iconBg: '#e0f5f4',
    icon: 'wind',
  },
  {
    id: 'rest',
    title: 'Rest',
    subtitle: 'Sleep quality log',
    value: 1,
    goal: 1,
    unitSingular: 'log',
    unitPlural: 'logs',
    color: '#6b46c1',
    iconBg: '#efe9fd',
    icon: 'moon',
  },
  {
    id: 'exercise',
    title: 'Exercise',
    subtitle: 'Movement of any kind',
    value: 0,
    goal: 1,
    unitSingular: 'session',
    unitPlural: 'sessions',
    color: '#d94848',
    iconBg: '#fde8e8',
    icon: 'barbell',
  },
];

export function formatCheckinValue(
  value: number,
  singular: string,
  plural: string,
): string {
  if (singular === 'min') return `${value} min`;
  const unit = value === 1 ? singular : plural;
  return `${value} ${unit}`;
}
