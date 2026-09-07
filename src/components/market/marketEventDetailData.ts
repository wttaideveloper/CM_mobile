export const EVENT_DETAIL_BG = '#f2fff3';
export const EVENT_DETAIL_GREEN = '#257d3f';
export const EVENT_DETAIL_TEAL = '#164744';
export const EVENT_DETAIL_MUTED = '#7c9585';
export const EVENT_DETAIL_SOFT = '#a8bdae';
export const EVENT_DETAIL_BORDER = '#dbeadd';
export const EVENT_DETAIL_TRACK = '#eef4ee';
export const EVENT_DETAIL_BODY = '#4d6b57';

export const MARKET_EVENT_DETAIL = {
  badge: 'FREE EVENT',
  kindMeta: 'Recovery · in person',
  title: 'Sunrise walk & breathwork',
  description:
    'A slow 40-minute loop at first light, then ten minutes of guided breathwork by the pond. Suitable for every fitness level — bring water and a jacket.',
  dateTitle: 'Saturday 14 September',
  dateMeta: '9:00 – 10:30 AM',
  locationTitle: 'Laurelhurst Park',
  locationMeta: 'Meet at the SE 39th gate · 3.4 mi',
  capacityTitle: '32 going · 8 spots left',
  capacityMeta: 'Capacity 40',
  hostInitials: 'RS',
  hostName: 'Restwell Studio',
  hostMeta: 'Hosting 4 events this month',
  hostAvatarBg: '#f2e9fb',
  hostAvatarColor: '#8352c0',
  priceLabel: 'Price',
  price: 'Free',
  cta: 'Reserve a spot',
  mediaBg: '#e6f4e8',
  mediaIcon: '#8fbd9a',
};

export type EventHostSession = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  priceColor: string;
  sideBg: string;
  sideTop: string;
  sideBottom: string;
  sideTopColor: string;
  sideBottomColor: string;
};

export const EVENT_HOST_SESSIONS: EventHostSession[] = [
  {
    id: 'sleep',
    title: 'Sleep reset course',
    subtitle: 'Paid training · Tue evenings',
    price: '$390',
    priceColor: '#164744',
    sideBg: '#f2e9fb',
    sideTop: '6 WK',
    sideBottom: '★',
    sideTopColor: '#8352c0',
    sideBottomColor: '#8352c0',
  },
  {
    id: 'wind',
    title: 'Evening wind-down clinic',
    subtitle: 'Free event · 60 min',
    price: 'Free',
    priceColor: '#257d3f',
    sideBg: '#e6f4e8',
    sideTop: 'OCT',
    sideBottom: '05',
    sideTopColor: '#4d8a5c',
    sideBottomColor: '#257d3f',
  },
];
