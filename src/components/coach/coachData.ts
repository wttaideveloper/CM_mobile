export const COACH_BG = '#f2fff3';
export const COACH_GREEN = '#257d3f';
export const COACH_TEAL = '#164744';
export const COACH_MUTED = '#7c9585';
export const COACH_SOFT = '#a8bdae';
export const COACH_BORDER = '#dbeadd';
export const COACH_BODY = '#4c6b58';
export const COACH_DOT = '#2f7d32';
export const COACH_CHAT_BG = '#e6f4e8';

export type CareTeamAction = 'chat' | 'people' | 'none';

export type CareTeamMember = {
  id: string;
  initials: string;
  name: string;
  role: string;
  time: string;
  message: string;
  avatarBg: string;
  avatarColor: string;
  online?: boolean;
  action: CareTeamAction;
};

export const CARE_TEAM_MEMBERS: CareTeamMember[] = [
  {
    id: 'anita',
    initials: 'AR',
    name: 'Dr. Anita Rao',
    role: 'Lifestyle physician',
    time: '2h ago',
    message:
      "Your fibre intake is trending up nicely. Let's review sleep at Thursday's consult.",
    avatarBg: '#e6f4e8',
    avatarColor: '#2f7d32',
    online: true,
    action: 'chat',
  },
  {
    id: 'lena',
    initials: 'LO',
    name: 'Coach Lena Ortiz',
    role: 'Nutrition coach',
    time: 'Yesterday',
    message:
      'Loved seeing the 80-day streak. Try adding a 15-minute morning walk this week.',
    avatarBg: '#fff4e0',
    avatarColor: '#e08b00',
    online: true,
    action: 'chat',
  },
  {
    id: 'care',
    initials: 'IH',
    name: 'Care Coordination',
    role: 'Invigorate Health team',
    time: 'Mon',
    message: 'Your lab results are ready to view in Personal Information.',
    avatarBg: '#e8f0fe',
    avatarColor: '#1e6fd9',
    action: 'none',
  },
  {
    id: 'community',
    initials: 'SC',
    name: 'Community · Sunshine circle',
    role: '42 members',
    time: 'Mon',
    message:
      'Nina shared a sunrise walk from Boulder. Three others joined today.',
    avatarBg: '#efe9fd',
    avatarColor: '#6b46c1',
    action: 'people',
  },
];

export const COMMUNITY_CIRCLE = {
  title: 'Community circle',
  body: '42 members are practising Sunshine today. Share your walk and encourage someone.',
  practising: '+39 practising now',
  avatars: ['#e6f4e8', '#e8f0fe', '#fff4e0'],
};
