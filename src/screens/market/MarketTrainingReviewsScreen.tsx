import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import {
  isApiTrainingId,
  useSubmitTrainingReview,
  useTraining,
  useTrainingReviews,
} from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { useAuthStore } from '@/stores/auth.store';
import { getApiErrorMessage } from '@/utils/apiError';
import { buildStaticTrainingDetail } from '@/utils/buildStaticTrainingDetail';
import { c, NU } from '@/utils/newUiCompact';

function RatingStars({
  rating,
  onSelect,
  size = 'md',
}: {
  rating: number;
  onSelect?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  const fontSize = size === 'lg' ? c(24, 22) : size === 'sm' ? c(14, 13) : c(22, 20);

  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Pressable
          key={value}
          disabled={!onSelect}
          onPress={() => onSelect?.(value)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          style={styles.starHit}
          accessibilityRole={onSelect ? 'button' : undefined}
          accessibilityLabel={`${value} star${value === 1 ? '' : 's'}`}
        >
          <Text
            style={[
              styles.star,
              { fontSize },
              value <= filled ? styles.starFilled : styles.starEmpty,
            ]}
          >
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function reviewErrorMessage(error: unknown): string {
  const normalized = error as {
    message?: string;
    response?: { data?: Parameters<typeof getApiErrorMessage>[0] };
  };

  const fromMessage = normalized?.message?.trim();
  if (
    fromMessage &&
    fromMessage !== 'Network Error' &&
    !fromMessage.toLowerCase().includes('request failed')
  ) {
    return fromMessage;
  }

  const axiosData = normalized?.response?.data;
  if (axiosData) {
    return getApiErrorMessage(axiosData, 'Could not submit review.');
  }

  return 'Could not submit review. Try again.';
}

export function MarketTrainingReviewsScreen() {
  const router = useRouter();
  const commentRef = useRef<TextInput>(null);
  const formCardRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const formOffsetY = useRef(0);
  const { id, compose } = useLocalSearchParams<{
    id?: string;
    compose?: string;
  }>();
  const { training, isApiId } = useTraining(id);
  const detail = isApiId ? training : buildStaticTrainingDetail(id);
  const reviewsQuery = useTrainingReviews(isApiId ? id : undefined);
  const submitReview = useSubmitTrainingReview(isApiId ? id : undefined);
  const authEmail = useAuthStore((s) => s.user?.email?.trim() || '');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState(authEmail);

  useEffect(() => {
    if (authEmail) setEmail(authEmail);
  }, [authEmail]);

  useEffect(() => {
    if (compose === '1') {
      const timer = setTimeout(() => {
        scrollToForm();
        commentRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [compose]);

  const scrollToForm = () => {
    // Form sits near the bottom — scroll it into view above the keyboard
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const onFormFieldFocus = () => {
    setTimeout(scrollToForm, Platform.OS === 'ios' ? 280 : 120);
  };

  const canEditForm = isApiId && !submitReview.isPending;

  const reviews = useMemo(() => {
    if (isApiId) return reviewsQuery.reviews;
    return detail?.reviews ?? [];
  }, [isApiId, reviewsQuery.reviews, detail?.reviews]);

  const averageRating = isApiId
    ? reviewsQuery.averageRating
    : detail?.averageRating ?? null;
  const count = isApiId ? reviewsQuery.count : detail?.reviewCount ?? 0;

  const onSubmit = () => {
    if (!isApiTrainingId(id)) {
      Alert.alert('Reviews', 'Live reviews are available for API trainings.');
      return;
    }
    const emailTrimmed = email.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      Alert.alert('Email', 'Enter a valid email for this review.');
      return;
    }
    const trimmed = comment.trim();
    if (!trimmed) {
      Alert.alert('Review', 'Please add a short comment.');
      return;
    }
    if (rating < 1 || rating > 5) {
      Alert.alert('Review', 'Choose a rating from 1 to 5 stars.');
      return;
    }

    submitReview.mutate(
      {
        rating,
        comment: trimmed,
        participant_email: emailTrimmed,
      },
      {
        onSuccess: () => {
          setComment('');
          setRating(5);
          Alert.alert('Thanks', 'Your review was submitted.');
        },
        onError: (error) => {
          Alert.alert('Review failed', reviewErrorMessage(error));
        },
      },
    );
  };

  return (
    <MarketTrainingScreenShell
      eyebrow="Reviews"
      title="Ratings & reviews"
      keyboardAware
      scrollViewRef={scrollRef}
    >
      <View style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Overall rating</Text>
          <View style={styles.ratingHero}>
            <Text style={styles.ratingScore}>
              {averageRating != null && averageRating > 0
                ? averageRating.toFixed(1)
                : '—'}
            </Text>
            <View style={styles.ratingCopy}>
              <RatingStars rating={averageRating ?? 0} size="sm" />
              <Text style={styles.meta}>Based on {count} learner reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{reviews.length} reviews</Text>
          {isApiId && reviewsQuery.isLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={TRAINING_GREEN} />
            </View>
          ) : null}
          <View style={styles.reviewList}>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {review.author.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.reviewCopy}>
                    <View style={styles.nameRow}>
                      <Text style={styles.title}>{review.author}</Text>
                      {review.verified ? (
                        <Text style={styles.verified}>Verified</Text>
                      ) : null}
                    </View>
                    <View style={styles.ratingRow}>
                      <RatingStars rating={review.rating} size="sm" />
                      <Text style={styles.meta}>{review.date}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.body}>{review.comment}</Text>
              </View>
            ))}
          </View>
          {!reviewsQuery.isLoading && reviews.length === 0 ? (
            <Text style={styles.meta}>No reviews yet.</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Add your review</Text>
          <View
            ref={formCardRef}
            collapsable={false}
            onLayout={(event) => {
              formOffsetY.current = event.nativeEvent.layout.y;
            }}
            style={styles.formCard}
          >
            <Text style={styles.helper}>
              Tap stars, write a comment, then submit.
            </Text>

            <Text style={styles.formLabel}>Your rating</Text>
            <RatingStars
              rating={rating}
              onSelect={canEditForm ? setRating : undefined}
              size="lg"
            />
            <Text style={styles.ratingHint}>{rating} / 5 selected</Text>

            {!authEmail ? (
              <>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.inputSingle}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={TRAINING_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={canEditForm}
                  onFocus={onFormFieldFocus}
                />
              </>
            ) : null}

            <Text style={styles.formLabel}>Comment</Text>
            <TextInput
              ref={commentRef}
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder="Share what you learned…"
              placeholderTextColor={TRAINING_MUTED}
              multiline
              textAlignVertical="top"
              editable={canEditForm}
              blurOnSubmit={false}
              onFocus={onFormFieldFocus}
            />

            <Pressable
              style={[
                styles.primary,
                (!canEditForm || submitReview.isPending) &&
                  styles.primaryDisabled,
              ]}
              onPress={onSubmit}
              disabled={!canEditForm || submitReview.isPending}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>
                {submitReview.isPending ? 'Submitting…' : 'Submit review'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.link}
          onPress={() => router.push('/(main)/market/training-wishlist')}
        >
          <Text style={styles.linkText}>View wishlist ›</Text>
        </Pressable>
      </View>
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: c(14, 12),
  },
  section: {
    gap: c(8, 6),
  },
  sectionLabel: {
    fontSize: c(12, 11),
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  ratingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(12, 10),
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#c8e0cc',
    paddingVertical: c(12, 10),
    paddingHorizontal: c(12, 10),
  },
  ratingScore: {
    fontSize: c(32, 28),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  ratingCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(2, 1),
  },
  starHit: {
    minWidth: c(28, 26),
    minHeight: c(28, 26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontWeight: '800',
  },
  starFilled: {
    color: TRAINING_GREEN,
  },
  starEmpty: {
    color: '#c8e0cc',
  },
  ratingHint: {
    marginTop: c(2, 1),
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(12, 10),
  },
  helper: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
    lineHeight: c(16, 15),
    marginBottom: c(2, 1),
  },
  formLabel: {
    marginTop: c(10, 8),
    marginBottom: c(4, 3),
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  inputSingle: {
    height: c(42, 38),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    fontSize: NU.body,
    color: TRAINING_TEAL,
    backgroundColor: '#FFFFFF',
  },
  input: {
    minHeight: c(88, 80),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(8, 7),
    fontSize: NU.body,
    color: TRAINING_TEAL,
    backgroundColor: '#FFFFFF',
  },
  primary: {
    marginTop: c(12, 10),
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: {
    opacity: 0.55,
  },
  primaryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingCard: {
    paddingVertical: c(12, 10),
    alignItems: 'center',
  },
  reviewList: {
    gap: c(8, 6),
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(11, 9),
    gap: c(8, 6),
  },
  reviewTop: {
    flexDirection: 'row',
    gap: c(8, 6),
  },
  avatar: {
    width: c(34, 30),
    height: c(34, 30),
    borderRadius: c(17, 15),
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: c(13, 12),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  reviewCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 5),
    flexWrap: 'wrap',
  },
  title: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  verified: {
    fontSize: c(10, 9),
    fontWeight: '700',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(7, 5),
    paddingVertical: c(2, 1),
    borderRadius: 99,
    overflow: 'hidden',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 5),
  },
  meta: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  body: {
    fontSize: NU.link,
    lineHeight: c(19, 17),
    color: TRAINING_TEAL,
  },
  link: {
    alignSelf: 'flex-start',
    marginTop: c(2, 1),
  },
  linkText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
});
