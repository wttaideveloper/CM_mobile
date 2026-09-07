export const ORDERS_BG = '#f2fff3';
export const ORDERS_GREEN = '#257d3f';
export const ORDERS_TEAL = '#164744';
export const ORDERS_MUTED = '#7c9585';
export const ORDERS_BORDER = '#dbeadd';
export const ORDERS_TRACK = '#eef4ee';

export type OrdersTab = 'Subscriptions' | 'Past orders';

export type ActiveProductSub = {
  id: string;
  title: string;
  vendor: string;
  nextDelivery: string;
  renewsAt: string;
};

export type ActiveServiceSub = {
  id: string;
  title: string;
  vendorProgress: string;
  progress: number;
};

export type PastOrder = {
  id: string;
  title: string;
  detail: string;
  price: string;
  action: string;
  iconBg: string;
  iconColor: string;
  icon: 'pulse' | 'bowl' | 'heart';
};

export const ACTIVE_PRODUCT_SUB: ActiveProductSub = {
  id: 'greens',
  title: 'Weekly greens box',
  vendor: 'Verdant Roots Kitchen',
  nextDelivery: 'Tue 3 Sep · 8am–12pm',
  renewsAt: '$64.00 / wk',
};

export const ACTIVE_SERVICE_SUB: ActiveServiceSub = {
  id: 'sleep',
  title: 'Sleep coaching',
  vendorProgress: 'Restwell Studio · 4 of 6 sessions',
  progress: 66,
};

export const PAST_ORDERS: PastOrder[] = [
  {
    id: 'metabolic',
    title: 'Metabolic panel kit',
    detail: 'Pulse Labs · delivered 22 Aug',
    price: '$129.00',
    action: 'Reorder',
    iconBg: '#eaf1ff',
    iconColor: '#3c63c8',
    icon: 'pulse',
  },
  {
    id: 'cook',
    title: 'Cook-along class',
    detail: 'Verdant Roots · attended 10 Aug',
    price: '$45.00',
    action: 'Review',
    iconBg: '#fdf0e3',
    iconColor: '#c07c27',
    icon: 'bowl',
  },
  {
    id: 'mag',
    title: 'Magnesium glycinate',
    detail: 'Ridgeline Supply · delivered 2 Aug',
    price: '$28.00',
    action: 'Reorder',
    iconBg: '#e6f4e8',
    iconColor: '#257d3f',
    icon: 'heart',
  },
];
