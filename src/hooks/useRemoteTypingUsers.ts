import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { API_CONFIG } from '@/config';
import { fetchTypingUsers } from '@/services/conversation.service';
import type { TypingIndicatorResponse } from '@/types/typing.types';

type UseRemoteTypingUsersOptions = {
  conversationId: string;
  currentUserId: string;
  enabled: boolean;
};

export function useRemoteTypingUsers({
  conversationId,
  currentUserId,
  enabled,
}: UseRemoteTypingUsersOptions) {
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorResponse[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  useEffect(() => {
    const shouldPoll = enabled && isFocused;

    if (!shouldPoll) {
      setTypingUsers([]);
      return undefined;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const users = await fetchTypingUsers(conversationId);
        if (cancelled) return;

        setTypingUsers(
          users.filter((entry) => entry.is_typing && entry.user_id !== currentUserId),
        );
      } catch (error) {
        if (__DEV__) {
          console.warn('[Typing GET] Failed:', error);
        }
      }
    };

    void poll();
    const intervalId = setInterval(() => {
      void poll();
    }, API_CONFIG.TYPING_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [conversationId, currentUserId, enabled, isFocused]);

  return {
    typingUsers,
    isAnyoneTyping: typingUsers.length > 0,
  };
}
