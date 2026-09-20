import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { useEvent, useMyRegistrations, useMyWaitlist } from '@/hooks/useEvents';
import { useDetailBack } from '@/hooks/useDetailBack';
import {
  EventDetailContent,
  EventDetailFooter,
  EventDetailHero,
  getEventRegisterLabel,
} from '@/screens/events/EventDetailScreenParts';
import { getEventAvailability } from '@/utils/event.mapper';
import { PRIMARY, styles } from '@/screens/events/EventDetailScreen.styles';

export function EventDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const router = useRouter();
  const goBack = useDetailBack();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch all registrations to check if user is already registered.
  const { registrations } = useMyRegistrations();

  const { event, isLoading, isError } = useEvent(id, { enabled: Boolean(id) });
  const { entries: waitlistEntries } = useMyWaitlist(undefined, { enabled: Boolean(event?.isFull) });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      </View>
    );
  }

  if (!event || isError) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="notFound"
          entity="event"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const fillPercent =
    event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;
  const spotsRemaining = event.capacity - event.registered;

  const myRegistration = registrations.find(
    (r) => r.eventId === id && r.registrationStatus !== 'cancelled'
  );
  const isRegistered = Boolean(myRegistration);
  
  // A waitlist promotion creates a confirmed registration, so it will be caught by isRegistered.
  // Waitlist entries that are merely "waiting" do not confer registered status.

  const availability = getEventAvailability(event);
  let ctaLabel: string;
  let onCtaPress: (() => void) | undefined;
  switch (availability.kind) {
    case 'available':
      if (isRegistered) {
        ctaLabel = 'View Ticket';
        onCtaPress = () => router.push({ pathname: '/(main)/event/ticket', params: { eventId: id, registrationId: myRegistration!.registrationId } });
      } else {
        ctaLabel = getEventRegisterLabel(event);
        onCtaPress = () => router.push({ pathname: '/(main)/event/register', params: { id } });
      }
      break;
    case 'full': {
      if (isRegistered) {
        ctaLabel = 'View Ticket';
        onCtaPress = () => router.push({ pathname: '/(main)/event/ticket', params: { eventId: id, registrationId: myRegistration!.registrationId } });
      } else {
        const activeWaitlist = waitlistEntries.find((entry) => entry.eventId === id && (entry.status === 'waiting' || entry.status === 'payment_pending'));
        if (activeWaitlist) {
          if (activeWaitlist.status === 'payment_pending') {
            ctaLabel = `Pay ${event.priceLabel} & Confirm`;
            // Navigate to register (checkout) with waitlist_id
            onCtaPress = () => router.push({ pathname: '/(main)/event/register', params: { id, waitlist_id: activeWaitlist.id } });
          } else {
            ctaLabel = "You're on the Waitlist";
            onCtaPress = () => router.push('/(main)/event/my-waitlist');
          }
        } else {
          ctaLabel = 'Join Waitlist';
          onCtaPress = () => router.push({ pathname: '/(main)/event/waitlist', params: { id } });
        }
      }
      break;
    }
    default:
      if (isRegistered) {
        ctaLabel = 'View Ticket';
        onCtaPress = () => router.push({ pathname: '/(main)/event/ticket', params: { eventId: id, registrationId: myRegistration!.registrationId } });
      } else {
        ctaLabel = availability.label;
        onCtaPress = undefined;
      }
  }

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.body}>
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 76 }}
        >
          <EventDetailHero
            event={event}
            isFavorite={isFavorite}
            onBack={goBack}
            onToggleFavorite={() => setIsFavorite((current) => !current)}
          />
          <EventDetailContent
            event={event}
            fillPercent={fillPercent}
            spotsRemaining={spotsRemaining}
            availability={availability}
            isRegistered={isRegistered}
          />
        </ScrollView>

        <EventDetailFooter
          ctaLabel={ctaLabel}
          paddingBottom={insets.bottom + 10}
          onPress={onCtaPress}
          onContactPress={() => router.push({ pathname: '/(main)/event/contact', params: { id } })}
        />
      </View>
    </View>
  );
}
