export const MOCK_CART_ITEMS = [
  {
    productId: 'mock-yoga-mat',
    name: 'Cork Yoga Mat',
    image:
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
    unitPrice: 48,
    currency: 'USD',
    quantity: 1,
  },
  {
    productId: 'mock-resistance-bands',
    name: 'Resistance Bands Set',
    image:
      'https://images.unsplash.com/photo-1598289431512-b97b2238e7f0?w=400&h=400&fit=crop',
    unitPrice: 24,
    currency: 'USD',
    quantity: 2,
  },
] as const;

export const MOCK_ADDRESS = {
  fullName: 'Suresh Inti',
  phone: '+1 415 555 0198',
  line1: '128 Wellness Avenue',
  line2: 'Apt 4B',
  city: 'San Francisco',
  state: 'CA',
  zip: '94107',
  country: 'United States',
};

export const MOCK_PAYMENT = {
  cardName: 'Suresh Inti',
  cardNumber: '4242 4242 4242 4242',
  expiry: '12 / 28',
  cvv: '123',
};
