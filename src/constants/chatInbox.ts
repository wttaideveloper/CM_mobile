import type { ChatMessageStatus, ChatMode } from '@/constants/chat';

export type ChatInboxItem = {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageStatus?: ChatMessageStatus;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  status: string;
  avatarInitial: string;
  isOnline: boolean;
  mode: ChatMode;
  provider?: string;
  enterprise?: string;
};

export type GroupContact = {
  id: string;
  name: string;
  role: string;
  enterprise: string;
  avatarInitial: string;
  isOnline: boolean;
};

export const MOCK_CHAT_INBOX: ChatInboxItem[] = [
  {
    id: 'appointment-apt-1',
    name: 'Alex Martinez',
    lastMessage: 'Just comfortable workout clothes and a water bottle.',
    timestamp: '10:07 AM',
    unreadCount: 2,
    isGroup: false,
    isFavorite: true,
    status: 'open',
    avatarInitial: 'A',
    isOnline: true,
    mode: 'full',
    provider: 'Alex Martinez',
    enterprise: 'Pinnacle Wellness',
  },
  {
    id: 'group-care-team',
    name: 'Personal Training (Group)',
    lastMessage: 'Dr. Sarah: Meal plan updated for week 2.',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isGroup: true,
    status: 'open',
    avatarInitial: 'P',
    isOnline: true,
    mode: 'full',
    provider: 'Alex Martinez',
    enterprise: 'Pinnacle Wellness',
  },
  {
    id: 'service-yoga-1',
    name: 'Sarah Chen',
    lastMessage: 'Is the first session in-person or online?',
    timestamp: 'Mon',
    unreadCount: 0,
    isGroup: false,
    status: 'open',
    avatarInitial: 'S',
    isOnline: false,
    mode: 'preview',
    provider: 'Sarah Chen',
    enterprise: 'Harmony Health',
  },
  {
    id: 'appointment-apt-3',
    name: 'Dr. James Wilson',
    lastMessage: 'Great session today, thank you!',
    timestamp: 'Sun',
    unreadCount: 0,
    isGroup: false,
    status: 'closed',
    avatarInitial: 'J',
    isOnline: false,
    mode: 'readonly',
    provider: 'Dr. James Wilson',
    enterprise: 'Pinnacle Wellness',
  },
];

export const MOCK_GROUP_CONTACTS: GroupContact[] = [
  {
    id: 'c1',
    name: 'Alex Martinez',
    role: 'Personal Trainer',
    enterprise: 'Pinnacle Wellness',
    avatarInitial: 'A',
    isOnline: true,
  },
  {
    id: 'c2',
    name: 'Dr. Sarah Kim',
    role: 'Nutritionist',
    enterprise: 'Pinnacle Wellness',
    avatarInitial: 'S',
    isOnline: true,
  },
  {
    id: 'c3',
    name: 'Sarah Chen',
    role: 'Yoga Instructor',
    enterprise: 'Harmony Health',
    avatarInitial: 'S',
    isOnline: false,
  },
  {
    id: 'c4',
    name: 'Dr. James Wilson',
    role: 'Physiotherapist',
    enterprise: 'Pinnacle Wellness',
    avatarInitial: 'J',
    isOnline: false,
  },
  {
    id: 'c5',
    name: 'Maria Lopez',
    role: 'Wellness Coach',
    enterprise: 'Harmony Health',
    avatarInitial: 'M',
    isOnline: true,
  },
];
