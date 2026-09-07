export const SETTINGS_BG = '#f2fff3';
export const SETTINGS_GREEN = '#257d3f';
export const SETTINGS_TEAL = '#164744';
export const SETTINGS_BODY = '#4c6b58';
export const SETTINGS_INK = '#0d1f1a';
export const SETTINGS_BORDER = '#c8e0cc';
export const SETTINGS_PROFILE_BORDER = '#98d1a9';
export const SETTINGS_ROW_BORDER = '#ebf5ec';
export const SETTINGS_ICON_BG = '#e0f2e9';
export const SETTINGS_ICON = '#164744';
export const SETTINGS_DANGER = '#c0392b';
export const SETTINGS_DANGER_BG = '#fde8e8';
export const SETTINGS_TRACK = '#bfe9c2';
export const SETTINGS_TOGGLE_OFF = '#c8d5cc';
export const SETTINGS_TOGGLE_ON = '#368849';

export type SettingsIconKind =
  | 'user'
  | 'lock'
  | 'bag'
  | 'chart'
  | 'target'
  | 'clock'
  | 'globe'
  | 'moon'
  | 'shield'
  | 'bell'
  | 'mail'
  | 'chat'
  | 'book'
  | 'help'
  | 'file'
  | 'logout'
  | 'trash';

export type SettingsRow =
  | {
      id: string;
      title: string;
      subtitle: string;
      icon: SettingsIconKind;
      kind: 'link';
      href?: string;
      badge?: string;
    }
  | {
      id: string;
      title: string;
      subtitle: string;
      icon: SettingsIconKind;
      kind: 'toggle';
      toggleKey: 'push' | 'digest' | 'provider' | 'reminders';
    };

export type SettingsGroup = {
  id: string;
  label: string;
  rows: SettingsRow[];
};

/** Only items tied to current new-UI features (Home, HWI, Market, Check-in, Coach, Library). */
export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: 'account',
    label: 'Account',
    rows: [
      {
        id: 'personal',
        title: 'Personal Information',
        subtitle: 'Name, date of birth, gender',
        icon: 'user',
        kind: 'link',
      },
      {
        id: 'security',
        title: 'Password & Security',
        subtitle: 'Update password, 2FA',
        icon: 'lock',
        kind: 'link',
      },
      {
        id: 'orders',
        title: 'Orders & Subscriptions',
        subtitle: 'Marketplace purchases and deliveries',
        icon: 'bag',
        kind: 'link',
        href: '/(main)/market/orders',
      },
    ],
  },
  {
    id: 'wellness',
    label: 'Invigorate Wellness',
    rows: [
      {
        id: 'hwi',
        title: 'HWI™ Assessment',
        subtitle: 'Retake or update your assessment',
        icon: 'chart',
        kind: 'link',
        href: '/(main)/(tabs)/hwi',
      },
      {
        id: 'goals',
        title: 'Health Goals',
        subtitle: 'Weight loss, better sleep, energy',
        icon: 'target',
        kind: 'link',
      },
      {
        id: 'reminders',
        title: 'Daily Reminders',
        subtitle: '7:00 AM · Check-in reminders',
        icon: 'clock',
        kind: 'toggle',
        toggleKey: 'reminders',
      },
    ],
  },
  {
    id: 'app',
    label: 'App',
    rows: [
      {
        id: 'language',
        title: 'Language',
        subtitle: 'English (US)',
        icon: 'globe',
        kind: 'link',
      },
      {
        id: 'privacy',
        title: 'Privacy & Data',
        subtitle: 'HIPAA consent, data export',
        icon: 'shield',
        kind: 'link',
      },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    rows: [
      {
        id: 'push',
        title: 'Push Notifications',
        subtitle: 'Coaching tips, streaks, milestones',
        icon: 'bell',
        kind: 'toggle',
        toggleKey: 'push',
      },
      {
        id: 'digest',
        title: 'Email Digest',
        subtitle: 'Weekly wellness summary',
        icon: 'mail',
        kind: 'toggle',
        toggleKey: 'digest',
      },
      {
        id: 'provider',
        title: 'Provider Messages',
        subtitle: 'Messages from your care team',
        icon: 'chat',
        kind: 'toggle',
        toggleKey: 'provider',
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    rows: [
      {
        id: 'help',
        title: 'Getting Started',
        subtitle: 'Learn the basics of Invigorate Health',
        icon: 'book',
        kind: 'link',
      },
      {
        id: 'faqs',
        title: 'FAQs',
        subtitle: 'Answers to common questions',
        icon: 'help',
        kind: 'link',
      },
      {
        id: 'live-chat',
        title: 'Live Chat',
        subtitle: 'Message your care team',
        icon: 'chat',
        kind: 'link',
        href: '/(main)/coach/chat',
      },
      {
        id: 'terms',
        title: 'Terms & Privacy Policy',
        subtitle: 'Legal documents',
        icon: 'file',
        kind: 'link',
      },
    ],
  },
];

export const SETTINGS_PROFILE = {
  name: 'Dr. Greg Steinke',
  email: 'drgregsteinke@gmail.com',
  initials: 'GS',
  hwiScore: 86,
};
