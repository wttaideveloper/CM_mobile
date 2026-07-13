export type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachment_id: string | null;
  is_deleted: boolean;
  is_edited?: boolean;
  edited_at?: string | null;
  created_at: string;
  read_by: string[];
};

export type MessageListQuery = {
  cursor?: string;
  limit?: number;
};

export type MessageListResponse = {
  items: ApiMessage[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
    limit: number;
  };
};

export type MessageSearchQuery = {
  q: string;
  conversation_id?: string;
  provider_id?: string;
  page?: number;
  page_size?: number;
};

export type MessageSearchResponse = {
  items: ApiMessage[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
};

export type SendMessageRequest = {
  content: string;
  conversation_id: string;
  message_type: string;
  attachment_id?: string;
};

export type DeleteMessageResponse = {
  id: string;
  is_deleted: boolean;
  deleted_at: string;
};
