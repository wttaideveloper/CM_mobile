import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Alert, Linking, Platform } from 'react-native';

import {
  buildCalendarDescription,
  buildEventIcs,
  formatIcsUtc,
  hasValidEventTiming,
  resolveCalendarEnd,
  type EventCalendarDetails,
} from '@/utils/eventIcs';

export { buildCalendarDescription, buildEventIcs, hasValidEventTiming, resolveCalendarEnd };
export type { EventCalendarDetails };

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

/** Google Calendar's documented "quick add" template link — the web fallback, since expo-file-system/expo-sharing don't support web. */
function buildGoogleCalendarUrl(details: EventCalendarDetails): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: details.title,
    dates: `${formatIcsUtc(details.start)}/${formatIcsUtc(details.end)}`,
  });

  const detailText = buildCalendarDescription(details);
  if (detailText) {
    params.set('details', detailText);
  }
  if (details.location) {
    params.set('location', details.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Android opens the native calendar UI via expo-intent-launcher.
 * iOS writes a temporary .ics file and opens the OS share sheet,
 * letting the system process the ICS payload naturally. Web opens a
 * Google Calendar quick-add link since there's no native calendar app.
 * Every failure path shows an Alert rather than failing silently.
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

  if (Platform.OS === 'android') {
    try {
      const extras: Record<string, any> = {
        title: details.title,
        beginTime: details.start.getTime(),
        endTime: details.end.getTime(),
      };

      const descriptionText = buildCalendarDescription(details);
      if (descriptionText) {
        extras.description = descriptionText;
      }
      if (details.location) {
        extras.eventLocation = details.location;
      }

      await IntentLauncher.startActivityAsync('android.intent.action.INSERT', {
        data: 'content://com.android.calendar/events',
        extra: extras,
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('[eventCalendar] Failed to launch Android calendar intent:', error);
      }
      Alert.alert('Add to Calendar', 'Could not open the calendar app.');
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
