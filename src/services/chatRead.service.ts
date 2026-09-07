import { markConversationAsRead } from '@/services/conversation.service';
import { markMessageReadViaRest } from '@/services/socket/socket.typing.service';

let activeConversationId: string | null = null;
let activeLatestIncomingMessageId: string | null = null;

export function setActiveChatConversation(conversationId: string | null): void {
  activeConversationId = conversationId;
}

export function setActiveChatLatestIncomingMessageId(messageId: string | null): void {
  activeLatestIncomingMessageId = messageId;
}

export async function markChatConversationAndMessagesRead(
  conversationId: string,
  latestIncomingMessageId?: string | null,
): Promise<void> {
  await markConversationAsRead(conversationId).catch((error) => {
    if (__DEV__) {
      console.warn('[ChatRead] Conversation mark read failed:', error);
    }
  });

  const messageId = latestIncomingMessageId ?? activeLatestIncomingMessageId;
  if (messageId) {
    await markMessageReadViaRest(messageId).catch((error) => {
      if (__DEV__) {
        console.warn('[ChatRead] Message mark read failed:', error);
      }
    });
  }
}

export async function markActiveChatReadOnLogout(): Promise<void> {
  if (!activeConversationId) return;

  const conversationId = activeConversationId;
  const latestIncomingMessageId = activeLatestIncomingMessageId;

  activeConversationId = null;
  activeLatestIncomingMessageId = null;

  await markChatConversationAndMessagesRead(conversationId, latestIncomingMessageId);
}
