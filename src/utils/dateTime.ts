import {
  DEFAULT_TIME_ZONE,
  normalizeTimeZone,
} from '@/constants/timeZones';

export { DEFAULT_TIME_ZONE, normalizeTimeZone } from '@/constants/timeZones';

export const IST_TIMEZONE = DEFAULT_TIME_ZONE;

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

/**
 * Parse a naive ISO datetime (`2026-10-08T18:00:00`, no offset) as wall-clock
 * time in an IANA zone (e.g. Africa/Dar_es_Salaam), returning the absolute Date.
 *
 * Avoids the common bug of appending `Z` then formatting in that zone
 * (18:00 → wrongly shown as 9:00 PM in UTC+3).
 */
export function parseWallDateTimeInTimeZone(
  wallIso: string,
  timeZone: string,
): Date {
  const trimmed = wallIso.trim();
  if (!trimmed) return new Date(Number.NaN);

  if (HAS_TIMEZONE.test(trimmed)) {
    return parseApiDate(trimmed);
  }

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/,
  );
  if (!match) {
    return parseApiDate(trimmed);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? '0');

  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const zone = normalizeTimeZone(timeZone);

  let dtf: Intl.DateTimeFormat;
  try {
    dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return new Date(desiredAsUtc);
  }

  const readZonedAsUtcMs = (instant: number): number => {
    const parts = dtf.formatToParts(new Date(instant));
    const map: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== 'literal') map[part.type] = part.value;
    }
    let h = Number(map.hour);
    if (h === 24) h = 0;
    return Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      h,
      Number(map.minute),
      Number(map.second),
    );
  };

  // desiredAsUtc treated as UTC instant → see what wall time that is in zone,
  // then shift so the wall time matches the requested components.
  const actualAsUtc = readZonedAsUtcMs(desiredAsUtc);
  let corrected = desiredAsUtc - (actualAsUtc - desiredAsUtc);

  // Second pass for DST boundaries.
  const actualAsUtc2 = readZonedAsUtcMs(corrected);
  corrected = desiredAsUtc - (actualAsUtc2 - corrected);

  return new Date(corrected);
}
