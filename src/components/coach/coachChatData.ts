export const COACH_CHAT_PAGE = '#f2fff3';
export const COACH_CHAT_GREEN = '#257d3f';
export const COACH_CHAT_TEAL = '#164744';
export const COACH_CHAT_BORDER = '#dbeadd';
export const COACH_CHAT_MUTED = '#7c9585';
export const COACH_CHAT_SOFT = '#a8bdae';
export const COACH_CHAT_INCOMING = '#33513f';
export const COACH_CHAT_CHIP_BG = '#e6f4e8';
export const COACH_CHAT_CHIP = '#2f7d32';
export const COACH_CHAT_DATE = '#4c6b58';
export const COACH_CHAT_ONLINE = '#8ef2a4';
export const COACH_CHAT_INPUT_BORDER = '#d6ecd9';

export const COACH_CHAT_CONTACT = {
  initials: 'AR',
  name: 'Dr. Anita Rao',
  status: 'Online · replies in ~1h',
};

export type CoachChatMessage = {
  id: string;
  from: 'them' | 'me';
  text: string;
  time: string;
};

export const COACH_CHAT_MESSAGES: CoachChatMessage[] = [
  {
    id: '1',
    from: 'them',
    text: 'Morning Greg — I reviewed your week. Fibre intake is up and your HWI™ climbed 8 points. Nicely done.',
    time: '8:12 AM',
  },
  {
    id: '2',
    from: 'me',
    text: 'Thanks! Sleep still feels light though — I wake around 4am most nights.',
    time: '8:20 AM',
  },
  {
    id: '3',
    from: 'them',
    text: 'That often tracks with late meals. Try finishing dinner three hours before bed this week and log Rest each morning.',
    time: '8:24 AM',
  },
  {
    id: '4',
    from: 'me',
    text: 'Will do. Should I book a consult to go deeper?',
    time: '8:26 AM',
  },
  {
    id: '5',
    from: 'them',
    text: 'Yes — Thursday 16:30 is open. Tap the calendar icon above and I will see the request.',
    time: '8:31 AM',
  },
];

export const COACH_CHAT_QUICK_REPLIES = [
  'Thanks!',
  'Can we reschedule?',
  'Share my logs',
];
