import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { API_CONFIG } from '@/config';
import {
  subscribeToTypingEvents,
} from '@/services/socket/socket.typing.service';

type UseSocketTypingOptions = {
  conversationId: string;
  currentUserId: string;
  enabled: boolean;
};

export function useSocketTyping({
  conversationId,
  currentUserId,
  enabled,
}: UseSocketTypingOptions) {
  const [isAnyoneTyping, setIsAnyoneTyping] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || !API_CONFIG.SOCKET_ENABLED) {
        setIsAnyoneTyping(false);
        return undefined;
      }

      const unsubscribe = subscribeToTypingEvents((event) => {
        if (event.conversation_id !== conversationId) {
          return;
        }

        if (event.user_id === currentUserId) {
          return;
        }

        setIsAnyoneTyping(Boolean(event.is_typing));
      });

      return () => {
        unsubscribe();
        setIsAnyoneTyping(false);
      };
    }, [conversationId, currentUserId, enabled]),
  );

  return { isAnyoneTyping };
}
