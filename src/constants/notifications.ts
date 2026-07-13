export type NotificationType =
  | 'booking'
  | 'enterprise'
  | 'event'
  | 'review'
  | 'course'
  | 'sale';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

export const NOTIFICATION_ICON: Record<
  NotificationType,
  { emoji: string; backgroundColor: string }
> = {
  booking: { emoji: '✅', backgroundColor: '#F0FDF4' },
  enterprise: { emoji: '🏢', backgroundColor: '#EAF4EC' },
  event: { emoji: '📅', backgroundColor: '#FFFBEB' },
  review: { emoji: '⭐', backgroundColor: '#FFFBEB' },
  course: { emoji: '📚', backgroundColor: '#EFF6FF' },
  sale: { emoji: '🎯', backgroundColor: '#FFF1F2' },
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'booking-confirmed',
    type: 'booking',
    title: 'Booking Confirmed ✓',
    description: 'Personal Training with Alex Martinez — Mon, Jun 19 · 10:00 AM',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: 'enterprise-nearby',
    type: 'enterprise',
    title: 'New Enterprise Nearby',
    description: 'GreenLeaf Nutrition just joined Invigorate Health near you',
    timestamp: '20 min ago',
    read: false,
  },
  {
    id: 'event-reminder',
    type: 'event',
    title: 'Event Reminder',
    description: "Summer Wellness Summit starts in 5 days — you're registered!",
    timestamp: '1 hr ago',
    read: false,
  },
  {
    id: 'session-review',
    type: 'review',
    title: 'How was your session?',
    description: 'Rate your Nutrition Coaching with Dr. Sarah Kim',
    timestamp: '3 hrs ago',
    read: true,
  },
  {
    id: 'course-content',
    type: 'course',
    title: 'New Course Content',
    description: 'Week 3 of Foundation Fitness Program is now available',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'flash-sale',
    type: 'sale',
    title: 'Flash Sale 🔥',
    description: '20% off all premium equipment — ends in 24 hours',
    timestamp: 'Yesterday',
    read: true,
  },
];
