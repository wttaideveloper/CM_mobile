export type SettingsMenuItem = {
  id: string;
  label: string;
  subtitle: string;
  emoji: string;
};

export type SettingsSection = {
  id: string;
  title: string;
  items: SettingsMenuItem[];
};

export const PROFILE_USER = {
  name: 'Sarah Johnson',
  email: 'sarah@email.com',
  role: 'Customer',
  avatarLetter: 'S',
  verified: true,
  stats: {
    bookings: 42,
    saved: 12,
    reviews: 8,
  },
};

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'account',
    title: 'ACCOUNT',
    items: [
      {
        id: 'edit-profile',
        label: 'Edit Profile',
        subtitle: 'Name and email',
        emoji: '👤',
      },
      {
        id: 'security',
        label: 'Security',
        subtitle: 'Password, 2FA',
        emoji: '🔒',
      },
      {
        id: 'notifications',
        label: 'Notification Preferences',
        subtitle: 'Email, push, SMS, in-app',
        emoji: '🔔',
      },
      {
        id: 'privacy',
        label: 'Privacy & Data',
        subtitle: 'Manage your data',
        emoji: '🛡',
      },
    ],
  },
  {
    id: 'preferences',
    title: 'PREFERENCES',
    items: [
      {
        id: 'saved-enterprises',
        label: 'Saved Enterprises',
        subtitle: '12 saved',
        emoji: '❤️',
      },
      {
        id: 'booking-history',
        label: 'Booking History',
        subtitle: '42 past bookings',
        emoji: '📋',
      },
      {
        id: 'payment-methods',
        label: 'Payment Methods',
        subtitle: '2 cards saved',
        emoji: '💳',
      },
      {
        id: 'language',
        label: 'Language',
        subtitle: 'English (US)',
        emoji: '🌐',
      },
    ],
  },
  {
    id: 'support',
    title: 'SUPPORT',
    items: [
      {
        id: 'help-centre',
        label: 'Help Centre',
        subtitle: 'FAQs and guides',
        emoji: '❓',
      },
      {
        id: 'rate-app',
        label: 'Rate Invigorate',
        subtitle: 'Leave a review',
        emoji: '⭐',
      },
      {
        id: 'terms',
        label: 'Terms & Privacy',
        subtitle: 'Legal',
        emoji: '📄',
      },
    ],
  },
];

export const APP_VERSION = 'Invigorate Health v2.1.0';
