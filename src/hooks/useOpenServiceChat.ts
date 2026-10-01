import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { openServiceConversation } from '@/services/conversation.service';
import type { ServiceListItem } from '@/types/service.types';
import { chatHref } from '@/utils/chatNavigation';

type ServiceChatTarget = Pick<
  ServiceListItem,
  'id' | 'name' | 'provider' | 'providerUserId' | 'enterpriseName'
>;

export function useOpenServiceChat() {
  const router = useRouter();
  const openingIdRef = useRef<string | null>(null);
  const [openingServiceId, setOpeningServiceId] = useState<string | null>(null);

  const openServiceChat = useCallback(
    async (service: ServiceChatTarget) => {
      console.log('[ServiceChat] STEP 2 — openServiceChat() started', {
        serviceId: service.id,
        serviceName: service.name,
        providerName: service.provider,
        providerUserId: service.providerUserId,
        enterpriseName: service.enterpriseName,
        alreadyOpening: openingIdRef.current,
      });

      if (openingIdRef.current) {
        console.log('[ServiceChat] STEP 2 skipped — chat open already in progress');
        return;
      }

      openingIdRef.current = service.id;
      setOpeningServiceId(service.id);
      console.log('[ServiceChat] STEP 3 — calling openServiceConversation (POST /conversations)');

      try {
        const conversation = await openServiceConversation({
          serviceId: service.id,
          serviceName: service.name,
          providerId: service.providerUserId,
          providerName: service.provider,
        });

        const href = chatHref(conversation.id, {
          mode: 'preview',
          serviceId: service.id,
          title: service.name,
          provider: service.provider ?? undefined,
          enterprise: service.enterpriseName,
        });

        console.log('[ServiceChat] STEP 6 — conversation ready, navigating to chat screen', {
          conversationId: conversation.id,
          status: conversation.status,
          subject: conversation.subject,
          contextType: conversation.context_type,
          contextId: conversation.context_id,
          isReadOnly: conversation.is_read_only,
          serviceId: service.id,
          href,
        });

        router.push(href);
        console.log('[ServiceChat] STEP 7 — router.push() called');
      } catch (error) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: string }).message)
            : 'Could not open chat. Please try again.';

        console.log('[ServiceChat] FAILED — could not start conversation', {
          serviceId: service.id,
          serviceName: service.name,
          message,
          error,
        });

        Alert.alert('Chat unavailable', message);
      } finally {
        openingIdRef.current = null;
        setOpeningServiceId(null);
        console.log('[ServiceChat] STEP 8 — openServiceChat() finished (spinner cleared)');
      }
    },
    [router],
  );

  return {
    openServiceChat,
    openingServiceId,
    isOpeningChat: openingServiceId != null,
  };
}
