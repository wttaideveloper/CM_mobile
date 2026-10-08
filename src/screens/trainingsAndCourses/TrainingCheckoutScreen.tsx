import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import {
  MarketCheckoutCheckIcon,
  MarketCheckoutPinIcon,
  MarketCheckoutShieldIcon,
} from '@/components/market/MarketCheckoutIcons';
import { TrainingHeader } from '@/components/trainingsAndCourses/TrainingHeader';
import { MARKET_TRAININGS } from '@/components/trainingsAndCourses/trainingData';
import {
  TRAINING_CHECKOUT_FREE,
  TRAINING_CHECKOUT_STATIC,
  TRAINING_ENROLL_BG,
  TRAINING_ENROLL_BORDER,
  TRAINING_ENROLL_GREEN,
  TRAINING_ENROLL_MUTED,
  TRAINING_ENROLL_TEAL,
  TRAINING_ENROLL_TRACK,
} from '@/components/trainingsAndCourses/trainingEnrollData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { useEnrollTraining, useTraining } from '@/hooks/useTrainings';
import { resolveApiErrorMessage } from '@/utils/apiError';
import { TrainingCoverImage } from '@/components/trainingsAndCourses/TrainingCoverImage';
import { c, NU } from '@/utils/newUiCompact';
import { styles } from '@/screens/trainingsAndCourses/TrainingCheckoutScreen.styles';

function isUuid(id?: string) {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

function isFreeCheckoutPrice(
  priceLabel?: string | null,
  priceType?: string | null,
): boolean {
  if ((priceType ?? '').trim().toLowerCase() === 'free') return true;
  const raw = (priceLabel ?? '').trim().toLowerCase();
  if (!raw || raw === 'free') return true;
  const amount = Number(raw.replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) && amount <= 0;
}

function enrollErrorMessage(error: unknown): string {
  const msg = resolveApiErrorMessage(error, 'Could not enroll. Try again.');
  const openMatch = msg.match(
    /opens\s+(\d{4}-\d{2}-\d{2}T[\d:.+-]+Z?)/i,
  );
  if (openMatch?.[1]) {
    const opensAt = new Date(openMatch[1]);
    if (!Number.isNaN(opensAt.getTime())) {
      const label = opensAt.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      return `Enrolment is not open yet. It opens on ${label}.`;
    }
  }
  return msg;
}

export function TrainingCheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useScrollToTopOnFocus();
  const enroll = useEnrollTraining();
  const [submitting, setSubmitting] = useState(false);
  const { id, title, price } = useLocalSearchParams<{
    id?: string;
    title?: string;
    price?: string;
  }>();

  const isApiTraining = isUuid(id);
  const { training } = useTraining(isApiTraining ? id : undefined);
  const staticItem = MARKET_TRAININGS.find((item) => item.id === id);

  const trainingTitle =
    title?.trim() ||
    training?.title ||
    staticItem?.title ||
    'Selected training';
  const trainingPrice =
    price?.trim() ||
    training?.promoPriceLabel ||
    training?.priceLabel ||
    staticItem?.priceLabel ||
    'Free';
  const isFree = isFreeCheckoutPrice(
    trainingPrice,
    training?.priceType ??
      (staticItem?.priceLabel === 'Free' ? 'Free' : undefined),
  );
  const imageUrl = training?.imageUrl || staticItem?.imageUrl || null;

  const goEnrolled = (code?: string, status?: string) => {
    router.replace({
      pathname: '/(main)/market/training-enrolled',
      params: {
        id: id ?? '',
        title: trainingTitle,
        price: trainingPrice,
        code: code ?? '',
        status: status ?? '',
      },
    });
  };

  const onConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (!isApiTraining) {
      goEnrolled('TR-STATIC', 'enrolled');
      setSubmitting(false);
      return;
    }

    const gate = training?.enrolmentGate;
    if (gate === 'not_yet_open' || gate === 'closed' || gate === 'full') {
      Alert.alert(
        'Enrolment unavailable',
        training?.enrolmentGateMessage ||
          (gate === 'full'
            ? 'All seats are filled for this training.'
            : gate === 'closed'
              ? 'Enrolment is closed for this training.'
              : 'Enrolment is not open yet.'),
        [{ text: 'OK', onPress: () => setSubmitting(false) }],
      );
      return;
    }

    try {
      // POST /api/v1/trainings/{training_id}/enroll — path UUID required, body {}
      const result = await enroll.mutateAsync({ id: id! });
      goEnrolled(
        result.enrollment_code ?? result.id,
        result.status || 'enrolled',
      );
    } catch (error) {
      Alert.alert('Enrollment failed', enrollErrorMessage(error), [
        { text: 'OK', onPress: () => setSubmitting(false) },
      ]);
      return;
    }

    setSubmitting(false);
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={TRAINING_ENROLL_GREEN} />
      <StatusBarFill
        lightColor={TRAINING_ENROLL_GREEN}
        darkColor={TRAINING_ENROLL_GREEN}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TrainingHeader
          eyebrow={TRAINING_CHECKOUT_STATIC.eyebrow}
          title={
            isFree
              ? TRAINING_CHECKOUT_FREE.title
              : TRAINING_CHECKOUT_STATIC.title
          }
        />

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Training</Text>
          <View style={styles.card}>
            <View style={styles.thumb}>
              <TrainingCoverImage
                uri={imageUrl}
                title={trainingTitle}
                style={styles.thumbImage}
                placeholderTextStyle={styles.thumbInitials}
              />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{trainingTitle}</Text>
              <Text style={styles.cardMeta}>
                Review and confirm to enroll
              </Text>
            </View>
            <Text style={styles.price}>{trainingPrice}</Text>
          </View>

          <Text style={styles.sectionLabel}>Learner details</Text>
          <View style={styles.card}>
            <MarketCheckoutPinIcon />
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Suresh Inti</Text>
              <Text style={styles.cardMeta}>
                sureshinti67@gmail.com · +1 415 555 0198
              </Text>
            </View>
            <Text style={styles.link}>Edit</Text>
          </View>

          {isFree ? null : (
            <>
              <Text style={styles.sectionLabel}>Payment method</Text>
              <View style={[styles.card, styles.cardSelected]}>
                <View style={styles.visaBadge}>
                  <Text style={styles.visaText}>VISA</Text>
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>
                    {TRAINING_CHECKOUT_STATIC.paymentLabel}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {TRAINING_CHECKOUT_STATIC.paymentMeta}
                  </Text>
                </View>
                <View style={styles.check}>
                  <MarketCheckoutCheckIcon />
                </View>
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Training fee</Text>
              <Text style={styles.feeValue}>{trainingPrice}</Text>
            </View>
            {isFree ? (
              <>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>No payment required</Text>
                  <Text style={styles.totalValue}>Free</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Tax</Text>
                  <Text style={styles.feeValue}>Included</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total due today</Text>
                  <Text style={styles.totalValue}>{trainingPrice}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.note}>
            <MarketCheckoutShieldIcon />
            <Text style={styles.noteText}>
              {isFree
                ? TRAINING_CHECKOUT_FREE.note
                : TRAINING_CHECKOUT_STATIC.note}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, c(22, 18)) },
        ]}
      >
        <Pressable
          style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]}
          onPress={() => {
            void onConfirm();
          }}
          disabled={submitting}
          accessibilityRole="button"
        >
          <Text style={styles.confirmText}>
            {submitting
              ? 'Enrolling…'
              : TRAINING_CHECKOUT_STATIC.confirmLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

