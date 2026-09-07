export const MARKET_BG = '#f2fff3';
export const MARKET_GREEN = '#257d3f';
export const MARKET_TEAL = '#164744';
export const MARKET_MUTED = '#7c9585';
export const MARKET_BORDER = '#dbeadd';
export const MARKET_SOFT = '#a8bdae';

export const MARKET_FILTERS = [
  'All',
  'Businesses',
  'Products',
  'Services',
  'Events',
] as const;

export type MarketPillar = {
  id: string;
  title: string;
  bg: string;
  color: string;
  icon: 'heart' | 'barbell' | 'sun' | 'flask';
};

export const MARKET_PILLARS: MarketPillar[] = [
  {
    id: 'nutrition',
    title: 'Nutrition',
    bg: '#e6f4e8',
    color: '#257d3f',
    icon: 'heart',
  },
  {
    id: 'movement',
    title: 'Movement',
    bg: '#eaf1ff',
    color: '#3c63c8',
    icon: 'barbell',
  },
  {
    id: 'recovery',
    title: 'Recovery',
    bg: '#fdf0e3',
    color: '#c07c27',
    icon: 'sun',
  },
  {
    id: 'health-tech',
    title: 'Health tech',
    bg: '#f2e9fb',
    color: '#8352c0',
    icon: 'flask',
  },
];

export type MarketBusiness = {
  id: string;
  initials: string;
  name: string;
  verified?: boolean;
  subtitle: string;
  rating: string;
  reviews: string;
  meta: string;
  avatarBg: string;
  avatarColor: string;
};

export const MARKET_BUSINESSES: MarketBusiness[] = [
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
];

export type MarketOffer = {
  id: string;
  kind: 'PRODUCT' | 'SERVICE';
  kindColor: string;
  kindBg: string;
  title: string;
  vendor: string;
  price: string;
  priceSuffix?: string;
  mediaBg: string;
  iconColor: string;
  icon: 'bag' | 'user';
};

export const MARKET_OFFERS: MarketOffer[] = [
  {
    id: 'greens',
    kind: 'PRODUCT',
    kindColor: '#257d3f',
    kindBg: '#e6f4e8',
    title: 'Weekly greens box',
    vendor: 'Verdant Roots',
    price: '$64',
    priceSuffix: '/wk',
    mediaBg: '#e6f4e8',
    iconColor: '#257d3f',
    icon: 'bag',
  },
  {
    id: 'sleep',
    kind: 'SERVICE',
    kindColor: '#8352c0',
    kindBg: '#f2e9fb',
    title: 'Sleep coaching, 6 wks',
    vendor: 'Restwell Studio',
    price: '$390',
    mediaBg: '#f2e9fb',
    iconColor: '#8352c0',
    icon: 'user',
  },
];

export type MarketEventItem = {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  when: string;
  title: string;
  detail: string;
  sideTop: string;
  sideBottom: string;
  sideBg: string;
  sideTopColor: string;
  sideBottomColor: string;
};

export const MARKET_EVENTS: MarketEventItem[] = [
  {
    id: 'sunrise',
    badge: 'FREE EVENT',
    badgeColor: '#257d3f',
    badgeBg: '#e6f4e8',
    when: 'Sat · 9:00 AM',
    title: 'Sunrise walk & breathwork',
    detail: 'Restwell Studio · Laurelhurst Park · 32 going',
    sideTop: 'SEP',
    sideBottom: '14',
    sideBg: '#e6f4e8',
    sideTopColor: '#4d8a5c',
    sideBottomColor: '#257d3f',
  },
  {
    id: 'metabolic',
    badge: 'COURSE',
    badgeColor: '#8352c0',
    badgeBg: '#f2e9fb',
    when: 'Tue evenings · online',
    title: 'Metabolic health foundations',
    detail: 'Pulse Labs · $240 · 8 seats left',
    sideTop: '6 WK',
    sideBottom: '★',
    sideBg: '#f2e9fb',
    sideTopColor: '#8352c0',
    sideBottomColor: '#8352c0',
  },
];
