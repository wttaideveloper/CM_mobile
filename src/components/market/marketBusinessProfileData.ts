export const BIZ_PROFILE_BG = '#f2fff3';
export const BIZ_PROFILE_GREEN = '#257d3f';
export const BIZ_PROFILE_TEAL = '#164744';
export const BIZ_PROFILE_MUTED = '#7c9585';
export const BIZ_PROFILE_BORDER = '#dbeadd';
export const BIZ_PROFILE_TRACK = '#eef4ee';
export const BIZ_PROFILE_BODY = '#4d6b57';

export const MARKET_BIZ_PROFILE = {
  eyebrow: 'Nutrition · Verified',
  shortName: 'Verdant Roots',
  fullName: 'Verdant Roots Kitchen',
  initials: 'VR',
  rating: '4.8',
  reviewsMeta: '214 reviews · 2.1 mi',
  about:
    'A family-run kitchen making seasonal, plant-forward meals for people managing metabolic health. Every box is built with a registered dietitian and delivered chilled, twice a week.',
  addressLine: '418 Milford Ave, Suite 2',
  addressMeta: 'Portland, OR 97214 · 2.1 mi away',
  website: 'verdantroots.co',
  email: 'hello@verdantroots.co',
  hours: 'Open today · 8am – 6pm',
  offerCount: '12',
};

export type BizProfileOffer = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  iconBg: string;
  iconColor: string;
  icon: 'bag' | 'bowl' | 'monitor';
  kind: 'product' | 'service';
};

export const BIZ_PROFILE_OFFERS: BizProfileOffer[] = [
  {
    id: 'greens',
    title: 'Weekly greens box',
    subtitle: 'Product · Subscription',
    price: '$64',
    iconBg: '#e6f4e8',
    iconColor: '#257d3f',
    icon: 'bag',
    kind: 'product',
  },
  {
    id: 'cook',
    title: 'Cook-along class',
    subtitle: 'Service · 90 min, in person',
    price: '$45',
    iconBg: '#fdf0e3',
    iconColor: '#c07c27',
    icon: 'bowl',
    kind: 'service',
  },
  {
    id: 'dietitian',
    title: 'Dietitian consult',
    subtitle: 'Service · 45 min, virtual',
    price: '$110',
    iconBg: '#eaf1ff',
    iconColor: '#3c63c8',
    icon: 'monitor',
    kind: 'service',
  },
];

export type BizProfileEvent = {
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

export const BIZ_PROFILE_EVENTS: BizProfileEvent[] = [
  {
    id: 'farmers',
    title: 'Farmers market tour',
    subtitle: 'Free event · 90 min, in person',
    price: 'Free',
    priceColor: '#257d3f',
    sideBg: '#e6f4e8',
    sideTop: 'SEP',
    sideBottom: '21',
    sideTopColor: '#4d8a5c',
    sideBottomColor: '#257d3f',
  },
  {
    id: 'batch',
    title: 'Batch-cooking course',
    subtitle: 'Training · 4 weekly sessions',
    price: '$180',
    priceColor: '#164744',
    sideBg: '#f2e9fb',
    sideTop: '4 WK',
    sideBottom: '★',
    sideTopColor: '#8352c0',
    sideBottomColor: '#8352c0',
  },
];
