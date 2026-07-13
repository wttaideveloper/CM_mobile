export type AppointmentStatus = 'confirmed' | 'pending' | 'upcoming';

export type Appointment = {
  id: string;
  title: string;
  instructor: string;
  time: string;
  location: string;
  image: string;
  status: AppointmentStatus;
  dateKey: string;
  sectionLabel: string;
  accentColor: string;
  isPast: boolean;
};

export const APPOINTMENT_TABS = ['Upcoming', 'Past'] as const;

export type AppointmentTab = (typeof APPOINTMENT_TABS)[number];

export const CALENDAR_MONTH_LABEL = 'June 2026';

export const CALENDAR_DAYS = [
  { key: '2026-06-15', day: 'S', date: 15, hasDot: false },
  { key: '2026-06-16', day: 'M', date: 16, hasDot: false },
  { key: '2026-06-17', day: 'T', date: 17, hasDot: false },
  { key: '2026-06-18', day: 'W', date: 18, hasDot: false },
  { key: '2026-06-19', day: 'T', date: 19, hasDot: true },
  { key: '2026-06-20', day: 'F', date: 20, hasDot: false },
  { key: '2026-06-21', day: 'S', date: 21, hasDot: false },
] as const;

export const APPOINTMENTS: Appointment[] = [
  {
    id: 'personal-training',
    title: 'Personal Training',
    instructor: 'Alex Martinez',
    time: '10:00 – 11:00 AM',
    location: 'Studio 3, Pinnacle Wellness',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop&auto=format',
    status: 'confirmed',
    dateKey: '2026-06-17',
    sectionLabel: 'TUESDAY, JUNE 17',
    accentColor: '#1F5D4E',
    isPast: false,
  },
  {
    id: 'nutrition-coaching',
    title: 'Nutrition Coaching',
    instructor: 'Dr. Sarah Kim',
    time: '2:00 – 2:45 PM',
    location: 'Online',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=120&h=120&fit=crop&auto=format',
    status: 'pending',
    dateKey: '2026-06-17',
    sectionLabel: 'TUESDAY, JUNE 17',
    accentColor: '#EA580C',
    isPast: false,
  },
  {
    id: 'group-yoga',
    title: 'Group Yoga Class',
    instructor: 'Maya Patel',
    time: 'Evening TBD',
    location: 'Yoga Studio A',
    image:
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=120&h=120&fit=crop&auto=format&sat=-100',
    status: 'upcoming',
    dateKey: '2026-06-17',
    sectionLabel: 'TUESDAY, JUNE 17',
    accentColor: '#7C3AED',
    isPast: false,
  },
  {
    id: 'strength-session',
    title: 'Strength Session',
    instructor: 'Alex Martinez',
    time: '8:00 – 9:00 AM',
    location: 'Studio 2, Pinnacle Wellness',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop&auto=format',
    status: 'confirmed',
    dateKey: '2026-06-10',
    sectionLabel: 'TUESDAY, JUNE 10',
    accentColor: '#1F5D4E',
    isPast: true,
  },
  {
    id: 'meal-plan-review',
    title: 'Meal Plan Review',
    instructor: 'Dr. Sarah Kim',
    time: '3:00 – 3:30 PM',
    location: 'Online',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=120&h=120&fit=crop&auto=format',
    status: 'confirmed',
    dateKey: '2026-06-08',
    sectionLabel: 'MONDAY, JUNE 8',
    accentColor: '#1F5D4E',
    isPast: true,
  },
];

export function filterAppointments(
  tab: AppointmentTab,
  dateKey?: string,
): Appointment[] {
  return APPOINTMENTS.filter((item) => {
    if (tab === 'Upcoming' ? item.isPast : !item.isPast) {
      return false;
    }

    if (tab === 'Upcoming' && dateKey) {
      return item.dateKey === dateKey;
    }

    return true;
  });
}
