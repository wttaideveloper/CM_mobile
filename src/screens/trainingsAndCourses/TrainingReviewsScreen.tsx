import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
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
} from '@/components/trainingsAndCourses/trainingData';
import {
  isApiTrainingId,
  useMyTrainingEnrolments,
  useSubmitTrainingReview,
  useTraining,
  useTrainingReviews,
} from '@/hooks/useTrainings';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';
import { useAuthStore } from '@/stores/auth.store';
import { getApiErrorMessage } from '@/utils/apiError';
import { buildStaticTrainingDetail } from '@/utils/buildStaticTrainingDetail';
import { c, NU } from '@/utils/newUiCompact';
import { styles } from '@/screens/trainingsAndCourses/TrainingReviewsScreen.styles';

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

export function TrainingReviewsScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { id, compose } = useLocalSearchParams<{
    id?: string;
    compose?: string;
  }>();
  const { training, isApiId } = useTraining(id);
  const detail = isApiId ? training : buildStaticTrainingDetail(id);
  const reviewsQuery = useTrainingReviews(isApiId ? id : undefined);
  const submitReview = useSubmitTrainingReview(isApiId ? id : undefined);
  const enrolments = useMyTrainingEnrolments();
  const authEmail = useAuthStore((s) => s.user?.email?.trim() || '');
  const authName = useAuthStore((s) => s.user?.fullName?.trim() || '');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState(authEmail);

  const isEnrolledLearner =
    Boolean(detail?.canContinueLearning) ||
    (isApiId &&
      Boolean(id) &&
      enrolments.isEnrolled(id) &&
      !enrolments.isPendingApproval(id));

  useEffect(() => {
    if (authEmail) setEmail(authEmail);
  }, [authEmail]);

  useEffect(() => {
    if (compose !== '1') return;
    if (isApiId && !isEnrolledLearner) {
      Alert.alert(
        'Reviews',
        'Only enrolled users can leave a review for this training.',
      );
      return;
    }
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [compose, isApiId, isEnrolledLearner]);

  const canEditForm = isApiId && isEnrolledLearner && !submitReview.isPending;

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
    if (!isEnrolledLearner) {
      Alert.alert(
        'Reviews',
        'Only enrolled users can leave a review for this training.',
      );
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
        ...(authName ? { participant_name: authName } : {}),
      },
      {
        onSuccess: () => {
          setComment('');
          setRating(0);
          Alert.alert('Thanks', 'Your review was submitted.');
        },
        onError: (error) => {
          Alert.alert('Review failed', reviewErrorMessage(error));
        },
      },
    );
  };

  return (
    <TrainingScreenShell
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
                      {(review.author.trim().charAt(0) || 'L').toUpperCase()}
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
          {isApiId && !isEnrolledLearner ? (
            <View style={styles.formCard}>
              <Text style={styles.helper}>
                Only enrolled users can leave a review for this training.
              </Text>
            </View>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.helper}>
                Tap stars, write a comment, then submit.
              </Text>

              <Text style={styles.formLabel}>Your rating</Text>
              <RatingStars
                rating={rating}
                onSelect={canEditForm ? setRating : undefined}
                size="lg"
              />
              <Text style={styles.ratingHint}>
                {rating > 0 ? `${rating} / 5 selected` : 'Tap a star to rate'}
              </Text>

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
                    contextMenuHidden={false}
                  />
                </>
              ) : null}

              <Text style={styles.formLabel}>Comment</Text>
              <TextInput
                style={styles.input}
                value={comment}
                onChangeText={setComment}
                placeholder="Share what you learned…"
                placeholderTextColor={TRAINING_MUTED}
                multiline
                textAlignVertical="top"
                editable={canEditForm}
                blurOnSubmit={false}
                contextMenuHidden={false}
                selectTextOnFocus={false}
                autoCorrect
                spellCheck
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
          )}
        </View>

        <Pressable
          style={styles.link}
          onPress={() => router.push('/(main)/market/training-wishlist')}
        >
          <Text style={styles.linkText}>View wishlist ›</Text>
        </Pressable>
      </View>
    </TrainingScreenShell>
  );
}

