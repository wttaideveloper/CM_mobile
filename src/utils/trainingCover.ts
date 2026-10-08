import { API_CONFIG } from '@/config';

/** Old mock Unsplash “girl exercising” used as training fallback — never show it. */
const MOCK_FALLBACK_MARKERS = [
  'photo-1571019613454-1cb2f99b2d8b',
] as const;

/** True when a real cover URL is available (not empty / not the mock fallback). */
export function hasTrainingCoverImage(url?: string | null): boolean {
  const value = typeof url === 'string' ? url.trim() : '';
  if (!value) return false;
  return !MOCK_FALLBACK_MARKERS.some((marker) => value.includes(marker));
}

/**
 * Cover images under /trainings/upload/ are public (GET 200 without Bearer).
 * Only treat other authenticated API media as needing auth if we ever point
 * covers there. Videos/PDFs stay behind auth — those are not cover URLs.
 */
export function trainingCoverUrlNeedsAuth(url?: string | null): boolean {
  const value = typeof url === 'string' ? url.trim() : '';
  if (!value || value.startsWith('data:')) return false;
  // Public training covers (upload CDN path)
  if (value.includes('/api/v1/trainings/upload/')) return false;
  try {
    const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
    if (base && value.startsWith(base) && value.includes('/api/v1/')) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * First usable cover from API fields (primary_image, gallery, etc.).
 * Returns the raw string — callers should run resolveAbsoluteApiUrl when needed.
 */
export function pickTrainingCoverRaw(
  ...candidates: Array<string | null | undefined>
): string {
  for (const candidate of candidates) {
    const value = typeof candidate === 'string' ? candidate.trim() : '';
    if (hasTrainingCoverImage(value)) return value;
  }
  return '';
}

/** First + last word initials from a title/name (e.g. "Pulse Yoga" → "PY"). */
export function trainingCoverInitials(name: string, max = 2): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].slice(0, max).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

/** Same light green used on training cards when there is no cover photo. */
export function trainingCoverColors(_seed?: string): {
  backgroundColor: string;
  color: string;
} {
  return {
    backgroundColor: '#d7e8db',
    color: '#257d3f',
  };
}
