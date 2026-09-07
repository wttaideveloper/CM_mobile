export const NOTIF_BG = '#f2fff3';
export const NOTIF_GREEN = '#257d3f';
export const NOTIF_TEAL = '#164744';
export const NOTIF_MUTED = '#7c9585';
export const NOTIF_BODY = '#4c6b58';
export const NOTIF_BORDER = '#dbeadd';
export const NOTIF_CHIP_BORDER = '#d6ecd9';
export const NOTIF_TIME = '#a8bdae';

export type NotifFilter = 'All' | 'Reminders' | 'Milestones' | 'Insights' | 'Score';

export type NotifIconKind =
  | 'sun'
  | 'dumbbell'
  | 'award'
  | 'book'
  | 'trend'
  | 'drop';

export type StaticNotification = {
  id: string;
  group: 'TODAY' | 'YESTERDAY';
  filter: Exclude<NotifFilter, 'All'>;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  color: string;
  bg: string;
  icon: NotifIconKind;
};

export const NOTIF_FILTERS: NotifFilter[] = [
  'All',
  'Reminders',
  'Milestones',
  'Insights',
  'Score',
];

export const STATIC_NOTIFICATIONS: StaticNotification[] = [
  {
    id: '1',
    group: 'TODAY',
    filter: 'Reminders',
    title: 'Sunshine reminder',
    body: "You haven't logged outdoor exposure yet today. Step outside for 15 min!",
    time: 'Just now',
    unread: true,
    color: '#e08b00',
    bg: '#fff4e0',
    icon: 'sun',
  },
  {
    id: '2',
    group: 'TODAY',
    filter: 'Reminders',
    title: 'Exercise pending',
    body: 'Your 60-min walk is still pending. Complete it to keep your streak going.',
    time: '1h ago',
    unread: true,
    color: '#d94848',
    bg: '#fde8e8',
    icon: 'dumbbell',
  },
  {
    id: '3',
    group: 'TODAY',
    filter: 'Milestones',
    title: '80-Day Streak achieved',
    body: "You've maintained your wellness practices for 80 days straight. Keep going!",
    time: '2h ago',
    unread: true,
    color: '#2f7d32',
    bg: '#e6f4e8',
    icon: 'award',
  },
  {
    id: '4',
    group: 'TODAY',
    filter: 'Insights',
    title: 'New daily insight',
    body: 'Why fibre is the foundation of gut health — Evidence-based · 4 min read',
    time: '5h ago',
    unread: false,
    color: '#1e6fd9',
    bg: '#e8f0fe',
    icon: 'book',
  },
  {
    id: '5',
    group: 'YESTERDAY',
    filter: 'Score',
    title: 'HWI™ score improved',
    body: 'Your overall HWI™ score rose to 86 — up 4 pts from last week. Well done!',
    time: 'Yesterday',
    unread: false,
    color: '#2f7d32',
    bg: '#e6f4e8',
    icon: 'trend',
  },
  {
    id: '6',
    group: 'YESTERDAY',
    filter: 'Reminders',
    title: 'Hydration check',
    body: "You've had 6 of 8 glasses today. Two more to hit your water goal!",
    time: 'Yesterday',
    unread: false,
    color: '#1e6fd9',
    bg: '#e8f0fe',
    icon: 'drop',
  },
];
