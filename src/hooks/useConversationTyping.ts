import { useEffect, useRef } from 'react';

import { API_CONFIG } from '@/config';
import {
  typingStartViaSocket,
  typingStopViaSocket,
} from '@/services/socket/socket.typing.service';
import { updateTypingIndicator } from '@/services/conversation.service';

type UseConversationTypingOptions = {
  conversationId: string;
  draft: string;
  enabled: boolean;
  useSocket?: boolean;
};

export function useConversationTyping({
  conversationId,
  draft,
  enabled,
  useSocket = API_CONFIG.SOCKET_ENABLED,
}: UseConversationTypingOptions) {
  const isTypingRef = useRef(false);

  const sendTyping = (isTyping: boolean) => {
    if (!enabled) return;
    if (isTypingRef.current === isTyping) return;

    isTypingRef.current = isTyping;

    const action = isTyping
      ? useSocket
        ? typingStartViaSocket(conversationId)
        : updateTypingIndicator(conversationId, true)
      : useSocket
        ? typingStopViaSocket(conversationId)
        : updateTypingIndicator(conversationId, false);

    void action.catch((error) => {
      if (__DEV__) {
        console.warn('[Typing] Failed:', error);
      }
      isTypingRef.current = !isTyping;
    });
  };

  const stopTyping = () => {
    if (!isTypingRef.current) return;
    sendTyping(false);
  };

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    if (draft.length > 0) {
      sendTyping(true);
      return undefined;
    }

    stopTyping();
    return undefined;
  }, [conversationId, draft, enabled, useSocket]);

  useEffect(() => {
    return () => {
      if (!isTypingRef.current) return;

      isTypingRef.current = false;

      const action = useSocket
        ? typingStopViaSocket(conversationId)
        : updateTypingIndicator(conversationId, false);

      void action.catch(() => undefined);
    };
  }, [conversationId, useSocket]);

  return { stopTyping };
};
