import type { CoachChatMessage } from '@/components/coach/coachChatData';

export const BUSINESS_CHAT_CONTACT = {
  initials: 'VR',
  name: 'Verdant Roots Kitchen',
  status: 'Online · replies in ~2h',
};

export const BUSINESS_CHAT_MESSAGES: CoachChatMessage[] = [
  {
    id: '1',
    from: 'them',
    text: 'Hi Greg — thanks for following Verdant Roots. The weekly greens box still has Tuesday delivery slots open this week.',
    time: '9:04 AM',
  },
  {
    id: '2',
    from: 'me',
    text: 'Perfect. Can I swap Thursday for Tuesday once, and add the cook-along class?',
    time: '9:11 AM',
  },
  {
    id: '3',
    from: 'them',
    text: 'Yes — Tuesday is locked in. I’ll hold a seat for Saturday’s cook-along. Tap Book on the class listing when you’re ready.',
    time: '9:14 AM',
  },
];
