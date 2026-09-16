import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Linking, Platform } from 'react-native';

/**
 * Client-generated "Add to Calendar" support (Phase 5D-1). The backend does
 * have a GET /{event_id}/calendar.ics endpoint (calendar_service.py,
 * event_to_ics), but it is unauthenticated AND unconditionally embeds the
 * raw event.meeting_link for any published event — the exact leak Phase 5C
 * already found and refused to surface anywhere in the app. Since backend
 * code cannot be modified, the ICS content here is built entirely from data
 * the app already holds safely: public event fields (title/description/
 * dates/location) plus, only when present, the meeting link already
 * fetched through the protected GET /{id}/meeting-link flow (Phase 5C's
 * useEventMeetingLink) — never the raw unauthenticated field.
 */
export type EventCalendarDetails = {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location: string;
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
 * RFC5545 UTC form (YYYYMMDDTHHMMSSZ). Mirrors the backend's own _fmt()
 * (calendar_service.py): the app's start/end Date objects already come from
 * parseApiDate (dateTime.ts), which treats a timezone-less backend
 * timestamp as UTC — the same assumption the backend's own ICS generator
 * makes. See buildEventIcs's doc comment for the full timezone rationale.
 */
function formatIcsUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * The Event model's start_date/end_date columns carry no explicit UTC
 * offset, and the separate time_zone field (e.g. "Asia/Kolkata") is a
 * display-only label the backend never applies as an actual offset when
 * storing those columns — confirmed by calendar_service.py's own _fmt()
 * doing the identical no-offset-means-UTC treatment, and by dateTime.ts's
 * parseApiDate ("Backend timestamps without timezone are treated as UTC"),
 * which is what produced event.startDate/endDate in the first place. The
 * generated calendar entry therefore renders in the recipient's calendar
 * exactly as Event Detail already displays it elsewhere in this app — a
 * documented limitation, not a bug: a manual IST-style conversion here
 * would silently disagree with the rest of the UI for the same event.
 */
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

  if (details.description) {
    lines.push(`DESCRIPTION:${icsEscape(details.description)}`);
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

/** Google Calendar's documented "quick add" template link — the web fallback, since expo-file-system/expo-sharing don't support web. */
function buildGoogleCalendarUrl(details: EventCalendarDetails): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: details.title,
    dates: `${formatIcsUtc(details.start)}/${formatIcsUtc(details.end)}`,
  });

  const detailLines = [details.description, details.meetingUrl].filter(
    (part): part is string => Boolean(part),
  );
  if (detailLines.length > 0) {
    params.set('details', detailLines.join('\n\n'));
  }
  if (details.location) {
    params.set('location', details.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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

/**
 * Writes a temporary .ics file and opens the OS share sheet (iOS/Android) —
 * the same expo-file-system + expo-sharing pattern already used by
 * openChatAttachment.ts, no new dependency. Web has no filesystem/share
 * API in Expo, so it opens a Google Calendar quick-add link instead
 * (Linking, same as every other external link in this app). Every failure
 * path shows an Alert rather than failing silently.
 */
export async function addEventToDeviceCalendar(details: EventCalendarDetails): Promise<void> {
  if (Number.isNaN(details.start.getTime()) || Number.isNaN(details.end.getTime())) {
    Alert.alert('Add to Calendar', "This event doesn't have valid date/time information yet.");
    return;
  }

  if (Platform.OS === 'web') {
    try {
      await Linking.openURL(buildGoogleCalendarUrl(details));
    } catch {
      Alert.alert('Add to Calendar', 'Could not open Google Calendar. Please try again.');
    }
    return;
  }

  try {
    const ics = buildEventIcs(details);
    const path = `${FileSystem.cacheDirectory}event-${details.id}.ics`;
    await FileSystem.writeAsStringAsync(path, ics, { encoding: FileSystem.EncodingType.UTF8 });

    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Add to Calendar', 'No calendar app is available on this device.');
      return;
    }

    await Sharing.shareAsync(path, {
      mimeType: 'text/calendar',
      dialogTitle: 'Add to Calendar',
      UTI: 'com.apple.ical.ics',
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[eventCalendar] Failed to add event to calendar:', error);
    }
    Alert.alert('Add to Calendar', 'Could not add this event to your calendar. Please try again.');
  }
}
