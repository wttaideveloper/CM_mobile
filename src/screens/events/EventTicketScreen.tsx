import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import {
  useCancelRegistration,
  useEvent,
  useMyRegistrations,
  useRegistrationQrImage,
} from '@/hooks/useEvents';
import { InfoCard } from '@/screens/events/EventDetailScreenParts.shared';
import { PRIMARY, styles } from '@/screens/events/EventTicketScreen.styles';

export function EventTicketScreen() {
  const { eventId: rawEventId, registrationId: rawRegId } = useLocalSearchParams<{
    eventId: string;
    registrationId: string;
  }>();
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId ?? '';
  const registrationId = Array.isArray(rawRegId) ? rawRegId[0] : rawRegId ?? '';

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [isCancelling, setIsCancelling] = useState(false);

  const {
    registrations,
    isLoading: isLoadingRegistrations,
    isError: isRegistrationsError,
    refetch: refetchRegistrations,
  } = useMyRegistrations();
  const { event, isLoading: isLoadingEvent, isError: isEventError } = useEvent(eventId, {
    enabled: Boolean(eventId),
  });

  const registration = registrations.find((item) => item.registrationId === registrationId);

  const {
    imageUri,
    isLoading: isQrLoading,
    isError: isQrError,
    refetch: refetchQr,
  } = useRegistrationQrImage(eventId, registrationId, {
    enabled: Boolean(registration?.hasQr),
  });

  const cancelMutation = useCancelRegistration();
  const goBack = () => router.back();

  const isLoading = isLoadingRegistrations || (Boolean(eventId) && isLoadingEvent);

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

  if (isRegistrationsError) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="error"
          entity="your ticket"
          onAction={() => void refetchRegistrations()}
        />
      </View>
    );
  }

  if (!registration) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="notFound"
          title="Registration not found"
          description="We couldn't find this registration. It may have been removed."
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const canCancel = registration.registrationStatus === 'confirmed';

  function handleCancel() {
    Alert.alert(
      'Cancel registration?',
      `You'll lose your spot for ${registration!.eventTitle}. This can't be undone.`,
      [
        { text: 'Keep registration', style: 'cancel' },
        {
          text: 'Cancel registration',
          style: 'destructive',
          onPress: () => {
            setIsCancelling(true);
            cancelMutation.mutate(
              { eventId, registrationId },
              {
                onSuccess: () => {
                  setIsCancelling(false);
                  Alert.alert('Registration cancelled', undefined, [
                    { text: 'OK', onPress: () => router.back() },
                  ]);
                },
                onError: (error) => {
                  setIsCancelling(false);
                  Alert.alert(
                    'Couldn’t cancel',
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
          Your Ticket
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ticketCard}>
          <View
            style={[
              styles.statusPill,
              registration.bucket === 'cancelled' && styles.statusPillCancelled,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                registration.bucket === 'cancelled' && styles.statusPillTextCancelled,
              ]}
            >
              {registration.registrationStatusLabel}
            </Text>
          </View>

          <Text style={styles.eventTitle} numberOfLines={3}>
            {event?.detailTitle ?? registration.eventTitle}
          </Text>

          {event ? (
            <View style={styles.infoRow}>
              <InfoCard emoji="📅" label="Date & Time" value={event.schedule} />
              <InfoCard emoji="📍" label="Location" value={event.location} />
            </View>
          ) : isEventError ? (
            <Text style={styles.qrStateText}>
              Event details couldn&rsquo;t be loaded, but your registration is still shown below.
            </Text>
          ) : null}

          <View style={styles.qrWrap}>
            {!registration.hasQr ? (
              <View style={styles.qrState}>
                <Text style={styles.qrStateText}>
                  No QR ticket is available for this registration.
                </Text>
              </View>
            ) : isQrLoading ? (
              <View style={styles.qrState}>
                <ActivityIndicator color={PRIMARY} />
                <Text style={styles.qrStateText}>Loading your ticket…</Text>
              </View>
            ) : isQrError || !imageUri ? (
              <View style={styles.qrState}>
                <Text style={styles.qrStateText}>
                  Your QR ticket isn&rsquo;t available right now. Please try again.
                </Text>
                <Pressable
                  onPress={() => void refetchQr()}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading QR ticket"
                  style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.retryBtnText}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.qrImage}
                  contentFit="contain"
                  accessibilityLabel="Your event QR ticket"
                />
                <Text style={styles.qrCaption}>Show this QR code at check-in</Text>
              </>
            )}
          </View>

          <View style={styles.refRow}>
            <Text style={styles.refLabel}>REFERENCE</Text>
            <Text style={styles.refValue}>
              {registration.registrationId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        {canCancel ? (
          <View style={styles.cancelSection}>
            <Pressable
              onPress={handleCancel}
              disabled={isCancelling}
              accessibilityRole="button"
              accessibilityLabel="Cancel registration"
              accessibilityState={{ disabled: isCancelling }}
              style={({ pressed }) => [
                styles.cancelBtn,
                isCancelling && styles.cancelBtnDisabled,
                pressed && !isCancelling && styles.pressed,
              ]}
            >
              {isCancelling ? <ActivityIndicator color="#DC2626" size="small" /> : null}
              <Text style={styles.cancelBtnText}>
                {isCancelling ? 'Cancelling…' : 'Cancel Registration'}
              </Text>
            </Pressable>
          </View>
        ) : registration.bucket === 'cancelled' ? (
          <Text style={styles.cancelledNotice}>This registration has been cancelled.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
