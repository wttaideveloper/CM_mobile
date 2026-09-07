import type { Dispatch, SetStateAction } from 'react';

import type { ChatInboxItem } from '@/constants/chatInbox';

export type InboxFilter = 'All' | 'Unread' | 'Favorites' | 'Groups';
export type InboxView = 'active' | 'archived';

export const INBOX_FILTERS: InboxFilter[] = ['All', 'Unread', 'Favorites', 'Groups'];

export type ChatInboxPatchState = {
  setInboxItems: Dispatch<SetStateAction<ChatInboxItem[]>>;
  setArchivedItems: Dispatch<SetStateAction<ChatInboxItem[]>>;
  setSearchResults: Dispatch<SetStateAction<ChatInboxItem[]>>;
  setSelectedChat: Dispatch<SetStateAction<ChatInboxItem | null>>;
};
