/**
 * Pure, platform-free half of the Add-to-Calendar support (ICS text, description, timing guards) so it can be
 * unit-tested without Expo/React Native. eventCalendar.ts re-exports everything here and adds the device actions.
 */
export type EventCalendarDetails = {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
  /** The Event-zone schedule text (event.schedule, e.g. "Oct 11 · 1:40 PM – 6:00 PM EDT · New York"), added to the description so the Event's own time stays visible after the calendar converts it to the viewer's zone. */
  schedule?: string | null;
  /** Must already be authorization-checked by the caller — see file header. */
  meetingUrl?: string | null;
};

function icsEscape(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\r\n/g, '\\n')
    .replace(/\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * RFC5545 UTC form (YYYYMMDDTHHMMSSZ). start/end are absolute instants — the mapper resolves the API's naive
 * wall-clock timestamps in the Event's own timezone — so the UTC stamp is the exact moment, and each calendar app
 * shows it in the viewer's zone. buildCalendarDescription() keeps the Event-zone time in the text.
 */
export function formatIcsUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * event.startDate/endDate are absolute instants: the mapper reads the API's
 * naive start_date/end_date as wall-clock time in the Event's own IANA
 * time_zone (an explicit offset is kept as-is), so the UTC ICS stamps below
 * land on the right moment in any recipient calendar. Server-generated
 * calendar_service.py _fmt() still treats a no-offset value as UTC, so its
 * downloads can differ for non-UTC events — not changed here.
 */
/** Description with the Event-zone schedule first (when known), then the event description and meeting link. */
export function buildCalendarDescription(details: EventCalendarDetails): string {
  const scheduleLine = details.schedule ? `Event time: ${details.schedule}` : null;
  return [scheduleLine, details.description, details.meetingUrl]
    .filter((part): part is string => Boolean(part))
    .join('\n\n');
}

export function buildEventIcs(details: EventCalendarDetails): string {
  const now = formatIcsUtc(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invigorate Health//Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${details.id}@invigoratehealth`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsUtc(details.start)}`,
    `DTEND:${formatIcsUtc(details.end)}`,
    `SUMMARY:${icsEscape(details.title)}`,
  ];

  const description = buildCalendarDescription({ ...details, meetingUrl: null });
  if (description) {
    lines.push(`DESCRIPTION:${icsEscape(description)}`);
  }
  if (details.location) {
    lines.push(`LOCATION:${icsEscape(details.location)}`);
  }
  if (details.meetingUrl) {
    lines.push(`URL:${icsEscape(details.meetingUrl)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}


/** Whether there's enough real timing data to offer the action at all — endDate may be missing (see resolveCalendarEnd), but a valid start is required. */
export function hasValidEventTiming(start: Date | null | undefined): start is Date {
  return Boolean(start && !Number.isNaN(start.getTime()));
}

/** When the backend has no end_date, default to start + 1 hour rather than the backend's own calendar_service.py fallback (now + 1 hour), which is unrelated to the event's actual start time. */
export function resolveCalendarEnd(start: Date, end: Date | null | undefined): Date {
  if (end && !Number.isNaN(end.getTime()) && end.getTime() > start.getTime()) {
    return end;
  }
  return new Date(start.getTime() + 60 * 60 * 1000);
}
