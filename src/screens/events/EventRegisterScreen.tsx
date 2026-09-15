import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { CircleCheckIcon, ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { useEvent, useRegisterForEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types/api.types';
import type { EventRegistrationResult } from '@/types/event.types';
import { InfoCard } from '@/screens/events/EventDetailScreenParts.shared';
import { PRIMARY, styles } from '@/screens/events/EventRegisterScreen.styles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOCKED_STATUSES = new Set(['cancelled', 'completed', 'archived', 'suspended']);

function buildErrorMessage(error: ApiError): string {
  const raw = error.message?.trim();

  if (error.statusCode === 401) {
    return 'Please sign in again to register for this event.';
  }
  if (error.statusCode === 404) {
    return 'This event could not be found — it may have been removed.';
  }
  if (error.statusCode === 0) {
    return 'Network error. Please check your connection and try again.';
  }
  // 400 (closed/full/cutoff) and 422 (validation) already carry a specific,
  // human-readable detail from the backend — surface it directly.
  return raw || 'Something went wrong while registering. Please try again.';
}

export function EventRegisterScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const user = useAuthStore((state) => state.user);

  const { event, isLoading, isError } = useEvent(id, { enabled: Boolean(id) });
  const registerMutation = useRegisterForEvent();

  const [name, setName] = useState(user?.fullName?.trim() ?? '');
  const [email, setEmail] = useState(user?.email?.trim() ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<EventRegistrationResult | null>(null);

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
        <EmptyState
          variant="notFound"
          entity="event"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const rawStatus = (event.rawStatus ?? '').toLowerCase();
  const isBlockedStatus = BLOCKED_STATUSES.has(rawStatus);
  const registrationOpen = event.registrationOpen ?? true;
  const isFull = event.isFull ?? false;
  const isPaid = !event.isFree;

  let blockReason: string | null = null;
  if (isBlockedStatus) {
    blockReason = `Registration is closed — this event is ${event.status.toLowerCase()}.`;
  } else if (!registrationOpen) {
    blockReason = 'Registration is not currently open for this event.';
  } else if (isPaid) {
    blockReason =
      "This is a paid event. Online checkout isn't available in the app yet — please check back soon.";
  } else if (isFull) {
    blockReason = 'This event is at full capacity. Registration is currently unavailable.';
  }

  const spotsRemaining = Math.max(0, event.capacity - event.registered);

  function validate(): boolean {
    let valid = true;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Full name is required.');
      valid = false;
    } else {
      setNameError(null);
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError(null);
    }

    return valid;
  }

  function handleSubmit() {
    if (registerMutation.isPending) {
      return;
    }

    setSubmitError(null);

    if (!validate()) {
      return;
    }

    registerMutation.mutate(
      {
        id,
        payload: {
          participant_name: name.trim(),
          participant_email: email.trim(),
        },
      },
      {
        onSuccess: (data) => setResult(data),
        onError: (error) => setSubmitError(buildErrorMessage(error)),
      },
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
          {result ? 'Registration Complete' : 'Register'}
        </Text>
      </View>

      {result ? (
        <View style={styles.successWrap}>
          <View style={styles.successIconWrap}>
            <CircleCheckIcon size={34} color={PRIMARY} />
          </View>
          <Text style={styles.successTitle}>You&rsquo;re registered!</Text>
          <Text style={styles.successBody}>
            You&rsquo;ve successfully registered for {event.detailTitle}. We&rsquo;ve sent a
            confirmation to {email.trim()}.
          </Text>
          {result.id ? (
            <View style={styles.successRefCard}>
              <Text style={styles.successRefLabel}>REGISTRATION REFERENCE</Text>
              <Text style={styles.successRefValue}>{result.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          ) : null}
          <LeafyGradientButton onPress={goBack} style={styles.doneBtn} borderRadius={14}>
            <Text style={styles.doneBtnText}>Done</Text>
          </LeafyGradientButton>
        </View>
      ) : blockReason ? (
        <EmptyState
          variant="empty"
          title="Registration unavailable"
          description={blockReason}
          onAction={goBack}
          actionLabel="Back to event"
        />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
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
              <View style={styles.spotsRow}>
                <Text style={styles.spotsText}>{spotsRemaining} spots remaining</Text>
                <Text style={styles.priceText}>{event.priceDetail}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Registration Information</Text>

            {submitError ? (
              <View style={styles.submitBanner}>
                <Text style={styles.submitBannerText}>{submitError}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={[styles.input, nameError && styles.inputError]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError(null);
                }}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoCorrect={false}
                accessibilityLabel="Full name"
              />
              {nameError ? <Text style={styles.fieldErrorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(null);
                }}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email"
              />
              {emailError ? (
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              ) : (
                <Text style={styles.fieldHint}>
                  Your registration confirmation will be sent to this email.
                </Text>
              )}
            </View>

            <LeafyGradientButton
              onPress={handleSubmit}
              disabled={registerMutation.isPending}
              style={styles.submitBtn}
              borderRadius={14}
            >
              <View style={styles.submitBtnContent}>
                {registerMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : null}
                <Text style={styles.submitBtnText}>
                  {registerMutation.isPending ? 'Registering…' : 'Confirm Registration'}
                </Text>
              </View>
            </LeafyGradientButton>

            <Text style={styles.disclaimer}>
              This event is free to attend. We&rsquo;ll email your confirmation once you register.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
