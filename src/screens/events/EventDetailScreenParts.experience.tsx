import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from 'react-native';

import { CalendarIcon, LockIcon, MapPinIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import { useEventMeetingLink } from '@/hooks/useEvents';
import type { Event } from '@/constants/events';
import type { EventAvailability } from '@/utils/event.mapper';
import {
  addEventToDeviceCalendar,
  hasValidEventTiming,
  resolveCalendarEnd,
} from '@/utils/eventCalendar';
import { PRIMARY, TEXT_MUTED, styles } from '@/screens/events/EventDetailScreen.styles';

/** Same open-in-browser pattern already used for training documents (MarketTrainingDetailBody.tsx) — no new dependency. */
async function openExternalUrl(url: string): Promise<void> {
  const target = url.startsWith('http') ? url : `https://${url}`;
  try {
    await Linking.openURL(target);
  } catch {
    Alert.alert('Unable to open link', 'Please try again.');
  }
}

export function EventSessionsSection({ sessions }: { sessions: Event['sessions'] }) {
  if (!sessions || sessions.length === 0) return null;

  return (
    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>Agenda</Text>
      <View style={[styles.experienceCard, { marginTop: 10 }]}>
        {sessions.map((session, index) => (
          <View
            key={session.id}
            style={[styles.experienceRow, index > 0 && styles.experienceRowBorder]}
          >
            <View style={styles.experienceRowHeader}>
              <Text style={styles.experienceRowTitle}>{session.title}</Text>
              {session.hasMeetingInfo ? (
                <View style={styles.experienceBadge}>
                  <Text style={styles.experienceBadgeText}>ONLINE</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.experienceRowMeta}>{session.dateTimeLabel}</Text>
            {session.speaker ? (
              <Text style={styles.experienceRowMeta}>Speaker: {session.speaker}</Text>
            ) : null}
            {session.location ? (
              <Text style={styles.experienceRowMeta}>📍 {session.location}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const PROVIDER_LABELS: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  teams: 'Microsoft Teams',
  other: 'Online meeting',
};

function meetingProviderLabel(provider: string | null): string {
  if (!provider) return 'Online meeting';
  return PROVIDER_LABELS[provider.trim().toLowerCase()] ?? provider;
}

export function EventMeetingSection({
  event,
  availability,
}: {
  event: Event;
  availability: EventAvailability;
}) {
  const isOnline = event.deliveryMode === 'online' || event.deliveryMode === 'hybrid';
  const isOver = availability.kind === 'cancelled' || availability.kind === 'completed';

  const { data, isLoading, isError, error, refetch } = useEventMeetingLink(event.id, {
    enabled: isOnline && !isOver,
  });

  if (!isOnline) return null;

  return (
    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>Meeting Information</Text>
      <View style={[styles.experienceCard, styles.experienceCardPad, { marginTop: 10 }]}>
        {isOver ? (
          <Text style={styles.experienceBodyText}>
            {availability.kind === 'cancelled'
              ? 'This event has been cancelled — meeting details are no longer available.'
              : 'This event has ended — meeting details are no longer available.'}
          </Text>
        ) : isLoading ? (
          <View style={styles.experienceStateRow}>
            <ActivityIndicator color={PRIMARY} size="small" />
            <Text style={styles.experienceBodyText}>Checking meeting access…</Text>
          </View>
        ) : isError ? (
          error.statusCode === 403 ? (
            <View style={styles.experienceStateRow}>
              <LockIcon size={14} color={TEXT_MUTED} />
              <Text style={styles.experienceBodyText}>
                Register for this event to unlock the meeting link.
              </Text>
            </View>
          ) : error.statusCode === 401 ? (
            <Text style={styles.experienceBodyText}>
              Please sign in again to view meeting details.
            </Text>
          ) : error.statusCode === 404 ? (
            <Text style={styles.experienceBodyText}>
              Meeting details are not available for this event.
            </Text>
          ) : (
            <EmptyState
              variant="error"
              compact
              title="Couldn't load meeting details"
              description={error.message || 'Something went wrong. Please try again.'}
              onAction={() => refetch()}
              actionLabel="Retry"
            />
          )
        ) : data?.meetingLink ? (
          <>
            <Text style={styles.experienceBodyText}>{meetingProviderLabel(data.meetingProvider)}</Text>
            <Pressable
              onPress={() => openExternalUrl(data.meetingLink!)}
              accessibilityRole="button"
              accessibilityLabel="Join meeting"
              style={({ pressed }) => [styles.joinMeetingBtn, pressed && styles.pressed]}
            >
              <Text style={styles.joinMeetingBtnText}>Join Meeting</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.experienceBodyText}>
            You&rsquo;re eligible to join — the meeting link will be shared closer to the event.
          </Text>
        )}
      </View>
    </View>
  );
}

export function EventResourcesSection({ resources }: { resources: Event['resources'] }) {
  if (!resources || resources.length === 0) return null;

  return (
    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>Resources</Text>
      <View style={[styles.experienceCard, { marginTop: 10 }]}>
        {resources.map((resource, index) => (
          <Pressable
            key={resource.id}
            onPress={() => openExternalUrl(resource.url)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${resource.title}`}
            style={({ pressed }) => [
              styles.experienceRow,
              index > 0 && styles.experienceRowBorder,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.experienceRowHeader}>
              <Text style={styles.experienceRowTitle} numberOfLines={2}>
                {resource.title}
              </Text>
              <Text style={styles.experienceActionText}>Open</Text>
            </View>
            {resource.type ? <Text style={styles.experienceRowMeta}>{resource.type}</Text> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function EventLocationSection({ event }: { event: Event }) {
  const isVenueRelevant = event.deliveryMode === 'in_person' || event.deliveryMode === 'hybrid';
  if (!isVenueRelevant || !event.venueAddress) return null;

  return (
    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>Location Details</Text>
      <View style={[styles.experienceCard, styles.experienceCardPad, { marginTop: 10 }]}>
        <View style={styles.experienceRowHeader}>
          <MapPinIcon size={14} color={TEXT_MUTED} />
          <Text style={[styles.experienceRowTitle, { fontWeight: '600' }]}>
            {event.venueAddress}
          </Text>
        </View>
        {event.venueMapUrl ? (
          <Pressable
            onPress={() => openExternalUrl(event.venueMapUrl!)}
            accessibilityRole="button"
            accessibilityLabel="View on map"
          >
            <Text style={[styles.experienceActionText, { marginTop: 8 }]}>View on map</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function EventInstructionsSection({ event }: { event: Event }) {
  if (!event.venueInstructions) return null;

  return (
    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>Instructions</Text>
      <View style={[styles.experienceCard, styles.experienceCardPad, { marginTop: 10 }]}>
        <Text style={styles.experienceBodyText}>{event.venueInstructions}</Text>
      </View>
    </View>
  );
}

/**
 * "Add to Calendar" (Phase 5D-1). Only rendered when the event has a valid
 * start date. The meeting link is included only when this event is online/
 * hybrid, not cancelled/completed, and the protected GET /{id}/meeting-link
 * fetch (same query the Meeting Information section already makes — React
 * Query dedupes the shared cache key, so this never issues a second request
 * on its own) has actually resolved a link for this user; otherwise the
 * calendar entry is built without it rather than falling back to the raw,
 * unauthenticated event.meeting_link.
 */
export function EventAddToCalendarAction({
  event,
  availability,
}: {
  event: Event;
  availability: EventAvailability;
}) {
  const isOnline = event.deliveryMode === 'online' || event.deliveryMode === 'hybrid';
  const isOver = availability.kind === 'cancelled' || availability.kind === 'completed';

  const { data: meetingAccess } = useEventMeetingLink(event.id, {
    enabled: isOnline && !isOver,
  });

  if (!hasValidEventTiming(event.startDate)) return null;

  const handlePress = () => {
    const start = event.startDate!;
    const end = resolveCalendarEnd(start, event.endDate ?? null);
    const location = event.location && event.location !== 'NA' ? event.location : '';
    const meetingUrl = isOnline && !isOver ? (meetingAccess?.meetingLink ?? null) : null;

    void addEventToDeviceCalendar({
      id: event.id,
      title: event.detailTitle,
      description: event.description,
      start,
      end,
      location,
      meetingUrl,
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Add to calendar"
      style={({ pressed }) => [styles.addToCalendarBtn, pressed && styles.pressed]}
    >
      <CalendarIcon size={16} color={PRIMARY} />
      <Text style={styles.addToCalendarBtnText}>Add to Calendar</Text>
    </Pressable>
  );
}
