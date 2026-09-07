export const ORDER_CONFIRMED_GREEN = '#257d3f';
export const ORDER_CONFIRMED_TEAL = '#164744';
export const ORDER_CONFIRMED_MUTED = '#7c9585';
export const ORDER_CONFIRMED_TRACK = '#eef4ee';

export const MARKET_ORDER_CONFIRMED = {
  title: 'Order confirmed',
  subtitle:
    "Three items from two businesses. We've emailed a receipt to dana@example.com.",
  orderNumber: 'ORDER #IH-48210',
};

export type OrderConfirmedDetail = {
  id: string;
  title: string;
  subtitle: string;
  iconBg: string;
  icon: 'truck' | 'calendar';
  iconColor: string;
};

export const ORDER_CONFIRMED_DETAILS: OrderConfirmedDetail[] = [
  {
    id: 'greens',
    title: 'Greens box arrives Tue 3 Sep',
    subtitle: 'Verdant Roots Kitchen · 8am–12pm',
    iconBg: '#e6f4e8',
    icon: 'truck',
    iconColor: '#257d3f',
  },
  {
    id: 'cook',
    title: 'Cook-along class Sat 14 Sep',
    subtitle: 'Added to your calendar',
    iconBg: '#fdf0e3',
    icon: 'calendar',
    iconColor: '#c07c27',
  },
];
