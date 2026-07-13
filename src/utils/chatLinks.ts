const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]]|www\.[^\s<]+[^\s<.,:;"')\]])/gi;

export type ChatTextPart = {
  type: 'text' | 'link';
  value: string;
};

export function splitTextWithLinks(text: string): ChatTextPart[] {
  const parts: ChatTextPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    parts.push({ type: 'link', value: match[0] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value: text }];
}

export function normalizeChatLink(url: string): string {
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
}
