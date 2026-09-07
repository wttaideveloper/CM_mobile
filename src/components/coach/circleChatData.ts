export const CIRCLE_CHAT_INTRO =
  'A peer circle for daylight habits. Be kind, no medical advice.';

export const CIRCLE_CHAT_CONTACT = {
  initials: 'SC',
  name: 'Sunshine circle',
  status: '42 members · 6 online',
};

export const CIRCLE_CHAT_PEERS = [
  { initials: 'NA', bg: '#fff4e0', color: '#e08b00' },
  { initials: 'MB', bg: '#e7f0fd', color: '#1e6fd9' },
  { initials: 'PR', bg: '#f0eafb', color: '#6b46c1' },
  { initials: '+39', bg: '#e6f4e8', color: '#2f7d32' },
];

export type CircleChatMessage = {
  id: string;
  from: 'them' | 'me';
  sender?: string;
  senderColor?: string;
  text: string;
  time: string;
};

export const CIRCLE_CHAT_MESSAGES: CircleChatMessage[] = [
  {
    id: '1',
    from: 'them',
    sender: 'Nina Alvarez',
    senderColor: '#e08b00',
    text: 'Sunrise walk from Boulder this morning — 14 minutes of daylight before coffee. Who else is out?',
    time: '6:48 AM',
  },
  {
    id: '2',
    from: 'them',
    sender: 'Marcus Bell',
    senderColor: '#1e6fd9',
    text: 'Just finished mine. Cold but worth it — Sunshine score finally back above 70.',
    time: '7:02 AM',
  },
  {
    id: '3',
    from: 'me',
    text: 'Heading out now. Three of us from the Thursday group are in.',
    time: '7:15 AM',
  },
  {
    id: '4',
    from: 'them',
    sender: 'Priya Raman',
    senderColor: '#6b46c1',
    text: 'Reminder: Saturday circle meets at the reservoir trailhead, 7:30 AM. Bring water.',
    time: '8:30 AM',
  },
  {
    id: '5',
    from: 'them',
    sender: 'Nina Alvarez',
    senderColor: '#e08b00',
    text: 'Adding it to the group calendar now 🌞',
    time: '8:34 AM',
  },
];
