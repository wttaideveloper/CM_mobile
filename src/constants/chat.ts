export type ChatMode = 'preview' | 'full' | 'readonly';

export type ChatMessageStatus = 'sent' | 'delivered' | 'read';

export type ChatAttachmentType = 'image' | 'pdf' | 'word' | 'video' | 'audio';

export type ChatMessage = {
  id: string;
  sender: 'user' | 'provider' | 'system';
  /** Display name shown above bubble in group chats (WhatsApp-style). */
  senderName?: string;
  timestamp: string;
  text?: string;
  status?: ChatMessageStatus;
  messageType?: 'text' | 'attachment' | 'voice' | 'deleted' | 'archived' | 'markdown';
  attachment?: {
    type: ChatAttachmentType;
    name: string;
    size: string;
    thumbnail?: string;
    /** Authenticated download URL for documents (pdf, word). */
    uri?: string;
    duration?: string;
    storage: 'S3' | 'Azure Blob';
  };
  /** API attachment_id — used to fetch download_url when not embedded on the message. */
  attachmentId?: string;
  voice?: {
    duration: string;
    transcript: string;
    uri?: string;
    fileName?: string;
  };
  reactions?: { emoji: string; count: number }[];
  isEdited?: boolean;
  versionCount?: number;
  isArchived?: boolean;
};

export type ChatConversationMeta = {
  id: string;
  title: string;
  provider: string;
  enterprise: string;
  avatarInitial: string;
  isOnline: boolean;
  isGroup: boolean;
  members: string[];
  mode: ChatMode;
  previewUsed: number;
  previewLimit: number;
  planUsed: number;
  planLimit: number | null;
  planName: string;
  hasOlderMessages: boolean;
  olderCursor: string;
  loadedCount: number;
};

export const CHAT_PAGE_SIZE = 20;

/** Preview mode free-message cap (static demo). */
export const PREVIEW_MESSAGE_LIMIT = 10;

export const CHAT_PLAN_LIMITS = {
  free: 50,
  basic: 500,
  premium: null,
} as const;

export const AI_CONVERSATION_SUMMARY =
  'Patient asked about session format and preparation. Provider confirmed in-person or online options and shared a meal plan PDF. Next step: arrive 10 min early on Tuesday.';

export const AI_MEETING_SUMMARY =
  'Session focus: strength training. Discussed warm-up routine, hydration, and follow-up booking in 2 weeks.';

const PREVIEW_MESSAGES: ChatMessage[] = [
  { id: 'm1', text: 'Hi! I have a question before booking.', sender: 'user', timestamp: '9:13 AM', status: 'read', messageType: 'text' },
  { id: 'm2', text: 'Hello! Happy to help. What would you like to know?', sender: 'provider', timestamp: '9:14 AM', messageType: 'text' },
  { id: 'm3', text: 'Is the first session in-person or online?', sender: 'user', timestamp: '9:15 AM', status: 'delivered', messageType: 'text' },
  {
    id: 'm4',
    text: 'Both options are available. Most clients start in-person.',
    sender: 'provider',
    timestamp: '9:16 AM',
    messageType: 'text',
    reactions: [{ emoji: '👍', count: 1 }],
  },
  {
    id: 'm5',
    text: 'What should I bring for the first session?',
    sender: 'user',
    timestamp: '9:17 AM',
    status: 'read',
    messageType: 'text',
  },
  {
    id: 'm6',
    text: 'Just comfortable workout clothes and a water bottle.',
    sender: 'provider',
    timestamp: '9:18 AM',
    messageType: 'text',
  },
  {
    id: 'm7',
    text: 'Perfect. Can I book for Tuesday at 10 AM?',
    sender: 'user',
    timestamp: '9:19 AM',
    status: 'delivered',
    messageType: 'text',
  },
  {
    id: 'm8',
    text: 'Yes, Tuesday at 10 AM is open. Shall I reserve it for you?',
    sender: 'provider',
    timestamp: '9:20 AM',
    messageType: 'text',
    reactions: [{ emoji: '✅', count: 1 }],
  },
];

const GROUP_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'g1',
    text: 'Welcome to the group! Ask questions and share updates here.',
    sender: 'provider',
    senderName: 'Alex Martinez',
    timestamp: '10:00 AM',
    messageType: 'text',
  },
  {
    id: 'g2',
    text: 'Thanks everyone — excited to get started!',
    sender: 'user',
    timestamp: '10:02 AM',
    status: 'read',
    messageType: 'text',
  },
  {
    id: 'g3',
    text: 'Meal plan for week 2 is ready. Please check before Tuesday.',
    sender: 'provider',
    senderName: 'Dr. Sarah Kim',
    timestamp: '10:05 AM',
    messageType: 'text',
  },
  {
    id: 'g4',
    text: 'Reviewed it — looks great!',
    sender: 'user',
    timestamp: '10:08 AM',
    status: 'read',
    messageType: 'text',
  },
  {
    id: 'g5',
    text: 'Group session is tomorrow at 10 AM. Same studio room.',
    sender: 'provider',
    senderName: 'Alex Martinez',
    timestamp: '10:12 AM',
    messageType: 'text',
    reactions: [{ emoji: '👍', count: 2 }],
  },
  {
    id: 'g6',
    text: 'Works for me. See you all tomorrow!',
    sender: 'user',
    timestamp: '10:14 AM',
    status: 'delivered',
    messageType: 'text',
  },
  {
    id: 'g7',
    text: 'I will bring the progress notes to share.',
    sender: 'provider',
    senderName: 'Dr. Sarah Kim',
    timestamp: '10:16 AM',
    messageType: 'text',
  },
  {
    id: 'g8',
    text: 'Thanks! Looking forward to it.',
    sender: 'user',
    timestamp: '10:18 AM',
    status: 'read',
    messageType: 'text',
  },
];

function getGroupMessages(title: string, isNewGroup: boolean): ChatMessage[] {
  if (isNewGroup) {
    return [
      {
        id: 'sys-created',
        text: `You created group "${title}"`,
        sender: 'system',
        timestamp: 'Today',
        messageType: 'text',
      },
      {
        id: 'sys-encrypt',
        text: 'Messages in this group are private. Only members can read and send messages.',
        sender: 'system',
        timestamp: '',
        messageType: 'text',
      },
      ...GROUP_CHAT_MESSAGES.slice(0, 6),
    ];
  }

  return [
    {
      id: 'sys-group',
      text: 'Group · Messages are visible to all members',
      sender: 'system',
      timestamp: 'Mon, 9:00 AM',
      messageType: 'text',
    },
    ...GROUP_CHAT_MESSAGES.slice(0, 7),
  ];
}

const FULL_MESSAGES: ChatMessage[] = [
  { id: 'sys-1', text: 'Group chat · 3 members · Real-time via Socket.IO', sender: 'system', timestamp: 'Mon, 9:00 AM' },
  { id: 'sys-2', text: 'Loaded last 20 messages · Cursor: msg_2019_04_01', sender: 'system', timestamp: 'Mon, 9:00 AM' },
  {
    id: 'm1',
    text: 'Thanks for confirming my booking!',
    sender: 'user',
    timestamp: '10:01 AM',
    status: 'read',
    messageType: 'text',
    reactions: [{ emoji: '❤️', count: 1 }, { emoji: '🙏', count: 1 }],
  },
  {
    id: 'm2',
    text: 'You are all set for Tuesday at 10 AM. Please arrive 10 minutes early.',
    sender: 'provider',
    timestamp: '10:02 AM',
    messageType: 'text',
  },
  {
    id: 'm3',
    sender: 'user',
    timestamp: '10:04 AM',
    status: 'read',
    messageType: 'attachment',
    attachment: {
      type: 'image',
      name: 'progress-photo.jpg',
      size: '1.2 MB',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=140&fit=crop',
      storage: 'S3',
    },
  },
  {
    id: 'm4',
    sender: 'provider',
    timestamp: '10:05 AM',
    messageType: 'attachment',
    attachment: {
      type: 'pdf',
      name: 'Meal-Plan-Week1.pdf',
      size: '840 KB',
      storage: 'Azure Blob',
    },
    text: 'Here is your meal plan for week 1.',
  },
  {
    id: 'm5',
    sender: 'user',
    timestamp: '10:06 AM',
    status: 'delivered',
    messageType: 'voice',
    voice: {
      duration: '0:24',
      transcript: 'Should I bring anything for the session tomorrow?',
    },
  },
  {
    id: 'm6',
    text: 'Just comfortable workout clothes and a water bottle.',
    sender: 'provider',
    timestamp: '10:07 AM',
    messageType: 'text',
    isEdited: true,
    versionCount: 2,
  },
  {
    id: 'm7',
    text: 'This message was deleted',
    sender: 'user',
    timestamp: '10:08 AM',
    messageType: 'deleted',
  },
  {
    id: 'm8',
    text: '**Pre-session checklist:**\n• Arrive 10 min early\n• Bring water bottle\n• Wear comfortable clothes',
    sender: 'provider',
    timestamp: '10:09 AM',
    messageType: 'markdown',
  },
  {
    id: 'm9',
    sender: 'provider',
    timestamp: '10:10 AM',
    messageType: 'attachment',
    attachment: {
      type: 'word',
      name: 'Consent-Form.docx',
      size: '320 KB',
      storage: 'S3',
    },
  },
  {
    id: 'm10',
    sender: 'provider',
    timestamp: '10:11 AM',
    messageType: 'attachment',
    attachment: {
      type: 'video',
      name: 'warm-up-demo.mp4',
      size: '8.4 MB',
      duration: '1:12',
      thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=120&fit=crop',
      storage: 'S3',
    },
  },
  {
    id: 'm11',
    sender: 'user',
    timestamp: '10:12 AM',
    status: 'sent',
    messageType: 'attachment',
    attachment: {
      type: 'audio',
      name: 'voice-note.m4a',
      size: '156 KB',
      duration: '0:18',
      storage: 'Azure Blob',
    },
  },
  {
    id: 'm12',
    text: 'Archived: Old scheduling thread from last month',
    sender: 'system',
    timestamp: '10:13 AM',
    messageType: 'archived',
    isArchived: true,
  },
];

const READONLY_MESSAGES: ChatMessage[] = [
  { id: 'sys-1', text: 'Service completed · Read-only · 48 hours remaining', sender: 'system', timestamp: 'Yesterday, 4:00 PM' },
  { id: 'm1', text: 'Great session today, thank you!', sender: 'user', timestamp: '3:45 PM', status: 'read', messageType: 'text' },
  { id: 'm2', text: 'Glad you enjoyed it! Progress notes shared below.', sender: 'provider', timestamp: '3:50 PM', messageType: 'text' },
  {
    id: 'm3',
    sender: 'provider',
    timestamp: '3:51 PM',
    messageType: 'attachment',
    attachment: { type: 'pdf', name: 'Session-Summary.pdf', size: '420 KB', storage: 'S3' },
    text: 'AI meeting summary attached.',
  },
];

export function getMockConversation(
  conversationId: string,
  mode: ChatMode = 'preview',
  overrides?: Partial<Pick<ChatConversationMeta, 'title' | 'provider' | 'enterprise'>> & {
    members?: string[];
  },
): { meta: ChatConversationMeta; messages: ChatMessage[] } {
  const title = overrides?.title ?? 'Personal Training';
  const provider = overrides?.provider ?? 'Alex Martinez';
  const enterprise = overrides?.enterprise ?? 'Pinnacle Wellness';
  const isNewGroup = conversationId.startsWith('group-');
  const isGroup = isNewGroup || conversationId.includes('group');
  const members =
    overrides?.members ??
    (isGroup ? [provider, 'Dr. Sarah Kim', 'You'] : [provider, 'You']);

  if (isGroup) {
    const messages = getGroupMessages(title, isNewGroup);

    return {
      meta: {
        id: conversationId,
        title,
        provider,
        enterprise,
        avatarInitial: title.charAt(0).toUpperCase() || 'G',
        isOnline: true,
        isGroup: true,
        members,
        mode: isNewGroup ? 'full' : mode,
        previewUsed: 0,
        previewLimit: PREVIEW_MESSAGE_LIMIT,
        planUsed: isNewGroup ? 0 : 48,
        planLimit: isNewGroup ? null : CHAT_PLAN_LIMITS.basic,
        planName: 'Basic',
        hasOlderMessages: false,
        olderCursor: '',
        loadedCount: messages.length,
      },
      messages,
    };
  }

  const messages =
    mode === 'full' ? FULL_MESSAGES : mode === 'readonly' ? READONLY_MESSAGES : PREVIEW_MESSAGES;

  return {
    meta: {
      id: conversationId,
      title,
      provider,
      enterprise,
      avatarInitial: provider.charAt(0).toUpperCase(),
      isOnline: mode !== 'readonly',
      isGroup: false,
      members,
      mode,
      previewUsed: mode === 'preview' ? 5 : 0,
      previewLimit: PREVIEW_MESSAGE_LIMIT,
      planUsed: mode === 'full' ? 120 : 0,
      planLimit: CHAT_PLAN_LIMITS.basic,
      planName: 'Basic',
      hasOlderMessages: mode === 'full',
      olderCursor: 'msg_2019_03_15',
      loadedCount: mode === 'preview' ? PREVIEW_MESSAGES.length : CHAT_PAGE_SIZE,
    },
    messages,
  };
}
