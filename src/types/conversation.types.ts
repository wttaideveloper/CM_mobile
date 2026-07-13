export type ConversationParticipantInput = {
  role: string;
  user_id: string;
};

export type CreateConversationRequest = {
  context_id: string;
  context_type: string;
  conversation_type: string;
  participant_ids: ConversationParticipantInput[];
  subject: string;
};

export type ConversationParticipant = {
  id: string;
  user_id: string;
  role: string;
  last_read_at: string | null;
  joined_at: string;
};

export type Conversation = {
  id: string;
  tenant_id: string | null;
  status: string;
  conversation_type: string;
  is_read_only: boolean;
  subject: string;
  context_type: string;
  context_id: string;
  assigned_provider_id: string | null;
  expires_at: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_by: string;
  unread_count: number;
  participants: ConversationParticipant[];
  is_archived?: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type ConversationLastMessage = {
  sender_id: string;
  read_by: string[];
};

export type ConversationListItem = {
  id: string;
  status: string;
  conversation_type: string;
  subject: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message?: ConversationLastMessage | null;
  unread_count: number;
  assigned_provider_id: string | null;
  other_participant_user_id?: string | null;
  is_archived?: boolean;
  archived_at?: string | null;
  updated_at: string;
};

export type ArchiveConversationRequest = {
  archived: boolean;
};

export type ArchiveConversationResponse = {
  id: string;
  status: string;
  is_archived: boolean;
  archived_at: string | null;
  updated_at: string;
};

export type ConversationStatusResponse = {
  id: string;
  status: string;
  updated_at: string;
};

export type ConversationListQuery = {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export type ConversationSearchQuery = {
  q: string;
  provider_id?: string;
  page?: number;
  page_size?: number;
};

export type ConversationListResponse = {
  items: ConversationListItem[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
};
