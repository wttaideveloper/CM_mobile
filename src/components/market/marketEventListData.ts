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

// "event"-kind entries were removed (2026-09-30) — the Events panel that
// used to source them from here now uses the real Events API
// (see MarketEventListBody.tsx's toEventListItem). Only "course" entries
// remain; they're a separate, unrelated Market Trainings feature with no
// real API backing this list yet.
export const MARKET_EVENTS_ALL: EventListItem[] = [
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
