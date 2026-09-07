export const MARKET_CHECKOUT_BG = '#f2fff3';
export const MARKET_CHECKOUT_GREEN = '#257d3f';
export const MARKET_CHECKOUT_TEAL = '#164744';
export const MARKET_CHECKOUT_MUTED = '#7c9585';
export const MARKET_CHECKOUT_BORDER = '#dbeadd';
export const MARKET_CHECKOUT_TRACK = '#eef4ee';

export const MARKET_CHECKOUT = {
  addressLabel: 'Home',
  addressLine: '2214 SE Ash St, Portland OR 97214',
  cardLabel: 'Visa ···· 4412',
  cardExpiry: 'Expires 04/29',
  delivery: 'Free',
  tax: '$19.04',
  total: '$257.04',
  renewNote:
    'The greens box renews weekly at $64 until you cancel. Cancel anytime from Orders.',
};

export type MarketCheckoutLine = {
  id: string;
  title: string;
  price: string;
  swatch: string;
};

export const MARKET_CHECKOUT_LINES: MarketCheckoutLine[] = [
  {
    id: 'greens',
    title: 'Weekly greens box',
    price: '$64.00',
    swatch: '#e6f4e8',
  },
  {
    id: 'cook',
    title: 'Cook-along class',
    price: '$45.00',
    swatch: '#fdf0e3',
  },
  {
    id: 'metabolic',
    title: 'Metabolic panel kit',
    price: '$129.00',
    swatch: '#eaf1ff',
  },
];
