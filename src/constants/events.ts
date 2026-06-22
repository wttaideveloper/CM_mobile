export const EVENT_FILTERS = ['All', 'Upcoming', 'This Week', 'Online', 'Fee'] as const;

export type EventFilterTag = 'upcoming' | 'thisWeek' | 'online' | 'free';

export type Event = {
  id: string;
  name: string;
  priceLabel: string;
  isFree: boolean;
  dateTime: string;
  location: string;
  image: string;
  filterTags: EventFilterTag[];
  detailTitle: string;
  status: string;
  schedule: string;
  registered: number;
  capacity: number;
  priceDetail: string;
  description: string;
  detailImage: string;
};

const SUMMIT_DETAIL_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=375&h=350&fit=crop';

export const EVENTS: Event[] = [
  {
    id: 'summer-wellness-summit',
    name: 'Summer Wellness Summit',
    priceLabel: '$49',
    isFree: false,
    dateTime: 'Jul 15 · 9:00 AM',
    location: 'SF Convention Center',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=375&h=200&fit=crop',
    filterTags: ['upcoming', 'thisWeek'],
    detailTitle: 'Summer Wellness Summit 2026',
    status: 'Upcoming',
    schedule: 'Jul 15 · 9AM – 6PM',
    registered: 320,
    capacity: 500,
    priceDetail: '$49 per person',
    description:
      'A full-day conference bringing together wellness leaders, practitioners, and enthusiasts. Featuring 20+ speakers, workshops, a wellness marketplace, and networking sessions.',
    detailImage: SUMMIT_DETAIL_IMAGE,
  },
  {
    id: 'nutrition-workshop',
    name: 'Nutrition Workshop',
    priceLabel: 'Free',
    isFree: true,
    dateTime: 'Jul 22 · 2:00 PM',
    location: 'Studio A, Pinnacle',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=375&h=200&fit=crop',
    filterTags: ['upcoming', 'free'],
    detailTitle: 'Nutrition Workshop',
    status: 'Upcoming',
    schedule: 'Jul 22 · 2PM – 4PM',
    registered: 48,
    capacity: 60,
    priceDetail: 'Free',
    description:
      'Learn practical nutrition strategies for everyday wellness. Includes meal planning tips, label reading, and a guided tasting session with fresh ingredients.',
    detailImage:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=375&h=350&fit=crop',
  },
  {
    id: 'wellness-run',
    name: '5K Wellness Run',
    priceLabel: '$25',
    isFree: false,
    dateTime: 'Aug 3 · 7:00 AM',
    location: 'Golden Gate Park',
    image:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=375&h=350&fit=crop',
    filterTags: ['upcoming'],
    detailTitle: '5K Wellness Run',
    status: 'Upcoming',
    schedule: 'Aug 3 · 7AM – 10AM',
    registered: 186,
    capacity: 300,
    priceDetail: '$25 per person',
    description:
      'A community 5K through Golden Gate Park with warm-up stretches, hydration stations, and a post-run recovery zone.',
    detailImage:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=375&h=350&fit=crop',
  },
];

const FILTER_MAP: Record<string, EventFilterTag | null> = {
  All: null,
  Upcoming: 'upcoming',
  'This Week': 'thisWeek',
  Online: 'online',
  Fee: 'free',
};

export function filterEvents(filter: string): Event[] {
  const tag = FILTER_MAP[filter];
  if (!tag) return EVENTS;
  return EVENTS.filter((event) => event.filterTags.includes(tag));
}

export function getEventById(id: string): Event | undefined {
  return EVENTS.find((event) => event.id === id);
}
