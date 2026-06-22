export const SETTINGS_SECTIONS = [
  {
    id: 'account',
    title: 'ACCOUNT',
    items: [
      'Edit Profile',
      'Security & Password',
      'Notifications',
      'Privacy',
    ],
  },
  {
    id: 'enterprise',
    title: 'ENTERPRISE',
    items: [
      'Enterprise Profile',
      'Team Members',
      'Billing & Subscription',
      'Integrations',
    ],
  },
  {
    id: 'app',
    title: 'APP',
    items: [
      'Appearance',
      'Language',
      'Accessibility',
      'About Invigorate',
    ],
  },
] as const;

export const PROFILE_USER = {
  name: 'Sarah Johnson',
  email: 'sarah@pinnaclewellness.com',
  role: 'Enterprise Admin',
  avatarLetter: 'S',
};
