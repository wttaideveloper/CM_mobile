import {
  MARKET_PILLARS,
  type MarketPillar,
} from '@/components/market/marketDashboardData';

export const PILLAR_BG = '#f2fff3';
export const PILLAR_GREEN = '#257d3f';
export const PILLAR_TEAL = '#164744';
export const PILLAR_MUTED = '#7c9585';
export const PILLAR_SOFT = '#a8bdae';
export const PILLAR_BORDER = '#dbeadd';
export const PILLAR_BODY = '#4d6b57';

export const PILLAR_FILTERS = [
  'All',
  'Businesses',
  'Products',
  'Services',
  'Events',
] as const;

export type PillarBrowseContent = {
  id: string;
  eyebrow: string;
  title: string;
  tagline: string;
  stats: string;
  bg: string;
  color: string;
  icon: MarketPillar['icon'];
  businesses: {
    id: string;
    initials: string;
    name: string;
    subtitle: string;
    rating: string;
    meta: string;
    avatarBg: string;
    avatarColor: string;
    verified?: boolean;
  }[];
  offers: {
    id: string;
    kind: 'PRODUCT' | 'SERVICE';
    title: string;
    vendor: string;
    price: string;
    priceSuffix?: string;
    mediaBg: string;
    iconColor: string;
    icon: 'bag' | 'bowl' | 'user' | 'monitor';
    route: 'listing' | 'service';
  }[];
  events: {
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
    route: 'event' | 'course';
  }[];
};

const PILLAR_CONTENT: Record<string, PillarBrowseContent> = {
  nutrition: {
    id: 'nutrition',
    eyebrow: 'Browse by pillar',
    title: 'Nutrition',
    tagline:
      'Meal prep kitchens, dietitian consults and cook-along classes near you — built for metabolic health.',
    stats: '18 businesses · 42 offers · 6 events',
    bg: '#e6f4e8',
    color: '#257d3f',
    icon: 'heart',
    businesses: [
      {
        id: 'vr',
        initials: 'VR',
        name: 'Verdant Roots Kitchen',
        subtitle: 'Plant-based meal prep · Nutrition',
        rating: '4.8',
        meta: '2.1 mi',
        avatarBg: '#e6f4e8',
        avatarColor: '#257d3f',
        verified: true,
      },
      {
        id: 'gb',
        initials: 'GB',
        name: 'Green Bowl Co.',
        subtitle: 'Macro-balanced bowls · Delivery',
        rating: '4.7',
        meta: '3.4 mi',
        avatarBg: '#eef7ef',
        avatarColor: '#2f7d32',
      },
    ],
    offers: [
      {
        id: 'greens',
        kind: 'PRODUCT',
        title: 'Weekly greens box',
        vendor: 'Verdant Roots',
        price: '$64',
        priceSuffix: '/wk',
        mediaBg: '#e6f4e8',
        iconColor: '#257d3f',
        icon: 'bag',
        route: 'listing',
      },
      {
        id: 'cook',
        kind: 'SERVICE',
        title: 'Cook-along class',
        vendor: 'Verdant Roots',
        price: '$45',
        mediaBg: '#fdf0e3',
        iconColor: '#c07c27',
        icon: 'bowl',
        route: 'service',
      },
      {
        id: 'dietitian',
        kind: 'SERVICE',
        title: 'Dietitian consult',
        vendor: 'Verdant Roots',
        price: '$110',
        mediaBg: '#eaf1ff',
        iconColor: '#3c63c8',
        icon: 'monitor',
        route: 'service',
      },
    ],
    events: [
      {
        id: 'farmers',
        badge: 'FREE EVENT',
        badgeColor: '#257d3f',
        badgeBg: '#e6f4e8',
        when: 'Sun · 10:00 AM',
        title: 'Farmers market tour',
        detail: 'Verdant Roots · Suite plaza · 24 going',
        sideTop: 'SEP',
        sideBottom: '21',
        sideBg: '#e6f4e8',
        sideTopColor: '#4d8a5c',
        sideBottomColor: '#257d3f',
        route: 'event',
      },
    ],
  },
  movement: {
    id: 'movement',
    eyebrow: 'Browse by pillar',
    title: 'Movement',
    tagline:
      'Studios, outdoor groups and coaching that keep steps, strength and mobility on track.',
    stats: '12 businesses · 21 offers · 9 events',
    bg: '#eaf1ff',
    color: '#3c63c8',
    icon: 'barbell',
    businesses: [
      {
        id: 'ms',
        initials: 'MS',
        name: 'Motion Studio East',
        subtitle: 'Strength & mobility · Movement',
        rating: '4.9',
        meta: '1.2 mi',
        avatarBg: '#eaf1ff',
        avatarColor: '#3c63c8',
        verified: true,
      },
    ],
    offers: [
      {
        id: 'mobility',
        kind: 'SERVICE',
        title: 'Mobility coaching, 4 wks',
        vendor: 'Motion Studio',
        price: '$160',
        mediaBg: '#eaf1ff',
        iconColor: '#3c63c8',
        icon: 'user',
        route: 'service',
      },
    ],
    events: [
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
        route: 'event',
      },
    ],
  },
  recovery: {
    id: 'recovery',
    eyebrow: 'Browse by pillar',
    title: 'Recovery',
    tagline:
      'Sleep coaching, breathwork and recovery rooms that help Rest climb in your HWI™.',
    stats: '9 businesses · 16 offers · 5 events',
    bg: '#fdf0e3',
    color: '#c07c27',
    icon: 'sun',
    businesses: [
      {
        id: 'rs',
        initials: 'RS',
        name: 'Restwell Studio',
        subtitle: 'Sleep & recovery · Rest',
        rating: '4.7',
        meta: '0.8 mi',
        avatarBg: '#fdf0e3',
        avatarColor: '#c07c27',
        verified: true,
      },
    ],
    offers: [
      {
        id: 'sleep',
        kind: 'SERVICE',
        title: 'Sleep coaching, 6 wks',
        vendor: 'Restwell Studio',
        price: '$390',
        mediaBg: '#f2e9fb',
        iconColor: '#8352c0',
        icon: 'user',
        route: 'service',
      },
    ],
    events: [
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
        route: 'event',
      },
    ],
  },
  'health-tech': {
    id: 'health-tech',
    eyebrow: 'Browse by pillar',
    title: 'Health tech',
    tagline:
      'Wearables, biomarker kits and remote monitoring from verified labs and studios.',
    stats: '7 businesses · 19 offers · 3 courses',
    bg: '#f2e9fb',
    color: '#8352c0',
    icon: 'flask',
    businesses: [
      {
        id: 'pl',
        initials: 'PL',
        name: 'Pulse Labs',
        subtitle: 'Wearables & biomarker kits · Health tech',
        rating: '4.6',
        meta: 'Online',
        avatarBg: '#eaf1ff',
        avatarColor: '#3c63c8',
      },
    ],
    offers: [
      {
        id: 'kit',
        kind: 'PRODUCT',
        title: 'At-home biomarker kit',
        vendor: 'Pulse Labs',
        price: '$129',
        mediaBg: '#f2e9fb',
        iconColor: '#8352c0',
        icon: 'bag',
        route: 'listing',
      },
    ],
    events: [
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
        route: 'course',
      },
    ],
  },
};

export function getPillarBrowseContent(
  id?: string | string[],
): PillarBrowseContent {
  const key = Array.isArray(id) ? id[0] : id;
  if (key && PILLAR_CONTENT[key]) return PILLAR_CONTENT[key];
  const fallback = MARKET_PILLARS[0];
  return PILLAR_CONTENT[fallback.id];
}
