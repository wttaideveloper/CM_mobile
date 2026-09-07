export const EVENT_LIST_BG = '#f2fff3';
export const EVENT_LIST_GREEN = '#257d3f';
export const EVENT_LIST_TEAL = '#164744';
export const EVENT_LIST_MUTED = '#7c9585';
export const EVENT_LIST_SOFT = '#a8bdae';
export const EVENT_LIST_BORDER = '#dbeadd';

export const EVENT_LIST_FILTERS = ['All', 'Events', 'Courses'] as const;

export type EventListItem = {
  id: string;
  kind: 'event' | 'course';
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

export const MARKET_EVENTS_ALL: EventListItem[] = [
  {
    id: 'sunrise',
    kind: 'event',
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
    kind: 'course',
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
  {
    id: 'farmers',
    kind: 'event',
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
  },
  {
    id: 'batch',
    kind: 'course',
    badge: 'COURSE',
    badgeColor: '#8352c0',
    badgeBg: '#f2e9fb',
    when: 'Thu evenings · in person',
    title: 'Batch-cooking course',
    detail: 'Verdant Roots · $180 · 4 weekly sessions',
    sideTop: '4 WK',
    sideBottom: '★',
    sideBg: '#f2e9fb',
    sideTopColor: '#8352c0',
    sideBottomColor: '#8352c0',
  },
  {
    id: 'mobility',
    kind: 'event',
    badge: 'EVENT',
    badgeColor: '#3c63c8',
    badgeBg: '#eaf1ff',
    when: 'Wed · 6:30 PM',
    title: 'Evening mobility circle',
    detail: 'Motion Studio East · Studio B · 18 going',
    sideTop: 'SEP',
    sideBottom: '17',
    sideBg: '#eaf1ff',
    sideTopColor: '#3c63c8',
    sideBottomColor: '#3c63c8',
  },
  {
    id: 'sleep-lab',
    kind: 'course',
    badge: 'COURSE',
    badgeColor: '#c07c27',
    badgeBg: '#fdf0e3',
    when: 'Mon evenings · hybrid',
    title: 'Sleep reset foundations',
    detail: 'Restwell Studio · $220 · 5 seats left',
    sideTop: '5 WK',
    sideBottom: '★',
    sideBg: '#fdf0e3',
    sideTopColor: '#c07c27',
    sideBottomColor: '#c07c27',
  },
];
