import { isSafeHttpUrl, sanitizeChatText } from '@/utils/sanitizeChatText';

const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]]|www\.[^\s<]+[^\s<.,:;"')\]])/gi;

export type ChatTextPart = {
  type: 'text' | 'link';
  value: string;
};

export function splitTextWithLinks(text: string): ChatTextPart[] {
  const safeText = sanitizeChatText(text);
  const parts: ChatTextPart[] = [];
  let lastIndex = 0;

  for (const match of safeText.matchAll(URL_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: safeText.slice(lastIndex, index) });
    }

    const raw = match[0];
    // Only treat as a tappable link when the scheme is http(s).
    if (isSafeHttpUrl(raw)) {
      parts.push({ type: 'link', value: raw });
    } else {
      parts.push({ type: 'text', value: raw });
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < safeText.length) {
    parts.push({ type: 'text', value: safeText.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value: safeText }];
}

/** Returns a safe http(s) URL, or null if the link must not be opened. */
export function normalizeChatLink(url: string): string | null {
  const trimmed = url.trim();
  if (!isSafeHttpUrl(trimmed)) {
    return null;
  }

  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
}
