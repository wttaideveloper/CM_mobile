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
import { CircleCheckIcon, ChevronLeftIcon, StarIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { useEvent, useSubmitEventFeedback } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types/api.types';
import { PRIMARY, styles } from '@/screens/events/EventFeedbackScreen.styles';

const STAR_COUNT = 5;
const STAR_MUTED = '#D1D5DB';

/**
 * The backend enforces no rating scale at all (EventFeedback.rating is an
 * unvalidated String(10)) — 1-5 stars is a deliberate mobile UX choice, the
 * conventional scale for this kind of control, not a confirmed backend
 * contract. See the Phase 5D-3 report for the full rationale.
 */
function StarRating({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;
        return (
          <Pressable
            key={starValue}
            onPress={() => onChange(filled && starValue === value ? starValue - 1 : starValue)}
            accessibilityRole="button"
            accessibilityLabel={`${starValue} star${starValue > 1 ? 's' : ''}`}
            accessibilityState={{ selected: filled }}
            style={({ pressed }) => [styles.starBtn, pressed && styles.pressed]}
            hitSlop={4}
          >
            <StarIcon size={28} color={filled ? '#F59E0B' : STAR_MUTED} />
          </Pressable>
        );
      })}
    </View>
  );
}

function buildFeedbackErrorMessage(error: ApiError): string {
  const raw = error.message?.trim();

  if (error.statusCode === 401) {
    return 'Please sign in again to submit feedback.';
  }
  if (error.statusCode === 403) {
    return raw || "You're not eligible to submit a verified review for this event.";
  }
  if (error.statusCode === 404) {
    return 'This event could not be found — it may have been removed.';
  }
  if (error.statusCode === 409) {
    return raw || "You've already submitted feedback for this event.";
  }
  if (error.statusCode === 0) {
    return 'Network error. Please check your connection and try again.';
  }
  // 400/422/429/500 — the backend's own detail is already specific for this endpoint.
  return raw || 'Something went wrong while submitting your feedback. Please try again.';
}

export function EventFeedbackScreen() {
  const { id: rawId, registrationStatus: rawStatus } = useLocalSearchParams<{
    id: string;
    registrationStatus?: string;
  }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const registrationStatus = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const user = useAuthStore((state) => state.user);

  const { event, isLoading, isError } = useEvent(id, { enabled: Boolean(id) });
  const feedbackMutation = useSubmitEventFeedback();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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

  // Mirrors the backend's own verified-review gate (event_service.py,
  // create_feedback_service: EventRegistration.status.in_(["confirmed","attended"])).
  // Falls back to the open /feedback endpoint for any other status (or when
  // this screen is reached without a known registration status at all) —
  // the backend imposes no restriction on that path.
  const isReviewEligible = registrationStatus === 'confirmed' || registrationStatus === 'attended';

  function handleSubmit() {
    if (feedbackMutation.isPending) return;

    setSubmitError(null);
    const trimmedComment = comment.trim();
    if (rating === 0 && !trimmedComment) {
      setFormError('Please add a rating or a comment before submitting.');
      return;
    }
    setFormError(null);

    const email = user?.email?.trim();

    feedbackMutation.mutate(
      {
        id,
        asReview: isReviewEligible,
        payload: {
          ...(email ? { participant_email: email } : {}),
          ...(rating > 0 ? { rating: String(rating) } : {}),
          ...(trimmedComment ? { comment: trimmedComment } : {}),
        },
      },
      {
        onSuccess: () => setSent(true),
        onError: (mutationError) => setSubmitError(buildFeedbackErrorMessage(mutationError)),
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
          {sent ? 'Feedback Sent' : 'Event Feedback'}
        </Text>
      </View>

      {sent ? (
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultIconWrap}>
            <CircleCheckIcon size={34} color={PRIMARY} />
          </View>
          <Text style={styles.resultTitle}>Thank you for your feedback!</Text>
          <Text style={styles.resultBody}>
            Your feedback for {event.detailTitle} has been submitted.
          </Text>

          <View style={styles.resultActions}>
            <LeafyGradientButton
              onPress={() => router.push('/(main)/event/my-events')}
              style={styles.primaryBtn}
              borderRadius={14}
            >
              <Text style={styles.primaryBtnText}>Back to My Events</Text>
            </LeafyGradientButton>
          </View>
        </ScrollView>
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
              <Text style={styles.summaryLabel}>Regarding</Text>
              <Text style={styles.summaryTitle} numberOfLines={2}>
                {event.detailTitle}
              </Text>
            </View>

            {submitError ? (
              <View style={styles.submitBanner}>
                <Text style={styles.submitBannerText}>{submitError}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Rating</Text>
              <StarRating value={rating} onChange={setRating} />
              <Text style={styles.ratingHint}>Optional — tap a star to rate your experience.</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Your Feedback</Text>
              <TextInput
                style={styles.textarea}
                value={comment}
                onChangeText={(text) => {
                  setComment(text);
                  if (formError) setFormError(null);
                }}
                placeholder="What went well? What could be better?"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                accessibilityLabel="Your feedback"
              />
              {formError ? (
                <Text style={[styles.fieldHint, { color: '#DC2626', fontWeight: '600' }]}>
                  {formError}
                </Text>
              ) : (
                <Text style={styles.fieldHint}>Optional, but at least a rating or a comment helps.</Text>
              )}
            </View>

            <LeafyGradientButton
              onPress={handleSubmit}
              disabled={feedbackMutation.isPending}
              style={styles.sendBtn}
              borderRadius={14}
            >
              <View style={styles.sendBtnContent}>
                {feedbackMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : null}
                <Text style={styles.sendBtnText}>
                  {feedbackMutation.isPending ? 'Submitting…' : 'Submit Feedback'}
                </Text>
              </View>
            </LeafyGradientButton>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
