export type NotificationType =
  | 'booking'
  | 'product'
  | 'event'
  | 'review'
  | 'course';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'booking-confirmed',
    type: 'booking',
    title: 'Booking Confirmed',
    description: 'Personal Training with Alex Martinez — Mon, Jun 19 · 10:00 AM',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: 'new-product',
    type: 'product',
    title: 'New Product Alert',
    description: 'Pinnacle Wellness added "Premium Kettlebell Set"',
    timestamp: '18 min ago',
    read: false,
  },
  {
    id: 'event-reminder',
    type: 'event',
    title: 'Event Reminder',
    description: 'Summer Wellness Summit starts in 5 days',
    timestamp: '1 hr ago',
    read: false,
  },
  {
    id: 'review-request',
    type: 'review',
    title: 'Review Request',
    description: 'How was your Nutrition Coaching with Dr. Sarah Kim?',
    timestamp: '3 hrs ago',
    read: true,
  },
  {
    id: 'course-update',
    type: 'course',
    title: 'Course Update',
    description: 'Week 3 content for Foundation Fitness is now available',
    timestamp: 'Yesterday',
    read: true,
  },
];
