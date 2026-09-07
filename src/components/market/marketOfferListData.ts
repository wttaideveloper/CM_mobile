export const OFFER_LIST_BG = '#f2fff3';
export const OFFER_LIST_GREEN = '#257d3f';
export const OFFER_LIST_TEAL = '#164744';
export const OFFER_LIST_MUTED = '#7c9585';
export const OFFER_LIST_SOFT = '#a8bdae';
export const OFFER_LIST_BORDER = '#dbeadd';

export const OFFER_LIST_FILTERS = ['All', 'Products', 'Services'] as const;

export type OfferListItem = {
  id: string;
  kind: 'PRODUCT' | 'SERVICE';
  kindColor: string;
  kindBg: string;
  title: string;
  vendor: string;
  price: string;
  priceSuffix?: string;
  subtitle: string;
  mediaBg: string;
  iconColor: string;
  icon: 'bag' | 'bowl' | 'user' | 'monitor';
  route: 'listing' | 'service';
};

export const MARKET_OFFERS_ALL: OfferListItem[] = [
  {
    id: 'greens',
    kind: 'PRODUCT',
    kindColor: '#257d3f',
    kindBg: '#e6f4e8',
    title: 'Weekly greens box',
    vendor: 'Verdant Roots',
    price: '$64',
    priceSuffix: '/wk',
    subtitle: 'Subscription · free delivery',
    mediaBg: '#e6f4e8',
    iconColor: '#257d3f',
    icon: 'bag',
    route: 'listing',
  },
  {
    id: 'cook',
    kind: 'SERVICE',
    kindColor: '#c07c27',
    kindBg: '#fdf0e3',
    title: 'Cook-along class',
    vendor: 'Verdant Roots',
    price: '$45',
    subtitle: '90 min · in person',
    mediaBg: '#fdf0e3',
    iconColor: '#c07c27',
    icon: 'bowl',
    route: 'service',
  },
  {
    id: 'dietitian',
    kind: 'SERVICE',
    kindColor: '#3c63c8',
    kindBg: '#eaf1ff',
    title: 'Dietitian consult',
    vendor: 'Verdant Roots',
    price: '$110',
    subtitle: '45 min · virtual',
    mediaBg: '#eaf1ff',
    iconColor: '#3c63c8',
    icon: 'monitor',
    route: 'service',
  },
  {
    id: 'sleep',
    kind: 'SERVICE',
    kindColor: '#8352c0',
    kindBg: '#f2e9fb',
    title: 'Sleep coaching, 6 wks',
    vendor: 'Restwell Studio',
    price: '$390',
    subtitle: '6-week programme · weekly calls',
    mediaBg: '#f2e9fb',
    iconColor: '#8352c0',
    icon: 'user',
    route: 'service',
  },
  {
    id: 'mobility',
    kind: 'SERVICE',
    kindColor: '#3c63c8',
    kindBg: '#eaf1ff',
    title: 'Mobility coaching, 4 wks',
    vendor: 'Motion Studio East',
    price: '$160',
    subtitle: '4-week programme · hybrid',
    mediaBg: '#eaf1ff',
    iconColor: '#3c63c8',
    icon: 'user',
    route: 'service',
  },
  {
    id: 'kit',
    kind: 'PRODUCT',
    kindColor: '#8352c0',
    kindBg: '#f2e9fb',
    title: 'At-home biomarker kit',
    vendor: 'Pulse Labs',
    price: '$129',
    subtitle: 'One-time · shipped',
    mediaBg: '#f2e9fb',
    iconColor: '#8352c0',
    icon: 'bag',
    route: 'listing',
  },
  {
    id: 'herbs',
    kind: 'PRODUCT',
    kindColor: '#257d3f',
    kindBg: '#e6f4e8',
    title: 'Herb & base bundle',
    vendor: 'Green Bowl Co.',
    price: '$38',
    subtitle: 'Ready-to-cook · 6 portions',
    mediaBg: '#eef7ef',
    iconColor: '#2f7d32',
    icon: 'bag',
    route: 'listing',
  },
  {
    id: 'breath',
    kind: 'SERVICE',
    kindColor: '#c07c27',
    kindBg: '#fdf0e3',
    title: 'Breathwork reset',
    vendor: 'Restwell Studio',
    price: '$55',
    subtitle: '60 min · in studio',
    mediaBg: '#fdf0e3',
    iconColor: '#c07c27',
    icon: 'user',
    route: 'service',
  },
];
