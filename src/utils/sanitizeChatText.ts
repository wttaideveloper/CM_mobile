/**
 * §7 client-side sanitization for chat / LLM / knowledge text.
 * Allowlist approach: no HTML tags; links only http(s).
 * Safe for normal messages — appearance unchanged for plain text.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAG = /<\/?[a-zA-Z][^>]*>/g;
const DANGEROUS_SCHEME =
  /^(?:javascript|data|vbscript|file|about|blob|intent|content):/i;

/**
 * Strip HTML-like markup and control characters from display text.
 * Does not change normal plain-text or simple markdown (**bold**, • bullets).
 */
export function sanitizeChatText(input: string): string {
  if (!input) return '';

  let text = input.replace(CONTROL_CHARS, '');

  // Drop tags before and after a light entity decode (blocks double-encoded tags).
  text = text.replace(HTML_TAG, '');
  text = text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&amp;/gi, '&');
  text = text.replace(HTML_TAG, '');

  return text;
}

/**
 * True only for http/https URLs (blocks javascript:, data:, etc.).
 */
export function isSafeHttpUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || DANGEROUS_SCHEME.test(trimmed)) {
    return false;
  }

  const withScheme =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : trimmed.startsWith('www.')
        ? `https://${trimmed}`
        : trimmed;

  try {
    const parsed = new URL(withScheme);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
