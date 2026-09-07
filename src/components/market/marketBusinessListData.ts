import type { MarketBusiness } from '@/components/market/marketDashboardData';

export const BIZ_LIST_BG = '#f2fff3';
export const BIZ_LIST_GREEN = '#257d3f';
export const BIZ_LIST_TEAL = '#164744';
export const BIZ_LIST_MUTED = '#7c9585';
export const BIZ_LIST_SOFT = '#a8bdae';
export const BIZ_LIST_BORDER = '#dbeadd';

export const BIZ_LIST_SORTS = ['Closest', 'Top rated', 'Verified'] as const;

export const FEATURED_BUSINESSES_ALL: MarketBusiness[] = [
  {
    id: 'vr',
    initials: 'VR',
    name: 'Verdant Roots Kitchen',
    verified: true,
    subtitle: 'Plant-based meal prep · Nutrition',
    rating: '4.8',
    reviews: '214 reviews',
    meta: '2.1 mi',
    avatarBg: '#e6f4e8',
    avatarColor: '#257d3f',
  },
  {
    id: 'pl',
    initials: 'PL',
    name: 'Pulse Labs',
    subtitle: 'Wearables & biomarker kits · Health tech',
    rating: '4.6',
    reviews: '88 reviews',
    meta: 'Online',
    avatarBg: '#eaf1ff',
    avatarColor: '#3c63c8',
  },
  {
    id: 'mb',
    initials: 'MB',
    name: 'Meridian Barbell',
    verified: true,
    subtitle: 'Strength coaching · Movement',
    rating: '4.7',
    reviews: '96 reviews',
    meta: '2.6 mi',
    avatarBg: '#eaf1ff',
    avatarColor: '#3c63c8',
  },
  {
    id: 'rs',
    initials: 'RS',
    name: 'Restwell Studio',
    verified: true,
    subtitle: 'Sleep & recovery · Rest',
    rating: '4.7',
    reviews: '128 reviews',
    meta: '0.8 mi',
    avatarBg: '#fdf0e3',
    avatarColor: '#c07c27',
  },
  {
    id: 'ms',
    initials: 'MS',
    name: 'Motion Studio East',
    subtitle: 'Mobility & breathwork · Movement',
    rating: '4.9',
    reviews: '156 reviews',
    meta: '1.2 mi',
    avatarBg: '#eaf1ff',
    avatarColor: '#3c63c8',
  },
  {
    id: 'gb',
    initials: 'GB',
    name: 'Green Bowl Co.',
    subtitle: 'Macro-balanced bowls · Nutrition',
    rating: '4.5',
    reviews: '73 reviews',
    meta: '3.4 mi',
    avatarBg: '#eef7ef',
    avatarColor: '#2f7d32',
  },
  {
    id: 'hl',
    initials: 'HL',
    name: 'Harbor Light Labs',
    subtitle: 'At-home biomarker kits · Health tech',
    rating: '4.4',
    reviews: '51 reviews',
    meta: 'Online',
    avatarBg: '#f2e9fb',
    avatarColor: '#8352c0',
  },
  {
    id: 'sc',
    initials: 'SC',
    name: 'Sunrise Circle Collective',
    subtitle: 'Group walks & habits · Recovery',
    rating: '4.8',
    reviews: '201 reviews',
    meta: '1.9 mi',
    avatarBg: '#e6f4e8',
    avatarColor: '#257d3f',
  },
];
