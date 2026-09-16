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
import { useContactOrganizer, useEvent } from '@/hooks/useEvents';
import type { ApiError } from '@/types/api.types';
import { PRIMARY, styles } from '@/screens/events/EventContactOrganizerScreen.styles';

/**
 * Mirrors the backend's own sole validation rule (event_service.py,
 * contact_organiser_service: `if not msg: raise 400`) — no length limits
 * are invented since the backend applies none.
 */
function validateMessage(message: string): string | null {
  if (!message.trim()) {
    return 'Please enter a message.';
  }
  return null;
}

function buildContactErrorMessage(error: ApiError): string {
  const raw = error.message?.trim();

  if (error.statusCode === 401) {
    return 'Please sign in again to contact the organizer.';
  }
  if (error.statusCode === 403) {
    return raw || "You don't have permission to contact this organizer.";
  }
  if (error.statusCode === 404) {
    return 'This event could not be found — it may have been removed.';
  }
  if (error.statusCode === 0) {
    return 'Network error. Please check your connection and try again.';
  }
  // 400 (empty message), 409, 422, 429, 500 — the backend's own detail is
  // already a specific, human-readable string for this endpoint.
  return raw || 'Something went wrong while sending your message. Please try again.';
}

export function EventContactOrganizerScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();

  const { event, isLoading, isError } = useEvent(id, { enabled: Boolean(id) });
  const contactMutation = useContactOrganizer();

  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);
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

  function handleSend() {
    if (contactMutation.isPending) return;

    setSubmitError(null);
    const error = validateMessage(message);
    if (error) {
      setMessageError(error);
      return;
    }
    setMessageError(null);

    contactMutation.mutate(
      { id, payload: { message: message.trim() } },
      {
        onSuccess: () => setSent(true),
        onError: (mutationError) => setSubmitError(buildContactErrorMessage(mutationError)),
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
          {sent ? 'Message Sent' : 'Contact Organizer'}
        </Text>
      </View>

      {sent ? (
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.resultIconWrap}>
            <CircleCheckIcon size={34} color={PRIMARY} />
          </View>
          <Text style={styles.resultTitle}>Your message has been sent</Text>
          <Text style={styles.resultBody}>
            The organizer of {event.detailTitle} will get back to you soon.
          </Text>

          <View style={styles.resultActions}>
            <LeafyGradientButton onPress={goBack} style={styles.primaryBtn} borderRadius={14}>
              <Text style={styles.primaryBtnText}>Back to Event</Text>
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
              <Text style={styles.summaryOrganizer}>Organized by {event.organizer}</Text>
            </View>

            {submitError ? (
              <View style={styles.submitBanner}>
                <Text style={styles.submitBannerText}>{submitError}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Your Message</Text>
              <TextInput
                style={[styles.textarea, messageError && styles.textareaError]}
                value={message}
                onChangeText={(text) => {
                  setMessage(text);
                  if (messageError) setMessageError(null);
                }}
                placeholder="Ask a question or share a note with the organizer…"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                accessibilityLabel="Your message"
              />
              {messageError ? (
                <Text style={styles.fieldErrorText}>{messageError}</Text>
              ) : (
                <Text style={styles.fieldHint}>
                  Your message is sent directly to the organizer — they&rsquo;ll reply to your
                  account email.
                </Text>
              )}
            </View>

            <LeafyGradientButton
              onPress={handleSend}
              disabled={contactMutation.isPending}
              style={styles.sendBtn}
              borderRadius={14}
            >
              <View style={styles.sendBtnContent}>
                {contactMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : null}
                <Text style={styles.sendBtnText}>
                  {contactMutation.isPending ? 'Sending…' : 'Send Message'}
                </Text>
              </View>
            </LeafyGradientButton>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
