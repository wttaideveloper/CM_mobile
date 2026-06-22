export type AppointmentStatus = 'confirmed' | 'pending';

export type Appointment = {
  id: string;
  title: string;
  instructor: string;
  schedule: string;
  image: string;
  status: AppointmentStatus;
  dateKey: string;
  isPast: boolean;
};

export const APPOINTMENT_TABS = ['Upcoming', 'Past'] as const;

export type AppointmentTab = (typeof APPOINTMENT_TABS)[number];

export const CALENDAR_DAYS = [
  { key: '2026-06-15', day: 'Sun', date: 15 },
  { key: '2026-06-16', day: 'Mon', date: 16 },
  { key: '2026-06-17', day: 'Tue', date: 17 },
  { key: '2026-06-18', day: 'Wed', date: 18 },
  { key: '2026-06-19', day: 'Thu', date: 19 },
  { key: '2026-06-20', day: 'Fri', date: 20 },
  { key: '2026-06-21', day: 'Sat', date: 21 },
] as const;

export const APPOINTMENTS: Appointment[] = [
  {
    id: 'personal-training',
    title: 'Personal Training',
    instructor: 'Alex Martinez',
    schedule: 'Today · 10:00 AM – 11:00 AM',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
    status: 'confirmed',
    dateKey: '2026-06-17',
    isPast: false,
  },
  {
    id: 'nutrition-coaching',
    title: 'Nutrition Coaching',
    instructor: 'Dr. Sarah Kim',
    schedule: 'Tomorrow · 2:00 PM – 2:45 PM',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=100&h=100&fit=crop',
    status: 'confirmed',
    dateKey: '2026-06-18',
    isPast: false,
  },
  {
    id: 'group-yoga',
    title: 'Group Yoga Class',
    instructor: 'Maya Patel',
    schedule: 'Jun 20 · 9:00 AM – 10:15 AM',
    image:
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=100&h=100&fit=crop',
    status: 'pending',
    dateKey: '2026-06-20',
    isPast: false,
  },
  {
    id: 'strength-session',
    title: 'Strength Session',
    instructor: 'Alex Martinez',
    schedule: 'Jun 10 · 8:00 AM – 9:00 AM',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
    status: 'confirmed',
    dateKey: '2026-06-10',
    isPast: true,
  },
  {
    id: 'meal-plan-review',
    title: 'Meal Plan Review',
    instructor: 'Dr. Sarah Kim',
    schedule: 'Jun 8 · 3:00 PM – 3:30 PM',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=100&h=100&fit=crop',
    status: 'confirmed',
    dateKey: '2026-06-08',
    isPast: true,
  },
];

export function filterAppointments(tab: AppointmentTab): Appointment[] {
  return APPOINTMENTS.filter((item) =>
    tab === 'Upcoming' ? !item.isPast : item.isPast,
  );
}
