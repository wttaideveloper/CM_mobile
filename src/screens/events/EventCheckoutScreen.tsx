import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { CircleCheckIcon, ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { useCheckoutEvent, useEvent, useMyRegistrations } from '@/hooks/useEvents';
import type { ApiError } from '@/types/api.types';
import type { EventOrderApiResponse } from '@/types/event.types';
import { InfoCard } from '@/screens/events/EventDetailScreenParts.shared';
import { PRIMARY, styles } from '@/screens/events/EventCheckoutScreen.styles';

const DEMO_FAILURE_MESSAGE =
  'This is a simulated demo failure — no payment was attempted and no charge was made.';

function buildCheckoutErrorMessage(error: ApiError): string {
  const raw = error.message?.trim();

  if (error.statusCode === 401) {
    return 'Please sign in again to complete checkout.';
  }
  if (error.statusCode === 404) {
    return 'This event or ticket type could not be found — it may have changed.';
  }
  if (error.statusCode === 0) {
    return 'Network error. Please check your connection and try again.';
  }
  // 400 (closed/full/cutoff/capacity) and 422 (validation) already carry a
  // specific, human-readable detail from the backend.
  return raw || 'Something went wrong during checkout. Please try again.';
}

export function EventCheckoutScreen() {
  const {
    id: rawId,
    participantName: rawName,
    participantEmail: rawEmail,
  } = useLocalSearchParams<{
    id: string;
    participantName: string;
    participantEmail: string;
  }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const participantName = Array.isArray(rawName) ? rawName[0] : rawName ?? '';
  const participantEmail = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail ?? '';

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();

  const { event, isLoading, isError } = useEvent(id, { enabled: Boolean(id) });
  const checkoutMutation = useCheckoutEvent();
  const { registrations, refetch: refetchMyRegistrations } = useMyRegistrations();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'summary' | 'success' | 'failure'>('summary');
  const [order, setOrder] = useState<EventOrderApiResponse | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);

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

  if (!event || isError || !participantName || !participantEmail) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="notFound"
          entity="checkout"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  if (event.isFree) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="empty"
          title="This event is free"
          description="No checkout is needed for this event — register directly instead."
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const ticketOptions = event.ticketOptions ?? [];
  const hasTicketOptions = ticketOptions.length > 0;
  const selectedTicket = hasTicketOptions
    ? ticketOptions.find((t) => t.id === selectedTicketId) ?? ticketOptions[0]
    : null;
  const priceLabel = selectedTicket ? selectedTicket.effectivePriceLabel : event.priceLabel;

  function runCheckout() {
    checkoutMutation.mutate(
      {
        id,
        payload: {
          participant_name: participantName,
          participant_email: participantEmail,
          ticket_type_id: selectedTicket ? selectedTicket.id : '',
          quantity: 1,
        },
      },
      {
        onSuccess: (data) => {
          setOrder(data);
          setPhase('success');
          void refetchMyRegistrations();
        },
        onError: (error) => {
          setFailureReason(buildCheckoutErrorMessage(error));
          setPhase('failure');
        },
      },
    );
  }

  function handlePayPress() {
    if (checkoutMutation.isPending) return;

    Alert.alert(
      'Demo Payment',
      `This is a demo checkout for ${priceLabel}. No real payment will be processed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Failure',
          style: 'destructive',
          onPress: () => {
            setFailureReason(DEMO_FAILURE_MESSAGE);
            setPhase('failure');
          },
        },
        { text: 'Simulate Success', onPress: runCheckout },
      ],
    );
  }

  // Best-effort: checkout also creates a companion registration server-side,
  // but that step can silently fail (see Phase 3 report, Backend Gaps) — only
  // offer "View QR Ticket" if we can actually find it in the refreshed list.
  const matchingRegistration = order
    ? registrations.find((r) => r.eventId === order.event_id)
    : undefined;

  if (phase === 'success' && order) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />
        <View style={styles.header}>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Payment Complete
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>DEMO PAYMENT</Text>
          </View>
          <View style={styles.resultIconWrapSuccess}>
            <CircleCheckIcon size={34} color={PRIMARY} />
          </View>
          <Text style={styles.resultTitle}>Payment successful!</Text>
          <Text style={styles.resultBody}>
            Your demo payment for {event.detailTitle} was confirmed. We&rsquo;ve sent a
            confirmation to {participantEmail}.
          </Text>

          <View style={styles.resultSummaryCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Amount</Text>
              <Text style={[styles.resultRowValue, styles.resultRowValueAmount]}>
                {order.currency} {order.amount}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Payment status</Text>
              <Text style={styles.resultRowValue}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Order reference</Text>
              <Text style={styles.resultRowValue}>{order.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.resultActions}>
            {matchingRegistration?.hasQr ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(main)/event/ticket',
                    params: {
                      eventId: order.event_id,
                      registrationId: matchingRegistration.registrationId,
                    },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel="View QR ticket"
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryBtnText}>View QR Ticket</Text>
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
              onPress={() => router.replace('/(main)/(tabs)/events')}
              accessibilityRole="button"
              accessibilityLabel="Back to events"
              style={({ pressed }) => [styles.textBtn, pressed && styles.pressed]}
            >
              <Text style={styles.textBtnText}>Back to Events</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'failure') {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />
        <View style={styles.header}>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Payment Failed
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>DEMO PAYMENT</Text>
          </View>
          <View style={styles.resultIconWrapFailure}>
            <Text style={{ fontSize: 30 }}>✕</Text>
          </View>
          <Text style={styles.resultTitle}>Payment failed</Text>
          <Text style={styles.resultBody}>{failureReason}</Text>

          <View style={styles.resultActions}>
            <LeafyGradientButton
              onPress={() => {
                setFailureReason(null);
                setPhase('summary');
              }}
              style={styles.primaryBtn}
              borderRadius={14}
            >
              <Text style={styles.primaryBtnText}>Retry Payment</Text>
            </LeafyGradientButton>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Back to event"
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryBtnText}>Back to Event</Text>
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
          Checkout
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

        {hasTicketOptions ? (
          <>
            <Text style={styles.sectionTitle}>Select Ticket</Text>
            <View style={styles.ticketList}>
              {ticketOptions.map((ticket) => {
                const isSelected = ticket.id === (selectedTicket?.id ?? ticketOptions[0].id);
                return (
                  <Pressable
                    key={ticket.id}
                    onPress={() => setSelectedTicketId(ticket.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${ticket.name}, ${ticket.effectivePriceLabel}`}
                    accessibilityState={{ selected: isSelected }}
                    style={[styles.ticketRow, isSelected && styles.ticketRowSelected]}
                  >
                    <Text style={styles.ticketName}>{ticket.name}</Text>
                    <Text style={styles.ticketPrice}>{ticket.effectivePriceLabel}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {hasTicketOptions ? 'Ticket' : 'Registration'}
            </Text>
            <Text style={styles.priceValue}>
              {hasTicketOptions ? selectedTicket!.name : 'Standard Registration'}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>{priceLabel}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Quantity</Text>
            <Text style={styles.priceValue}>1</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{priceLabel}</Text>
          </View>
        </View>

        <View style={styles.demoBanner}>
          <Text style={{ fontSize: 18 }}>⚠️</Text>
          <View style={styles.demoBannerTextWrap}>
            <Text style={styles.demoBannerTitle}>DEMO PAYMENT</Text>
            <Text style={styles.demoBannerBody}>
              No real money will be charged. This is a test checkout only.
            </Text>
          </View>
        </View>

        <LeafyGradientButton
          onPress={handlePayPress}
          disabled={checkoutMutation.isPending}
          style={styles.payBtn}
          borderRadius={14}
        >
          <View style={styles.payBtnContent}>
            {checkoutMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : null}
            <Text style={styles.payBtnText}>
              {checkoutMutation.isPending ? 'Processing…' : `Pay ${priceLabel} · Demo`}
            </Text>
          </View>
        </LeafyGradientButton>
      </ScrollView>
    </View>
  );
}
