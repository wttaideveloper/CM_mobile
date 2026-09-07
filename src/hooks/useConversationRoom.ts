import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { API_CONFIG } from '@/config';
import {
  joinConversationRoom,
  leaveConversationRoom,
} from '@/services/socket/socket.room.service';
import { getSocket } from '@/services/socket/socket.client';

type UseConversationRoomOptions = {
  conversationId: string;
  enabled: boolean;
};

export function useConversationRoom({ conversationId, enabled }: UseConversationRoomOptions) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled || !API_CONFIG.SOCKET_ENABLED) {
        return undefined;
      }

      const join = () => {
        void joinConversationRoom(conversationId);
      };

      join();

      const socket = getSocket();
      socket?.on('connect', join);

      return () => {
        socket?.off('connect', join);
        void leaveConversationRoom(conversationId);
      };
    }, [conversationId, enabled]),
  );
}
