import type { HomePillar } from '@/components/home/homeDashboardData';
import {
  HOME_DASH_BG,
  HOME_DASH_BORDER,
  HOME_DASH_GREEN,
  HOME_DASH_LINK,
  HOME_DASH_MUTED,
  HOME_DASH_TEAL,
  HOME_DASH_TRACK,
  HOME_PILLARS,
} from '@/components/home/homeDashboardData';

export {
  HOME_DASH_BG,
  HOME_DASH_BORDER,
  HOME_DASH_GREEN,
  HOME_DASH_LINK,
  HOME_DASH_MUTED,
  HOME_DASH_TEAL,
  HOME_DASH_TRACK,
};

export const HWI_SCORE = 86;
export const HWI_WEEK_DELTA = '+4 pts this week';

export type HwiTrendRange = '7D' | '30D';

export type HwiTrendBar = {
  label: string;
  height: number;
  active?: boolean;
};

export const HWI_TREND_7D: HwiTrendBar[] = [
  { label: 'M', height: 58 },
  { label: 'T', height: 66 },
  { label: 'W', height: 60 },
  { label: 'T', height: 74 },
  { label: 'F', height: 62 },
  { label: 'S', height: 82 },
  { label: 'S', height: 92, active: true },
];

export const HWI_TREND_30D: HwiTrendBar[] = [
  { label: 'W1', height: 54 },
  { label: 'W2', height: 70 },
  { label: 'W3', height: 62 },
  { label: 'W4', height: 88, active: true },
];

export const HWI_TREND_STATS = {
  lowest: 78,
  average: 83,
  highest: 88,
};

export type HwiBreakdownPillar = HomePillar & {
  scoreColor: string;
  barColor: string;
};

export const HWI_BREAKDOWN: HwiBreakdownPillar[] = HOME_PILLARS.map((pillar) => ({
  ...pillar,
  scoreColor: pillar.score < 70 ? '#d94848' : '#2f7d32',
  barColor: pillar.color,
}));

export type HwiRecommendation = {
  id: string;
  title: string;
  body: string;
  icon: 'sun' | 'dumbbell';
  iconBg: string;
  iconColor: string;
};

export const HWI_RECOMMENDATIONS: HwiRecommendation[] = [
  {
    id: 'sunshine',
    title: 'Boost your Sunshine score',
    body: 'Try 20 min of outdoor exposure today to improve your score by up to 8 pts.',
    icon: 'sun',
    iconBg: '#fff4e0',
    iconColor: '#e08b00',
  },
  {
    id: 'exercise',
    title: 'Complete your Exercise practice',
    body: 'Your 60-min walk is still pending. Completing it can add 6 pts to your HWI™.',
    icon: 'dumbbell',
    iconBg: '#fde8e8',
    iconColor: '#d94848',
  },
];
