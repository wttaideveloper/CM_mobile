export const MARKET_CART_BG = '#f2fff3';
export const MARKET_CART_GREEN = '#257d3f';
export const MARKET_CART_TEAL = '#164744';
export const MARKET_CART_MUTED = '#7c9585';
export const MARKET_CART_BORDER = '#dbeadd';
export const MARKET_CART_TRACK = '#eef4ee';

export type MarketCartItem = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  qty: number;
  iconBg: string;
  iconColor: string;
  icon: 'bag' | 'bowl' | 'pulse';
};

export type MarketCartGroup = {
  id: string;
  initials: string;
  name: string;
  avatarBg: string;
  avatarColor: string;
  items: MarketCartItem[];
};

export const MARKET_CART_SUMMARY = {
  businesses: 2,
  items: 3,
  subtotal: '$238.00',
  delivery: 'Free',
  tax: '$19.04',
  total: '$257.04',
};

export const MARKET_CART_GROUPS: MarketCartGroup[] = [
  {
    id: 'vr',
    initials: 'VR',
    name: 'Verdant Roots Kitchen',
    avatarBg: '#e6f4e8',
    avatarColor: '#257d3f',
    items: [
      {
        id: 'greens',
        title: 'Weekly greens box',
        subtitle: 'Subscription · billed weekly',
        price: '$64.00',
        qty: 1,
        iconBg: '#e6f4e8',
        iconColor: '#257d3f',
        icon: 'bag',
      },
      {
        id: 'cook',
        title: 'Cook-along class',
        subtitle: 'Sat 14 Sep, 10:00 · in person',
        price: '$45.00',
        qty: 1,
        iconBg: '#fdf0e3',
        iconColor: '#c07c27',
        icon: 'bowl',
      },
    ],
  },
  {
    id: 'pl',
    initials: 'PL',
    name: 'Pulse Labs',
    avatarBg: '#eaf1ff',
    avatarColor: '#3c63c8',
    items: [
      {
        id: 'metabolic',
        title: 'Metabolic panel kit',
        subtitle: 'Ships in 2–3 days',
        price: '$129.00',
        qty: 1,
        iconBg: '#eaf1ff',
        iconColor: '#3c63c8',
        icon: 'pulse',
      },
    ],
  },
];
