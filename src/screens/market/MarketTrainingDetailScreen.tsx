import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { MarketTrainingDetailBody } from '@/components/market/MarketTrainingDetailBody';
import { MarketTrainingDetailFooter } from '@/components/market/MarketTrainingDetailFooter';
import { MarketTrainingHeader } from '@/components/market/MarketTrainingHeader';
import { MarketTrainingWishlistPopup } from '@/components/market/MarketTrainingWishlistPopup';
import {
  MARKET_TRAININGS,
  TRAINING_BG,
  TRAINING_GREEN,
} from '@/components/market/marketTrainingData';
import { useScrollToTopOnFocus } from '@/hooks/useScrollToTopOnFocus';
import {
  useMyTrainingEnrolments,
  useMyTrainingWishlist,
  useToggleTrainingWishlist,
  useTraining,
} from '@/hooks/useTrainings';
import { useTrainingWishlistStore } from '@/stores/trainingWishlist.store';

export function MarketTrainingDetailScreen() {
  const router = useRouter();
  const scrollRef = useScrollToTopOnFocus();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training, isApiId } = useTraining(id);
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

  const apiWishlist = useMyTrainingWishlist();
  const enrolments = useMyTrainingEnrolments();
  const toggleApiWishlist = useToggleTrainingWishlist();
  const localWishlisted = useTrainingWishlistStore((s) =>
    trainingId ? s.has(trainingId) : false,
  );
  const toggleLocalWishlist = useTrainingWishlistStore((s) => s.toggle);

  const [popupVisible, setPopupVisible] = useState(false);

  const wishlisted = isApiId
    ? apiWishlist.has(trainingId)
    : localWishlisted;
  const enrolled = isApiId ? enrolments.isEnrolled(trainingId) : false;

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

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={TRAINING_GREEN} />
      <StatusBarFill lightColor={TRAINING_GREEN} darkColor={TRAINING_GREEN} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MarketTrainingHeader
          eyebrow={
            isApiId
              ? 'Training'
              : staticItem.mode === 'In-Person'
                ? 'Physical training'
                : staticItem.mode === 'Hybrid'
                  ? 'Hybrid training'
                  : 'Virtual training'
          }
          title={title}
        />
        <MarketTrainingDetailBody />
      </ScrollView>
      <MarketTrainingDetailFooter
        wishlisted={wishlisted}
        enrolled={enrolled}
        busy={isApiId && toggleApiWishlist.isPending}
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

      <MarketTrainingWishlistPopup
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
});
