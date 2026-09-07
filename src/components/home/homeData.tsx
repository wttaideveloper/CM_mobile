import type { ReactNode } from 'react';
import { Dimensions } from 'react-native';

import {
  CalendarDaysIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
} from '@/components/dashboard/DashboardIcons';
import { isSmallDevice } from '@/utils/responsive';

export const HOME_PRIMARY = '#1F5D4E';
export const HOME_ACCENT_GREEN = '#4CAF50';
export const HOME_TEXT_MUTED = '#6B7280';
export const HOME_TEXT_BLACK = '#111111';
export const HOME_WHITE = '#FFFFFF';

export const { width: HOME_SCREEN_WIDTH } = Dimensions.get('window');
export const HOME_H_PAD = isSmallDevice ? 16 : 20;
export const FEATURED_BANNER_HEIGHT = isSmallDevice ? 100 : 120;
export const FEATURED_BANNER_WIDTH = HOME_SCREEN_WIDTH - HOME_H_PAD * 2;

export const HOME_HEADER_ICON_SIZE = isSmallDevice ? 36 : 40;
export const HOME_HEADER_ICON_RADIUS = isSmallDevice ? 12 : 14;
export const HOME_HEADER_BADGE_SIZE = isSmallDevice ? 16 : 18;
export const HOME_HEADER_BADGE_RADIUS = HOME_HEADER_BADGE_SIZE / 2;

export const HOME_QUICK_STAT_ICON_SIZE = isSmallDevice ? 12 : 14;
export const HOME_SEARCH_ICON_SIZE = isSmallDevice ? 16 : 18;
export const HOME_BELL_ICON_SIZE = isSmallDevice ? 18 : 20;
export const HOME_CHEVRON_ICON_SIZE = isSmallDevice ? 16 : 18;
export const HOME_CATEGORY_ICON_SIZE = isSmallDevice ? 52 : 58;
export const HOME_CATEGORY_ITEM_WIDTH = isSmallDevice ? 58 : 64;
export const HOME_ENTERPRISE_AVATAR_SIZE = isSmallDevice ? 44 : 50;
export const HOME_STAT_GAP = isSmallDevice ? 6 : 8;
export const HOME_STAT_CARD_WIDTH =
  (HOME_SCREEN_WIDTH - HOME_H_PAD * 2 - HOME_STAT_GAP * 3) / 4;

export const HOME_HEADER_ARC_LEFT_SIZE = HOME_SCREEN_WIDTH * 0.35;
export const HOME_HEADER_ARC_RIGHT_SIZE = HOME_SCREEN_WIDTH * 1.12;

export const HOME_CATEGORIES = [
  { key: 'fitness', label: 'Fitness', emoji: '💪' },
  { key: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { key: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { key: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { key: 'training', label: 'Training', emoji: '🎓' },
  { key: 'massage', label: 'Massage', emoji: '💆' },
] as const;

export type HomeCategory = (typeof HOME_CATEGORIES)[number];

export const HOME_QUICK_STATS: readonly {
  key: string;
  value: string;
  label: string;
  icon: (color: string) => ReactNode;
  iconColor: string;
  iconBg: string;
}[] = [
  {
    key: 'nearby',
    value: '24',
    label: 'Nearby',
    icon: (color: string) => <MapPinIcon size={HOME_QUICK_STAT_ICON_SIZE} color={color} />,
    iconColor: HOME_PRIMARY,
    iconBg: '#EAF4EC',
  },
  {
    key: 'booked',
    value: '3',
    label: 'Booked',
    icon: (color: string) => <CalendarDaysIcon size={HOME_QUICK_STAT_ICON_SIZE} color={color} />,
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
  },
  {
    key: 'saved',
    value: '12',
    label: 'Saved',
    icon: (color: string) => <HeartIcon size={HOME_QUICK_STAT_ICON_SIZE} color={color} />,
    iconColor: '#E11D48',
    iconBg: '#FFF1F2',
  },
  {
    key: 'reviews',
    value: '8',
    label: 'Reviews',
    icon: (color: string) => <StarIcon size={HOME_QUICK_STAT_ICON_SIZE} color={color} />,
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
  },
];

export function getHomeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
