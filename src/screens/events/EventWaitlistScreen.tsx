import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { CircleCheckIcon, ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { useEvent, useJoinWaitlist, useLeaveWaitlist } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types/api.types';
import { getEventAvailability } from '@/utils/event.mapper';
import { InfoCard } from '@/screens/events/EventDetailScreenParts.shared';
import { PRIMARY, styles } from '@/screens/events/EventWaitlistScreen.styles';

function buildWaitlistErrorMessage(error: ApiError): string {
  const raw = error.message?.trim();

  if (error.statusCode === 401) {
    return 'Please sign in again to join the waitlist.';
  }
  if (error.statusCode === 404) {
    return 'This event could not be found — it may have been removed.';
  }
  if (error.statusCode === 0) {
    return 'Network error. Please check your connection and try again.';
  }
  return raw || 'Something went wrong while joining the waitlist. Please try again.';
}

export function EventWaitlistScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const user = useAuthStore((state) => state.user);

  const { event, isLoading, isError } = useEvent(id, { enabled: Boolean(id) });
  const joinMutation = useJoinWaitlist();
  const leaveMutation = useLeaveWaitlist();

  const [phase, setPhase] = useState<'confirm' | 'success'>('confirm');
  const [entryId, setEntryId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const goBack = () => router.back();

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={styles.center}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      </View>
    );
  }

  if (!event || isError) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState variant="notFound" entity="event" onAction={goBack} actionLabel="Go back" />
      </View>
    );
  }

  const participantEmail = user?.email?.trim() ?? '';
  const participantName = user?.fullName?.trim() || participantEmail;

  if (!participantEmail) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="error"
          title="Sign-in required"
          description="Please sign in again to join the waitlist."
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const availability = getEventAvailability(event);

  // Defensive: only reachable intentionally from a "full" state, but the
  // event's own data is always authoritative — re-check before offering to join.
  if (phase === 'confirm' && availability.kind !== 'full') {
    const isAvailable = availability.kind === 'available';
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="empty"
          title={isAvailable ? 'A spot just opened up!' : availability.label}
          description={
            isAvailable
              ? 'This event now has availability — you can register directly instead of waitlisting.'
              : 'This event is no longer accepting waitlist requests.'
          }
          onAction={
            isAvailable
              ? () => router.replace({ pathname: '/(main)/event/register', params: { id } })
              : goBack
          }
          actionLabel={isAvailable ? 'Register Now' : 'Go back'}
        />
      </View>
    );
  }

  function handleJoin() {
    if (joinMutation.isPending) return;
    setJoinError(null);

    joinMutation.mutate(
      { id, payload: { participant_name: participantName, participant_email: participantEmail } },
      {
        onSuccess: (data) => {
          setEntryId(data.id);
          setPhase('success');
        },
        onError: (error) => setJoinError(buildWaitlistErrorMessage(error)),
      },
    );
  }

  function handleLeave() {
    if (!entryId || leaveMutation.isPending) return;

    Alert.alert(
      'Leave waitlist?',
      `You'll lose your place in line for ${event!.detailTitle}.`,
      [
        { text: 'Stay on waitlist', style: 'cancel' },
        {
          text: 'Leave Waitlist',
          style: 'destructive',
          onPress: () => {
            leaveMutation.mutate(
              { eventId: id, entryId: entryId! },
              {
                onSuccess: () => {
                  Alert.alert('You’ve left the waitlist', undefined, [
                    { text: 'OK', onPress: goBack },
                  ]);
                },
                onError: (error) => {
                  Alert.alert(
                    'Couldn’t leave waitlist',
                    error.message?.trim() || 'Something went wrong. Please try again.',
                  );
                },
              },
            );
          },
        },
      ],
    );
  }

  if (phase === 'success') {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />
        <View style={styles.header}>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Waitlist Confirmation
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultIconWrap}>
            <CircleCheckIcon size={34} color={PRIMARY} />
          </View>
          <Text style={styles.resultTitle}>You&rsquo;re on the waitlist!</Text>
          <Text style={styles.resultBody}>
            We&rsquo;ll email {participantEmail} if a spot opens up for {event.detailTitle}.
          </Text>

          <View style={styles.resultSummaryCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Event</Text>
              <Text style={styles.resultRowValue}>{event.detailTitle}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Status</Text>
              <Text style={styles.resultRowValue}>Waitlisted</Text>
            </View>
            {entryId ? (
              <View style={styles.resultRow}>
                <Text style={styles.resultRowLabel}>Reference</Text>
                <Text style={styles.resultRowValue}>{entryId.slice(0, 8).toUpperCase()}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.resultActions}>
            {entryId ? (
              <Pressable
                onPress={handleLeave}
                disabled={leaveMutation.isPending}
                accessibilityRole="button"
                accessibilityLabel="Leave waitlist"
                accessibilityState={{ disabled: leaveMutation.isPending }}
                style={({ pressed }) => [
                  styles.leaveBtn,
                  leaveMutation.isPending && styles.leaveBtnDisabled,
                  pressed && !leaveMutation.isPending && styles.pressed,
                ]}
              >
                {leaveMutation.isPending ? <ActivityIndicator color="#DC2626" size="small" /> : null}
                <Text style={styles.leaveBtnText}>
                  {leaveMutation.isPending ? 'Leaving…' : 'Leave Waitlist'}
                </Text>
              </Pressable>
            ) : null}

            <LeafyGradientButton
              onPress={() => router.push('/(main)/event/my-events')}
              style={styles.primaryBtn}
              borderRadius={14}
            >
              <Text style={styles.primaryBtnText}>View My Events</Text>
            </LeafyGradientButton>

            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="View event"
              style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
            >
              <Text style={styles.textBtnText}>View Event</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={20} color="#111111" />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Join Waitlist
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle} numberOfLines={2}>
            {event.detailTitle}
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <InfoCard emoji="📅" label="Date & Time" value={event.schedule} />
            </View>
            <View style={styles.summaryItem}>
              <InfoCard emoji="📍" label="Location" value={event.location} />
            </View>
          </View>
        </View>

        <View style={styles.infoBanner}>
          <Text style={{ fontSize: 18 }}>⏳</Text>
          <View style={styles.infoBannerTextWrap}>
            <Text style={styles.infoBannerTitle}>This event is currently full</Text>
            <Text style={styles.infoBannerBody}>
              Join the waitlist and we&rsquo;ll keep your place in line. We&rsquo;ll email you if a
              spot opens up.
            </Text>
          </View>
        </View>

        {joinError ? (
          <View style={styles.submitBanner}>
            <Text style={styles.submitBannerText}>{joinError}</Text>
          </View>
        ) : null}

        <View style={styles.spacer} />

        <LeafyGradientButton
          onPress={handleJoin}
          disabled={joinMutation.isPending}
          style={styles.joinBtn}
          borderRadius={14}
        >
          <View style={styles.joinBtnContent}>
            {joinMutation.isPending ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
            <Text style={styles.joinBtnText}>
              {joinMutation.isPending ? 'Joining…' : 'Join Waitlist'}
            </Text>
          </View>
        </LeafyGradientButton>
      </ScrollView>
    </View>
  );
}
