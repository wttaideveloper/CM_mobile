import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import {
  MarketCheckoutCheckIcon,
  MarketCheckoutPinIcon,
  MarketCheckoutShieldIcon,
} from '@/components/market/MarketCheckoutIcons';
import { MarketTrainingHeader } from '@/components/market/MarketTrainingHeader';
import { MARKET_TRAININGS } from '@/components/market/marketTrainingData';
import {
  TRAINING_CHECKOUT_STATIC,
  TRAINING_ENROLL_BG,
  TRAINING_ENROLL_BORDER,
  TRAINING_ENROLL_GREEN,
  TRAINING_ENROLL_MUTED,
  TRAINING_ENROLL_TEAL,
  TRAINING_ENROLL_TRACK,
} from '@/components/market/marketTrainingEnrollData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import { useEnrollTraining, useTraining } from '@/hooks/useTrainings';
import type { ApiError } from '@/types/api.types';
import { getApiErrorMessage } from '@/utils/apiError';
import { c, NU } from '@/utils/newUiCompact';

function isUuid(id?: string) {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );
}

function enrollErrorMessage(error: unknown): string {
  const axiosData = (
    error as { response?: { data?: Parameters<typeof getApiErrorMessage>[0] } }
  )?.response?.data;
  if (axiosData) {
    return getApiErrorMessage(axiosData, 'Could not enroll. Try again.');
  }
  const api = error as ApiError;
  if (api?.message?.trim()) return api.message.trim();
  return 'Could not enroll. Try again.';
}

export function MarketTrainingCheckoutScreen() {
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
    training?.priceLabel ||
    staticItem?.priceLabel ||
    'Free';
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
        <MarketTrainingHeader
          eyebrow={TRAINING_CHECKOUT_STATIC.eyebrow}
          title={TRAINING_CHECKOUT_STATIC.title}
        />

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Training</Text>
          <View style={styles.card}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.thumb}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.swatch} />
            )}
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{trainingTitle}</Text>
              <Text style={styles.cardMeta}>
                {isApiTraining
                  ? 'Confirm to enroll via API'
                  : 'Demo training · local confirm only'}
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

          <Text style={styles.sectionLabel}>Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Training fee</Text>
              <Text style={styles.feeValue}>{trainingPrice}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Tax</Text>
              <Text style={styles.feeValue}>Included</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total due today</Text>
              <Text style={styles.totalValue}>{trainingPrice}</Text>
            </View>
          </View>

          <View style={styles.note}>
            <MarketCheckoutShieldIcon />
            <Text style={styles.noteText}>
              {isApiTraining
                ? 'Confirm calls POST /api/v1/trainings/{id}/enroll with your auth token.'
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TRAINING_ENROLL_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(12, 10),
  },
  sectionLabel: {
    marginTop: c(8, 6),
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: TRAINING_ENROLL_MUTED,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_ENROLL_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: TRAINING_ENROLL_GREEN,
    borderWidth: 1.5,
  },
  swatch: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(12, 10),
    backgroundColor: '#e6f4e8',
  },
  thumb: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(12, 10),
    backgroundColor: '#d7e8db',
  },
  cardCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  cardTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_ENROLL_TEAL,
  },
  cardMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_ENROLL_MUTED,
  },
  price: {
    fontSize: NU.link,
    fontWeight: '800',
    color: TRAINING_ENROLL_TEAL,
  },
  link: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: TRAINING_ENROLL_GREEN,
  },
  visaBadge: {
    width: NU.iconBtn,
    height: c(28, 24),
    borderRadius: c(6, 5),
    backgroundColor: TRAINING_ENROLL_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    fontSize: c(9.5, 9),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  check: {
    width: c(22, 20),
    height: c(22, 20),
    borderRadius: c(11, 10),
    backgroundColor: TRAINING_ENROLL_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_ENROLL_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: NU.cardGap,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: NU.body,
    color: '#5d7a67',
  },
  feeValue: {
    fontSize: NU.body,
    fontWeight: '600',
    color: TRAINING_ENROLL_TEAL,
  },
  divider: {
    height: 1,
    backgroundColor: TRAINING_ENROLL_TRACK,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_ENROLL_TEAL,
  },
  totalValue: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: TRAINING_ENROLL_TEAL,
  },
  note: {
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: c(12.5, 11.5),
    lineHeight: c(19, 17),
    color: '#3c6b47',
  },
  footer: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: NU.hPad,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: TRAINING_ENROLL_BORDER,
  },
  confirmBtn: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: TRAINING_ENROLL_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
