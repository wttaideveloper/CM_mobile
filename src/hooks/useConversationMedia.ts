import { useCallback, useEffect, useState } from 'react';

import { getMockConversation } from '@/constants/chat';
import { fetchConversationMessages } from '@/services/message.service';
import { isApiConversationId } from '@/utils/conversation';
import { hydrateChatMessagesFromApi } from '@/utils/attachment.hydration';
import {
  buildCreatedAtLookup,
  galleryItemsFromMessages,
  type MediaGalleryItem,
} from '@/utils/conversationMedia';

type UseConversationMediaResult = {
  mediaItems: MediaGalleryItem[];
  docItems: MediaGalleryItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useConversationMedia(
  conversationId: string,
  currentUserId: string,
): UseConversationMediaResult {
  const [mediaItems, setMediaItems] = useState<MediaGalleryItem[]>([]);
  const [docItems, setDocItems] = useState<MediaGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isApiConversationId(conversationId)) {
        const { messages } = getMockConversation(conversationId, 'full');
        const createdAtByMessageId = new Map(
          messages.map((message, index) => [
            message.id,
            new Date(Date.now() - index * 86_400_000).toISOString(),
          ]),
        );

        setMediaItems(galleryItemsFromMessages(messages, createdAtByMessageId, 'media'));
        setDocItems(galleryItemsFromMessages(messages, createdAtByMessageId, 'docs'));
        return;
      }

      const apiMessages = [];
      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await fetchConversationMessages(conversationId, { cursor, limit: 50 });
        apiMessages.push(...response.items.filter((item) => !item.is_deleted && item.attachment_id));
        hasMore = response.pagination.has_more;
        cursor = response.pagination.next_cursor ?? undefined;
      }

      const createdAtByMessageId = buildCreatedAtLookup(apiMessages);
      const messages = await hydrateChatMessagesFromApi(apiMessages, currentUserId);

      setMediaItems(galleryItemsFromMessages(messages, createdAtByMessageId, 'media'));
      setDocItems(galleryItemsFromMessages(messages, createdAtByMessageId, 'docs'));
    } catch (loadError) {
      if (__DEV__) {
        console.warn('[Conversation media] Failed to load:', loadError);
      }
      setError('Could not load media.');
      setMediaItems([]);
      setDocItems([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { mediaItems, docItems, loading, error, reload: load };
}
