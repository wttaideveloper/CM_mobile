export const EVENT_FILTERS = ['All', 'Upcoming', 'This Week', 'Online', 'Free'] as const;

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
  isFeatured?: boolean;
  detailTitle: string;
  status: string;
  schedule: string;
  registered: number;
  capacity: number;
  priceDetail: string;
  description: string;
  detailImage: string;
  organizer: string;
  organizerInitial: string;
  speakerInitials: string[];
  additionalSpeakers: number;
};

const SUMMIT_DETAIL_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=375&h=350&fit=crop';

export const FEATURED_EVENT_ID = 'summer-wellness-summit';

export const EVENTS: Event[] = [
  {
    id: 'summer-wellness-summit',
    name: 'Summer Wellness Summit',
    priceLabel: '$49',
    isFree: false,
    dateTime: 'Jul 15 · 9:00 AM',
    location: 'SF Convention Center',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=375&h=220&fit=crop',
    filterTags: ['upcoming', 'thisWeek'],
    isFeatured: true,
    detailTitle: 'Summer Wellness Summit 2026',
    status: 'Upcoming',
    schedule: 'Jul 15 · 9AM – 6PM',
    registered: 320,
    capacity: 500,
    priceDetail: '$49 per person',
    description:
      'A full-day conference bringing together 500+ wellness leaders, practitioners, and enthusiasts. Featuring 20+ speakers, hands-on workshops, a wellness marketplace, and world-class networking sessions.',
    detailImage: SUMMIT_DETAIL_IMAGE,
    organizer: 'Pinnacle Wellness Co.',
    organizerInitial: 'P',
    speakerInitials: ['A', 'B', 'C', 'D'],
    additionalSpeakers: 18,
  },
  {
    id: 'nutrition-workshop',
    name: 'Nutrition Workshop',
    priceLabel: 'Free',
    isFree: true,
    dateTime: 'Jul 22 · 2:00 PM',
    location: 'Studio A, Pinnacle',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=160&h=160&fit=crop',
    filterTags: ['upcoming', 'free'],
    detailTitle: 'Nutrition Workshop',
    status: 'Upcoming',
    schedule: 'Jul 22 · 2PM – 4PM',
    registered: 51,
    capacity: 60,
    priceDetail: 'Free',
    description:
      'Learn practical nutrition strategies for everyday wellness. Includes meal planning tips, label reading, and a guided tasting session with fresh ingredients.',
    detailImage:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=375&h=350&fit=crop',
    organizer: 'Pinnacle Wellness Co.',
    organizerInitial: 'P',
    speakerInitials: ['N', 'R'],
    additionalSpeakers: 0,
  },
  {
    id: 'wellness-run',
    name: '5K Wellness Run',
    priceLabel: '$25',
    isFree: false,
    dateTime: 'Aug 3 · 7:00 AM',
    location: 'Golden Gate Park',
    image:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=160&h=160&fit=crop',
    filterTags: ['upcoming'],
    detailTitle: '5K Wellness Run',
    status: 'Upcoming',
    schedule: 'Aug 3 · 7AM – 10AM',
    registered: 240,
    capacity: 300,
    priceDetail: '$25 per person',
    description:
      'A community 5K through Golden Gate Park with warm-up stretches, hydration stations, and a post-run recovery zone.',
    detailImage:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=375&h=350&fit=crop',
    organizer: 'Pinnacle Wellness Co.',
    organizerInitial: 'P',
    speakerInitials: ['M', 'K'],
    additionalSpeakers: 0,
  },
  {
    id: 'virtual-yoga-series',
    name: 'Virtual Yoga Series',
    priceLabel: 'Free',
    isFree: true,
    dateTime: 'Every Tuesday',
    location: 'Online · Zoom',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=160&h=160&fit=crop&sat=-100',
    filterTags: ['upcoming', 'online', 'free'],
    detailTitle: 'Virtual Yoga Series',
    status: 'Upcoming',
    schedule: 'Every Tuesday · 6PM',
    registered: 0,
    capacity: 100,
    priceDetail: 'Free',
    description:
      'Join our weekly virtual yoga sessions from anywhere. Suitable for all levels with guided breathing and flexibility flows.',
    detailImage:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=375&h=350&fit=crop',
    organizer: 'Pinnacle Wellness Co.',
    organizerInitial: 'P',
    speakerInitials: ['Y'],
    additionalSpeakers: 0,
  },
];

const FILTER_MAP: Record<string, EventFilterTag | null> = {
  All: null,
  Upcoming: 'upcoming',
  'This Week': 'thisWeek',
  Online: 'online',
  Free: 'free',
};

export function filterEvents(filter: string): Event[] {
  const tag = FILTER_MAP[filter];
  if (!tag) {
    return EVENTS;
  }
  return EVENTS.filter((event) => event.filterTags.includes(tag));
}

export function getEventById(id: string): Event | undefined {
  return EVENTS.find((event) => event.id === id);
}

export function getFeaturedEvent(): Event | undefined {
  return EVENTS.find((event) => event.isFeatured) ?? EVENTS[0];
}

export function getListEvents(events: Event[]): Event[] {
  return events.filter((event) => !event.isFeatured);
}
