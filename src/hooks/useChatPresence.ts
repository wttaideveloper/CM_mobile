import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { fetchUserLastSeen, updatePresenceStatus } from '@/services/presence.service';
import type { PresenceStatus } from '@/types/presence.types';

const PRESENCE_POLL_MS = 30_000;

type Options = {
  otherUserId: string | null;
  enabled: boolean;
  markSelfOnline?: boolean;
};

/** Polls the other participant's presence while the chat screen is focused. */
export function useChatPresence({ otherUserId, enabled, markSelfOnline = false }: Options) {
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

  const applyPresence = useCallback((status: PresenceStatus, seenAt: string | null) => {
    setIsOtherUserOnline(status === 'online');
    setLastSeenAt(seenAt);
  }, []);

  const refreshOtherPresence = useCallback(async () => {
    if (!enabled || !otherUserId) return;

    try {
      const data = await fetchUserLastSeen(otherUserId);
      applyPresence(data.status, data.last_seen_at);
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ User presence fetch failed:', error);
      }
    }
  }, [applyPresence, enabled, otherUserId]);

  useFocusEffect(
    useCallback(() => {
      if (markSelfOnline) {
        void updatePresenceStatus('online').catch((error) => {
          if (__DEV__) {
            console.warn('⚠️ Set presence online on chat enter failed:', error);
          }
        });
      }

      if (!enabled || !otherUserId) return undefined;

      void refreshOtherPresence();

      const interval = setInterval(() => {
        void refreshOtherPresence();
      }, PRESENCE_POLL_MS);

      return () => {
        clearInterval(interval);
      };
    }, [enabled, markSelfOnline, otherUserId, refreshOtherPresence]),
  );

  return {
    isOtherUserOnline,
    lastSeenAt,
    setIsOtherUserOnline,
    refreshOtherPresence,
  };
}
