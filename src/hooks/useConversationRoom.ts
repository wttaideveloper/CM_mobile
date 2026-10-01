import { useEffect } from 'react';

import { API_CONFIG } from '@/config';
import {
  joinConversationRoom,
  leaveConversationRoom,
} from '@/services/socket/socket.room.service';
import { getSocket, watchSocket } from '@/services/socket/socket.client';
import type { Socket } from 'socket.io-client';

type UseConversationRoomOptions = {
  conversationId: string;
  enabled: boolean;
};

export function useConversationRoom({ conversationId, enabled }: UseConversationRoomOptions) {
  useEffect(() => {
    if (!enabled || !API_CONFIG.SOCKET_ENABLED) {
      return undefined;
    }

    const join = () => {
      void joinConversationRoom(conversationId);
    };

    let attached: Socket | null = null;

    join();

    const unwatch = watchSocket((socket) => {
      if (attached === socket) return;
      attached?.off('connect', join);
      attached = socket;
      socket.on('connect', join);
      if (socket.connected) {
        join();
      }
    });

    return () => {
      unwatch();
      attached?.off('connect', join);
      void leaveConversationRoom(conversationId);
    };
  }, [conversationId, enabled]);
}
