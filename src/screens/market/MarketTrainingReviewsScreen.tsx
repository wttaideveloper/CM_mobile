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
  TrainingCard,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
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
  const fontSize = size === 'lg' ? c(28, 24) : size === 'sm' ? c(16, 14) : c(26, 22);

  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Pressable
          key={value}
          disabled={!onSelect}
          onPress={() => onSelect?.(value)}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
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
      <TrainingSection label="Overall rating">
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
      </TrainingSection>

      <TrainingSection label={`${reviews.length} reviews`}>
        {isApiId && reviewsQuery.isLoading ? (
          <TrainingCard>
            <ActivityIndicator color={TRAINING_GREEN} />
          </TrainingCard>
        ) : null}
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
        {!reviewsQuery.isLoading && reviews.length === 0 ? (
          <Text style={styles.meta}>No reviews yet.</Text>
        ) : null}
      </TrainingSection>

      <TrainingSection label="Add your review">
        <View
          ref={formCardRef}
          collapsable={false}
          onLayout={(event) => {
            formOffsetY.current = event.nativeEvent.layout.y;
          }}
        >
          <TrainingCard>
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
          </TrainingCard>
        </View>
      </TrainingSection>

      <Pressable
        style={styles.link}
        onPress={() => router.push('/(main)/market/training-wishlist')}
      >
        <Text style={styles.linkText}>View wishlist ›</Text>
      </Pressable>
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  ratingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(14, 12),
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    borderWidth: 1,
    borderColor: '#c8e0cc',
    paddingVertical: c(16, 13),
    paddingHorizontal: c(16, 13),
  },
  ratingScore: {
    fontSize: c(36, 30),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  ratingCopy: {
    flex: 1,
    gap: c(4, 3),
  },
  formTitle: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(4, 2),
  },
  starHit: {
    minWidth: c(36, 32),
    minHeight: c(40, 36),
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
    marginTop: c(4, 2),
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
  helper: {
    marginTop: c(6, 4),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  formLabel: {
    marginTop: c(12, 10),
    marginBottom: c(6, 4),
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  inputSingle: {
    height: c(44, 40),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    fontSize: NU.body,
    color: TRAINING_TEAL,
    backgroundColor: '#FFFFFF',
  },
  input: {
    minHeight: c(100, 90),
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(10, 8),
    fontSize: NU.body,
    color: TRAINING_TEAL,
    backgroundColor: '#FFFFFF',
  },
  primary: {
    marginTop: c(14, 12),
    height: c(46, 42),
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
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(14, 12),
    gap: c(10, 8),
  },
  reviewTop: {
    flexDirection: 'row',
    gap: c(10, 8),
  },
  avatar: {
    width: c(40, 36),
    height: c(40, 36),
    borderRadius: c(20, 18),
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: c(15, 13),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  reviewCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    flexWrap: 'wrap',
  },
  title: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  verified: {
    fontSize: c(10.5, 9.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(8, 6),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    overflow: 'hidden',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  meta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  body: {
    fontSize: NU.link,
    lineHeight: c(20, 18),
    color: TRAINING_TEAL,
  },
  link: {
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
});
