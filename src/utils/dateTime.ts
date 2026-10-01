export const IST_TIMEZONE = 'Asia/Kolkata';

/** Exported for event.mapper.ts's meal/accommodation purchase/service-window parsing — see its own doc comment for why those fields need a different naive-timestamp fallback than parseApiDate's UTC default. */
export const HAS_TIMEZONE = /[zZ]|[+-]\d{2}:\d{2}$/;

/** Backend timestamps without timezone are treated as UTC. */
export function parseApiDate(iso: string): Date {
  const trimmed = iso.trim();
  if (!trimmed) {
    return new Date(Number.NaN);
  }

  const normalized = HAS_TIMEZONE.test(trimmed) ? trimmed : `${trimmed}Z`;
  return new Date(normalized);
}

export function getISTDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: IST_TIMEZONE });
}

export function isTodayIST(date: Date): boolean {
  return getISTDateKey(date) === getISTDateKey(new Date());
}

export function isYesterdayIST(date: Date): boolean {
  const yesterday = new Date(Date.now() - 86_400_000);
  return getISTDateKey(date) === getISTDateKey(yesterday);
}

export function formatISTTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatISTShortDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    timeZone: IST_TIMEZONE,
    month: 'short',
    day: 'numeric',
  });
}

export function formatISTDateTime(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Live / venue attendance timestamp from content API (`attended_at`). */
export function formatAttendanceDateTime(iso?: string | null): string | null {
  if (!iso?.trim()) return null;
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return iso.trim();
  return date.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Parse a session start from ISO / datetime strings or free-form schedule text.
 * Returns null when no usable start time is found.
 */
export function parseSessionStart(
  ...values: Array<string | null | undefined>
): Date | null {
  for (const value of values) {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) continue;

    const iso = parseApiDate(raw);
    if (!Number.isNaN(iso.getTime())) return iso;

    const native = new Date(raw);
    if (!Number.isNaN(native.getTime())) return native;

    // "30 Sep 2026, 3:00 PM" / "Sep 30 2026 15:00" style leftovers
    const cleaned = raw
      .replace(/\bat\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const retry = new Date(cleaned);
    if (!Number.isNaN(retry.getTime())) return retry;
  }
  return null;
}

export function formatSessionStartLabel(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
