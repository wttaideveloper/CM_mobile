import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { openServiceConversation } from '@/services/conversation.service';
import type { ServiceListItem } from '@/types/service.types';
import { chatHref } from '@/utils/chatNavigation';

type ServiceChatTarget = Pick<ServiceListItem, 'id' | 'name' | 'provider' | 'enterpriseName'>;

export function useOpenServiceChat() {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);

  const openServiceChat = useCallback(
    async (service: ServiceChatTarget) => {
      if (isOpening) return;

      setIsOpening(true);

      try {
        const conversation = await openServiceConversation({
          serviceName: service.name,
        });

        router.push(
          chatHref(conversation.id, {
            mode: 'preview',
            serviceId: service.id,
            title: service.name,
            provider: service.provider ?? undefined,
            enterprise: service.enterpriseName !== 'NA' ? service.enterpriseName : undefined,
          }),
        );
      } catch (error) {
        const message =
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: string }).message)
            : 'Could not open chat. Please try again.';

        Alert.alert('Chat unavailable', message);
      } finally {
        setIsOpening(false);
      }
    },
    [isOpening, router],
  );

  return { openServiceChat, isOpeningChat: isOpening };
}
