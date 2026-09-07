export const IST_TIMEZONE = 'Asia/Kolkata';

const HAS_TIMEZONE = /[zZ]|[+-]\d{2}:\d{2}$/;

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
