export const EXPLORE_HERO_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop';

export const FEATURED_PRODUCTS = [
  {
    id: 'yoga-mat',
    name: 'Yoga Mat',
    price: '$89',
    image:
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=160&h=160&fit=crop',
  },
  {
    id: 'protein-blend',
    name: 'Protein Blend',
    price: '$49',
    image:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=160&h=160&fit=crop',
  },
  {
    id: 'resistance-bands',
    name: 'Resistance Bands',
    price: '$29',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=160&h=160&fit=crop',
  },
  {
    id: 'foam-roller',
    name: 'Foam Roller',
    price: '$35',
    image:
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=160&h=160&fit=crop',
  },
] as const;

export const EXPLORE_BUSINESS = {
  name: 'Pinnacle Wellness Co.',
  category: 'Fitness & Wellness',
  description:
    'Premium fitness center offering personalized training, nutrition coaching, and mental wellness services since 2018.',
  members: '284',
  products: '24',
  rating: '4.8★',
} as const;
