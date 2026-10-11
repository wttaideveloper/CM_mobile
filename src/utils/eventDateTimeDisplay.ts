import {
  formatEventTimeZoneLabel,
  getEventDateKey,
  getEventTimeZoneAbbreviation,
  getEventTimeZoneLongName,
  getEventTimeZoneRegion,
  isEventTimeZoneFallback,
  resolveEventTimeZone,
} from '@/utils/dateTime';

/**
 * Pure presentation model for Event dates/times. Everything is derived from absolute instants plus the Event's own
 * IANA time_zone (the source of truth) — never the phone's zone — so the UI components only lay out strings.
 */

export type EventInstantParts = {
  /** "Sun, Oct 11, 2026" — weekday and year included so it is never ambiguous. */
  date: string;
  /** "1:30 PM" */
  time: string;
  /** "EDT" */
  zoneAbbr: string;
  /** "New York" (empty for UTC) */
  zoneRegion: string;
  /** "EDT · New York" */
  zoneLabel: string;
  /** "Sunday, October 11, 2026" */
  spokenDate: string;
  /** "Eastern Daylight Time, New York" */
  zoneSpoken: string;
  /** "Sunday, October 11, 2026 at 1:30 PM Eastern Daylight Time, New York" */
  spoken: string;
};

export function getEventInstantParts(date: Date, zone?: string | null): EventInstantParts {
  const timeZone = resolveEventTimeZone(zone);
  const format = (options: Intl.DateTimeFormatOptions) => date.toLocaleString('en-US', { timeZone, ...options });
  const zoneRegion = getEventTimeZoneRegion(zone);
  const spokenDate = format({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const time = format({ hour: 'numeric', minute: '2-digit' });
  const longName = getEventTimeZoneLongName(date, zone);
  const zoneSpoken = zoneRegion ? `${longName}, ${zoneRegion}` : longName;
  return {
    date: format({ weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time,
    zoneAbbr: getEventTimeZoneAbbreviation(date, zone),
    zoneRegion,
    zoneLabel: formatEventTimeZoneLabel(date, zone),
    spokenDate,
    zoneSpoken,
    spoken: `${spokenDate} at ${time} ${zoneSpoken}`,
  };
}

export type EventScheduleLine = {
  /** "Starts" / "Ends" for multi-day events, null otherwise. */
  label: string | null;
  date: string;
  /** "1:40 PM" or, for a same-day event, the range "1:40 PM – 6:00 PM". */
  time: string;
};

export type EventScheduleDisplay = {
  kind: 'tba' | 'single' | 'same-day' | 'multi-day';
  lines: EventScheduleLine[];
  /** "EDT · New York", "EDT → EST · New York" across a DST change, or "UTC · time zone not set". Empty for 'tba'. */
  timeZoneLabel: string;
  /** True when the Event has no valid time_zone and is being shown as UTC. */
  timeZoneIsFallback: boolean;
  accessibilityLabel: string;
};

const TBA: EventScheduleDisplay = {
  kind: 'tba',
  lines: [],
  timeZoneLabel: '',
  timeZoneIsFallback: false,
  accessibilityLabel: 'Date and time to be announced',
};

/**
 * Same-day events show the date once with a concise time range; events whose end falls on another calendar day
 * *in the Event's zone* (multi-day, or crossing midnight) show Starts/Ends each with its own date and time.
 */
export function buildEventScheduleDisplay(
  start: Date | null | undefined,
  end: Date | null | undefined,
  zone?: string | null,
): EventScheduleDisplay {
  if (!start || Number.isNaN(start.getTime())) return TBA;

  const from = getEventInstantParts(start, zone);
  const hasEnd = Boolean(end && !Number.isNaN(end.getTime()) && end.getTime() > start.getTime());
  const to = hasEnd ? getEventInstantParts(end as Date, zone) : null;
  const fallback = isEventTimeZoneFallback(zone);

  let kind: EventScheduleDisplay['kind'];
  let lines: EventScheduleLine[];
  if (!to) {
    kind = 'single';
    lines = [{ label: null, date: from.date, time: from.time }];
  } else if (getEventDateKey(start, zone) === getEventDateKey(end as Date, zone)) {
    kind = 'same-day';
    lines = [{ label: null, date: from.date, time: `${from.time} – ${to.time}` }];
  } else {
    kind = 'multi-day';
    lines = [
      { label: 'Starts', date: from.date, time: from.time },
      { label: 'Ends', date: to.date, time: to.time },
    ];
  }

  const region = from.zoneRegion;
  const abbreviation = to && to.zoneAbbr !== from.zoneAbbr ? `${from.zoneAbbr} → ${to.zoneAbbr}` : from.zoneAbbr;
  const timeZoneLabel = fallback
    ? 'UTC · time zone not set'
    : `${abbreviation}${region ? ` · ${region}` : ''}`;

  const zoneSpoken = fallback ? 'Coordinated Universal Time, time zone not set' : from.zoneSpoken;
  const accessibilityLabel =
    kind === 'multi-day'
      ? `Starts ${from.spokenDate} at ${from.time}. Ends ${to!.spokenDate} at ${to!.time}. ${zoneSpoken}`
      : kind === 'same-day'
        ? `${from.spokenDate}, from ${from.time} to ${to!.time}, ${zoneSpoken}`
        : `${from.spokenDate} at ${from.time}, ${zoneSpoken}`;

  return { kind, lines, timeZoneLabel, timeZoneIsFallback: fallback, accessibilityLabel };
}
