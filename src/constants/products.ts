export const PRODUCT_CATEGORIES = [
  'All',
  'Equipment',
  'Supplements',
  'Recovery',
  'Digital',
  'Accessories',
] as const;

export type ProductCategory =
  | 'Equipment'
  | 'Supplements'
  | 'Recovery'
  | 'Digital'
  | 'Accessories';

export type ProductSpec = {
  value: string;
  label: string;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: string;
  rating: string;
  image?: string;
  placeholder?: boolean;
  brand: string;
  reviewCount: number;
  description: string;
  specs: ProductSpec[];
  stock: number;
  images: string[];
};

const YOGA_IMAGE =
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=400&fit=crop';

export const PRODUCTS: Product[] = [
  {
    id: 'premium-yoga-mat',
    name: 'Premium Yoga Mat',
    category: 'Equipment',
    price: '$89.99',
    rating: '4.8',
    image: YOGA_IMAGE,
    brand: 'Pinnacle Wellness',
    reviewCount: 128,
    description:
      'Extra thick, non-slip surface with alignment lines. Made from eco-friendly natural rubber with antimicrobial properties. Perfect for yoga, pilates, and floor workouts.',
    specs: [
      { value: '183cm', label: 'Length' },
      { value: '61cm', label: 'Width' },
      { value: '6mm', label: 'Thick' },
    ],
    stock: 45,
    images: [YOGA_IMAGE, YOGA_IMAGE, YOGA_IMAGE, YOGA_IMAGE],
  },
  {
    id: 'whey-protein',
    name: 'Whey Protein Blend',
    category: 'Supplements',
    price: '$49.99',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop',
    brand: 'Pinnacle Wellness',
    reviewCount: 96,
    description:
      'Premium whey protein with 24g protein per serving. Supports muscle recovery and lean muscle growth with a smooth, easy-to-mix formula.',
    specs: [
      { value: '2lb', label: 'Size' },
      { value: '24g', label: 'Protein' },
      { value: '30', label: 'Servings' },
    ],
    stock: 62,
    images: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop',
    ],
  },
  {
    id: 'resistance-bands',
    name: 'Resistance Band Set',
    category: 'Equipment',
    price: '$34.99',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
    brand: 'Pinnacle Wellness',
    reviewCount: 74,
    description:
      'Five resistance levels for full-body strength training. Durable latex bands with comfortable grips for home or gym workouts.',
    specs: [
      { value: '5', label: 'Bands' },
      { value: 'Latex', label: 'Material' },
      { value: '25kg', label: 'Max load' },
    ],
    stock: 38,
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop',
    ],
  },
  {
    id: 'foam-roller',
    name: 'Foam Roller Pro',
    category: 'Recovery',
    price: '$44.99',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    brand: 'Pinnacle Wellness',
    reviewCount: 52,
    description:
      'High-density foam roller for deep tissue massage and muscle recovery. Textured surface targets trigger points and improves mobility.',
    specs: [
      { value: '45cm', label: 'Length' },
      { value: '14cm', label: 'Diameter' },
      { value: 'High', label: 'Density' },
    ],
    stock: 29,
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    ],
  },
  {
    id: 'alpine-wellness',
    name: 'Alpine Wellness Kit',
    category: 'Recovery',
    price: '$59.99',
    rating: '4.8',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    brand: 'Pinnacle Wellness',
    reviewCount: 41,
    description:
      'Complete recovery kit with massage ball, stretch strap, and cooling wrap. Designed for post-workout recovery and daily wellness.',
    specs: [
      { value: '3', label: 'Items' },
      { value: 'Kit', label: 'Type' },
      { value: 'Pro', label: 'Grade' },
    ],
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    ],
  },
  {
    id: 'wellness-journal',
    name: 'Wellness Journal',
    category: 'Digital',
    price: '$24.99',
    rating: '4.8',
    placeholder: true,
    brand: 'Pinnacle Wellness',
    reviewCount: 33,
    description:
      'Guided digital wellness journal with daily prompts, habit tracking, and mindfulness exercises to support your health journey.',
    specs: [
      { value: '365', label: 'Days' },
      { value: 'PDF', label: 'Format' },
      { value: 'Instant', label: 'Delivery' },
    ],
    stock: 999,
    images: [],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
