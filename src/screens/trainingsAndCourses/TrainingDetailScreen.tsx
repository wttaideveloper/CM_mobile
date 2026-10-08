import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { TrainingDetailBody } from '@/components/trainingsAndCourses/TrainingDetailBody';
import { TrainingDetailFooter } from '@/components/trainingsAndCourses/TrainingDetailFooter';
import { TrainingHeader } from '@/components/trainingsAndCourses/TrainingHeader';
import { TrainingWishlistPopup } from '@/components/trainingsAndCourses/TrainingWishlistPopup';
import {
  MARKET_TRAININGS,
  TRAINING_BG,
  TRAINING_GREEN,
} from '@/components/trainingsAndCourses/trainingData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import {
  useMyTrainingEnrolments,
  useMyTrainingWishlist,
  useToggleTrainingWishlist,
  useTraining,
} from '@/hooks/useTrainings';
import { useAuthStore } from '@/stores/auth.store';
import { useTrainingWishlistStore } from '@/stores/trainingWishlist.store';

export function TrainingDetailScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training, isApiId, isLoading } = useTraining(id);
  const staticItem =
    MARKET_TRAININGS.find((item) => item.id === id) ?? MARKET_TRAININGS[0];
  const title = isApiId
    ? training?.title || 'Training'
    : staticItem.title;
  const trainingId = isApiId ? training?.id || id : staticItem.id;
  const priceLabel = isApiId
    ? training?.priceLabel || 'Free'
    : staticItem.priceLabel;
  const detailLine = isApiId
    ? training?.category || 'Training'
    : staticItem.detail;

  const userId = useAuthStore((s) => s.user?.id?.trim() || '');
  const apiWishlist = useMyTrainingWishlist();
  const enrolments = useMyTrainingEnrolments();
  const toggleApiWishlist = useToggleTrainingWishlist();
  const localWishlisted = useTrainingWishlistStore((s) =>
    Boolean(
      trainingId &&
        userId &&
        (s.byUser[userId] ?? []).some((row) => row.id === trainingId),
    ),
  );
  const toggleLocalWishlist = useTrainingWishlistStore((s) => s.toggle);

  const [popupVisible, setPopupVisible] = useState(false);

  const wishlisted = isApiId
    ? apiWishlist.has(trainingId)
    : localWishlisted;
  const footerCta = (() => {
    if (!isApiId) return 'enroll' as const;
    if (
      training?.isPendingApproval ||
      enrolments.isPendingApproval(trainingId)
    ) {
      return 'pending' as const;
    }
    if (training?.canContinueLearning) return 'continue' as const;
    if (
      enrolments.isEnrolled(trainingId) &&
      !enrolments.isPendingApproval(trainingId)
    ) {
      return 'continue' as const;
    }
    const gate = training?.enrolmentGate;
    if (gate === 'not_yet_open' || gate === 'closed' || gate === 'full') {
      return gate;
    }
    return 'enroll' as const;
  })();
  const showLoading = isApiId && isLoading && !training;

  const openWishlist = () => {
    setPopupVisible(false);
    router.push('/(main)/market/training-wishlist');
  };

  const onToggleWishlist = () => {
    if (!trainingId || toggleApiWishlist.isPending) return;

    // Already saved — open popup only (remove only from Wishlist screen)
    if (wishlisted) {
      setPopupVisible(true);
      return;
    }

    if (isApiId) {
      toggleApiWishlist.mutate(
        { trainingId, wishlisted: false },
        {
          onSuccess: () => setPopupVisible(true),
          onError: () => {
            Alert.alert(
              'Wishlist',
              'Could not save to wishlist. Try again.',
            );
          },
        },
      );
      return;
    }

    toggleLocalWishlist({
      id: trainingId,
      title,
      detail: detailLine,
      priceLabel,
    });
    setPopupVisible(true);
  };

  const modeLabel = isApiId ? training?.deliveryMode : staticItem.mode;
  const eyebrow =
    modeLabel === 'In-Person' || modeLabel === 'Physical'
      ? 'Physical training'
      : modeLabel === 'Hybrid'
        ? 'Hybrid training'
        : modeLabel === 'Self-paced'
          ? 'Self-paced training'
          : modeLabel === 'Virtual'
            ? 'Virtual training'
            : 'Training';

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={TRAINING_GREEN} />
      <StatusBarFill lightColor={TRAINING_GREEN} darkColor={TRAINING_GREEN} />
      <TrainingHeader
        eyebrow={eyebrow}
        title={showLoading ? 'Loading…' : title}
        flatBottom
      />
      {showLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={TRAINING_GREEN} size="large" />
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <TrainingDetailBody />
          </ScrollView>
          <TrainingDetailFooter
            wishlisted={wishlisted}
            cta={footerCta}
            busy={isApiId && toggleApiWishlist.isPending}
            gateMessage={
              isApiId ? training?.enrolmentGateMessage || undefined : undefined
            }
            onToggleWishlist={onToggleWishlist}
            onEnroll={() =>
              router.push({
                pathname: '/(main)/market/training-checkout',
                params: {
                  id: trainingId ?? '',
                  title,
                  price: priceLabel,
                },
              })
            }
            onContinue={() =>
              router.push({
                pathname: '/(main)/market/my-training-progress',
                params: { id: trainingId ?? '' },
              })
            }
          />
        </>
      )}

      <TrainingWishlistPopup
        visible={popupVisible}
        title={wishlisted ? 'Already in wishlist' : 'Added to wishlist'}
        subtitle={
          wishlisted
            ? `${title} is saved. Open your wishlist to manage it, or keep browsing.`
            : `${title} is saved. Open your wishlist anytime from Me → My Wishlist.`
        }
        onClose={() => setPopupVisible(false)}
        onGoToWishlist={openWishlist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TRAINING_BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 12,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
