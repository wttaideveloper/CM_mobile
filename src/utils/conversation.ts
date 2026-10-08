const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isApiConversationId(conversationId: string): boolean {
  return UUID_RE.test(conversationId);
}

/**
 * Messaging is allowed only while status is `open`.
 * Archive uses `is_archived` separately and must not block send.
 */
export function isConversationClosed(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  if (!normalized) return false;
  return normalized !== 'open';
}

export function isConversationOpen(status: string): boolean {
  return !isConversationClosed(status);
}
