export type TypingIndicatorRequest = {
  is_typing: boolean;
};

export type TypingIndicatorResponse = {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
};

export type TypingUsersResponse = TypingIndicatorResponse[];
