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
import { useEvent, useEventRegistrationForm, useRegisterForEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types/api.types';
import type {
  EventFormField,
  EventFormFieldValue,
  EventFormSection,
  EventRegistrationResult,
} from '@/types/event.types';
import { getEventAvailability } from '@/utils/event.mapper';
import { EventRegisterFormField } from '@/screens/events/EventRegisterFormField';
import { InfoCard } from '@/screens/events/EventDetailScreenParts.shared';
import { PRIMARY, styles } from '@/screens/events/EventRegisterScreen.styles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/;

function buildErrorMessage(error: ApiError): string {
  const raw = error.message?.trim();

  if (error.statusCode === 401) {
    return 'Please sign in again to register for this event.';
  }
  if (error.statusCode === 403) {
    return raw || "You don't have access to register for this event.";
  }
  if (error.statusCode === 404) {
    return 'This event could not be found — it may have been removed.';
  }
  if (error.statusCode === 409) {
    return raw || 'You are already registered for this event.';
  }
  if (error.statusCode === 0) {
    return 'Network error. Please check your connection and try again.';
  }
  // 400 (closed/full/cutoff) and 422 (validation) already carry a specific,
  // human-readable detail from the backend — surface it directly.
  return raw || 'Something went wrong while registering. Please try again.';
}

/** Field is empty in the sense that matters for required-field checks. */
function isFieldEmpty(field: EventFormField, value: EventFormFieldValue | undefined): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (field.renderer === 'checkbox') return value !== true;
  return false;
}

/**
 * Client-side validation only — the backend applies no shape/format
 * validation to custom_fields on POST /registrations today (it's stored as
 * a free-form dict), so these checks are purely for a better mobile UX, not
 * a substitute for a backend contract that doesn't exist yet.
 */
function validateDynamicField(
  field: EventFormField,
  value: EventFormFieldValue | undefined,
): string | null {
  const empty = isFieldEmpty(field, value);

  if (field.required && empty) {
    return field.renderer === 'checkbox' ? 'This must be checked to continue.' : 'This field is required.';
  }
  if (empty) return null;

  const validation = field.validation;

  if (field.renderer === 'number') {
    const num = Number(value);
    if (typeof value !== 'string' || Number.isNaN(num)) return 'Enter a valid number.';
    const min = validation.min;
    const max = validation.max;
    if (typeof min === 'number' && num < min) return `Must be at least ${min}.`;
    if (typeof max === 'number' && num > max) return `Must be at most ${max}.`;
    return null;
  }

  if (field.renderer === 'url' && typeof value === 'string' && !URL_PATTERN.test(value.trim())) {
    return 'Enter a valid URL (starting with http:// or https://).';
  }
  if (field.renderer === 'date' && typeof value === 'string' && !DATE_PATTERN.test(value.trim())) {
    return 'Enter a date as YYYY-MM-DD.';
  }
  if (
    field.renderer === 'datetime' &&
    typeof value === 'string' &&
    !DATETIME_PATTERN.test(value.trim())
  ) {
    return 'Enter a date and time as YYYY-MM-DD HH:MM.';
  }
  if ((field.renderer === 'text' || field.renderer === 'textarea') && typeof value === 'string') {
    const minLength = validation.min_length;
    const maxLength = validation.max_length;
    if (typeof minLength === 'number' && value.trim().length < minLength) {
      return `Must be at least ${minLength} characters.`;
    }
    if (typeof maxLength === 'number' && value.trim().length > maxLength) {
      return `Must be at most ${maxLength} characters.`;
    }
    const pattern = validation.pattern;
    if (typeof pattern === 'string' && pattern) {
      try {
        if (!new RegExp(pattern).test(value)) {
          return "This doesn't match the expected format.";
        }
      } catch {
        // Backend-supplied pattern isn't a valid RegExp — ignore rather than block submission.
      }
    }
  }

  return null;
}

function buildCustomFieldsPayload(
  sections: EventFormSection[],
  answers: Record<string, EventFormFieldValue>,
): Record<string, string | boolean | string[]> {
  const payload: Record<string, string | boolean | string[]> = {};

  for (const section of sections) {
    for (const field of section.fields) {
      const value = answers[field.id];
      if (field.renderer === 'checkbox') {
        payload[field.id] = value === true;
      } else if (field.renderer === 'multi_select') {
        payload[field.id] = Array.isArray(value) ? value : [];
      } else {
        payload[field.id] = typeof value === 'string' ? value.trim() : '';
      }
    }
  }

  return payload;
}

export function EventRegisterScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const user = useAuthStore((state) => state.user);

  const { event, isLoading, isError } = useEvent(id, { enabled: Boolean(id) });
  // Dynamic questions only apply to the free-registration flow — the paid
  // checkout endpoint has no field to carry them (see Phase 5B report).
  const { form, isLoading: isFormLoading } = useEventRegistrationForm(id, {
    enabled: Boolean(event?.isFree),
  });
  const registerMutation = useRegisterForEvent();

  const [name, setName] = useState(user?.fullName?.trim() ?? '');
  const [email, setEmail] = useState(user?.email?.trim() ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, EventFormFieldValue>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  const isPaid = !event.isFree;
  const availability = getEventAvailability(event);
  // Paid events aren't gated on "full": checkout enforces capacity per ticket
  // type server-side, which this event-wide figure doesn't reliably reflect.
  const isFullBlock = !isPaid && availability.kind === 'full';

  let blockReason: string | null = null;
  let blockActionLabel = 'Back to event';
  let blockAction = goBack;
  if (availability.kind === 'cancelled' || availability.kind === 'completed') {
    blockReason = `Registration is closed — this event is ${availability.label.replace('Event ', '').toLowerCase()}.`;
  } else if (availability.kind === 'closed') {
    blockReason = 'Registration is not currently open for this event.';
  } else if (isFullBlock) {
    blockReason = 'This event is at full capacity. Join the waitlist to be notified if a spot opens up.';
    blockActionLabel = 'Join Waitlist';
    blockAction = () => router.push({ pathname: '/(main)/event/waitlist', params: { id } });
  }

  const spotsRemaining = Math.max(0, event.capacity - event.registered);
  // Empty when paid, still loading, or the form legitimately has no custom
  // questions — the basic Full Name / Email fields always work regardless.
  const formSections = !isPaid ? (form?.sections ?? []) : [];
  const isFormLoadingVisible = !isPaid && isFormLoading;

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

    const nextFieldErrors: Record<string, string> = {};
    for (const section of formSections) {
      for (const field of section.fields) {
        const error = validateDynamicField(field, answers[field.id]);
        if (error) {
          nextFieldErrors[field.id] = error;
          valid = false;
        }
      }
    }
    setFieldErrors(nextFieldErrors);

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

    if (isPaid) {
      router.push({
        pathname: '/(main)/event/checkout',
        params: { id, participantName: name.trim(), participantEmail: email.trim() },
      });
      return;
    }

    registerMutation.mutate(
      {
        id,
        payload: {
          participant_name: name.trim(),
          participant_email: email.trim(),
          ...(formSections.length > 0
            ? { custom_fields: buildCustomFieldsPayload(formSections, answers) }
            : {}),
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
        <ScrollView
          contentContainerStyle={styles.successWrap}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successIconWrap}>
            <CircleCheckIcon size={34} color={PRIMARY} />
          </View>
          <Text style={styles.successTitle}>You&rsquo;re registered!</Text>
          <Text style={styles.successBody}>
            You&rsquo;ve successfully registered for {event.detailTitle}. We&rsquo;ve sent a
            confirmation to {email.trim()}.
          </Text>

          <View style={styles.successSummaryCard}>
            <View style={styles.successSummaryRow}>
              <View style={styles.successSummaryItem}>
                <InfoCard emoji="📅" label="Date & Time" value={event.schedule} />
              </View>
              <View style={styles.successSummaryItem}>
                <InfoCard emoji="📍" label="Location" value={event.location} />
              </View>
            </View>
            <View style={styles.successStatusRow}>
              <Text style={styles.successStatusLabel}>Status</Text>
              <View style={styles.successStatusPill}>
                <Text style={styles.successStatusPillText}>
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {result.id ? (
            <View style={styles.successRefCard}>
              <Text style={styles.successRefLabel}>REGISTRATION REFERENCE</Text>
              <Text style={styles.successRefValue}>{result.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          ) : (
            <Text style={styles.successRefMissing}>
              Your registration was successful. Find your ticket anytime from My Events.
            </Text>
          )}

          <View style={styles.successActions}>
            {result.id ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(main)/event/ticket',
                    params: { eventId: id, registrationId: result.id! },
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
              style={styles.doneBtn}
              borderRadius={14}
            >
              <Text style={styles.doneBtnText}>View My Events</Text>
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
      ) : blockReason ? (
        <EmptyState
          variant="empty"
          title={isFullBlock ? 'Event full' : 'Registration unavailable'}
          description={blockReason}
          onAction={blockAction}
          actionLabel={blockActionLabel}
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

            {isFormLoadingVisible ? (
              <View style={styles.formLoadingRow}>
                <ActivityIndicator color={PRIMARY} size="small" />
                <Text style={styles.formLoadingText}>Loading registration questions…</Text>
              </View>
            ) : (
              formSections.map((section) => (
                <View key={section.id}>
                  {section.label ? (
                    <Text style={styles.formSectionTitle}>{section.label}</Text>
                  ) : null}
                  {section.fields.map((field) => (
                    <EventRegisterFormField
                      key={field.id}
                      field={field}
                      value={answers[field.id]}
                      error={fieldErrors[field.id]}
                      onChange={(value) => {
                        setAnswers((current) => ({ ...current, [field.id]: value }));
                        setFieldErrors((current) => {
                          if (!current[field.id]) return current;
                          const next = { ...current };
                          delete next[field.id];
                          return next;
                        });
                      }}
                    />
                  ))}
                </View>
              ))
            )}

            <LeafyGradientButton
              onPress={handleSubmit}
              disabled={registerMutation.isPending || isFormLoadingVisible}
              style={styles.submitBtn}
              borderRadius={14}
            >
              <View style={styles.submitBtnContent}>
                {registerMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : null}
                <Text style={styles.submitBtnText}>
                  {registerMutation.isPending
                    ? 'Registering…'
                    : isPaid
                      ? 'Continue to Checkout'
                      : 'Confirm Registration'}
                </Text>
              </View>
            </LeafyGradientButton>

            <Text style={styles.disclaimer}>
              {isPaid
                ? "This is a paid event. You'll review pricing and complete a demo payment on the next screen."
                : "This event is free to attend. We’ll email your confirmation once you register."}
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
