export const SERVICE_CATEGORIES = [
  'All',
  'Training',
  'Coaching',
  'Classes',
  'Recovery',
  'Therapy',
] as const;

export type ServiceCategory =
  | 'Training'
  | 'Coaching'
  | 'Classes'
  | 'Recovery'
  | 'Therapy';

export type ServiceSlot = {
  id: string;
  dayShort: string;
  date: number;
  slots: number;
};

export type Service = {
  id: string;
  category: ServiceCategory;
  name: string;
  provider: string;
  enterprise: string;
  duration: string;
  price: string;
  unit: string;
  sessionType: string;
  format: string;
  description: string;
  image: string;
  availability: ServiceSlot[];
};

const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=375&h=350&fit=crop';

const DEFAULT_AVAILABILITY: ServiceSlot[] = [
  { id: 'mon-17', dayShort: 'Mon', date: 17, slots: 3 },
  { id: 'tue-18', dayShort: 'Tue', date: 18, slots: 2 },
  { id: 'wed-19', dayShort: 'Wed', date: 19, slots: 4 },
  { id: 'thu-20', dayShort: 'Thu', date: 20, slots: 1 },
  { id: 'fri-21', dayShort: 'Fri', date: 21, slots: 3 },
];

export const SERVICES: Service[] = [
  {
    id: 'personal-training',
    category: 'Training',
    name: 'Personal Training Session',
    provider: 'Alex Martinez',
    enterprise: 'Pinnacle Wellness',
    duration: '60 min',
    price: '$95',
    unit: '/hr',
    sessionType: 'Private',
    format: 'In-person',
    description:
      'One-on-one training tailored to your goals. Build strength, lose weight, or improve athletic performance with a personalised program designed just for you.',
    image: DEFAULT_HERO,
    availability: DEFAULT_AVAILABILITY,
  },
  {
    id: 'nutrition-coaching',
    category: 'Coaching',
    name: 'Nutrition Coaching',
    provider: 'Dr. Sarah Kim',
    enterprise: 'Pinnacle Wellness',
    duration: '45 min',
    price: '$75',
    unit: '/session',
    sessionType: 'Private',
    format: 'Virtual',
    description:
      'Personalised nutrition guidance to support your health goals. Review habits, meal planning, and sustainable strategies with a certified coach.',
    image: DEFAULT_HERO,
    availability: DEFAULT_AVAILABILITY,
  },
  {
    id: 'group-yoga',
    category: 'Classes',
    name: 'Group Yoga Class',
    provider: 'Maya Patel',
    enterprise: 'Pinnacle Wellness',
    duration: '75 min',
    price: '$25',
    unit: '/class',
    sessionType: 'Group',
    format: 'In-person',
    description:
      'A guided yoga session for flexibility, balance, and mindfulness. Suitable for all levels with modifications offered throughout the class.',
    image: DEFAULT_HERO,
    availability: DEFAULT_AVAILABILITY,
  },
  {
    id: 'sports-massage',
    category: 'Recovery',
    name: 'Sports Massage',
    provider: 'Chris Johnson',
    enterprise: 'Pinnacle Wellness',
    duration: '90 min',
    price: '$120',
    unit: '/session',
    sessionType: 'Private',
    format: 'In-person',
    description:
      'Therapeutic massage focused on muscle recovery, tension relief, and improved mobility after training or competition.',
    image: DEFAULT_HERO,
    availability: DEFAULT_AVAILABILITY,
  },
  {
    id: 'mental-health',
    category: 'Therapy',
    name: 'Mental Health Consultation',
    provider: 'Dr. Priya Nair',
    enterprise: 'Pinnacle Wellness',
    duration: '60 min',
    price: '$150',
    unit: '/hr',
    sessionType: 'Private',
    format: 'Virtual',
    description:
      'Confidential consultation with a licensed professional to discuss stress, performance mindset, and emotional wellbeing.',
    image: DEFAULT_HERO,
    availability: DEFAULT_AVAILABILITY,
  },
];

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((service) => service.id === id);
}
