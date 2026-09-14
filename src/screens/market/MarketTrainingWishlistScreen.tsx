import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';

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
  useMyTrainingEnrolments,
  useMyTrainingWishlist,
  useToggleTrainingWishlist,
} from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { c, NU } from '@/utils/newUiCompact';

function formatAddedAt(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MarketTrainingWishlistScreen() {
  const router = useRouter();
  const apiWishlist = useMyTrainingWishlist();
  const enrolments = useMyTrainingEnrolments();
  const toggleApi = useToggleTrainingWishlist();

  const items = apiWishlist.items;
  const loading = apiWishlist.isLoading && items.length === 0;
  const refreshing = apiWishlist.isFetching && !loading;

  useFocusEffect(
    useCallback(() => {
      void apiWishlist.refetch();
    }, [apiWishlist.refetch]),
  );

  return (
    <MarketTrainingScreenShell
      eyebrow="Saved"
      title="Wishlist"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            void apiWishlist.refetch();
          }}
          tintColor={TRAINING_TEAL}
        />
      }
    >
      <TrainingSection
        label={
          loading
            ? 'Loading saved trainings…'
            : `${items.length} saved training${items.length === 1 ? '' : 's'}`
        }
      >
        {loading ? (
          <TrainingCard>
            <View style={styles.loadingRow}>
              <ActivityIndicator color={TRAINING_TEAL} />
              <Text style={styles.meta}>Fetching your wishlist…</Text>
            </View>
          </TrainingCard>
        ) : items.length === 0 ? (
          <TrainingCard>
            <Text style={styles.meta}>
              {apiWishlist.isError
                ? 'Could not load wishlist. Pull down to retry, or save a training from detail.'
                : 'Nothing saved yet. Tap Wishlist on a training detail page.'}
            </Text>
          </TrainingCard>
        ) : (
          items.map((item) => {
            const added = formatAddedAt(item.addedAt);
            const enrolled = enrolments.isEnrolled(item.id);
            return (
              <TrainingCard key={item.id}>
                <Pressable
                  style={styles.cardTop}
                  onPress={() =>
                    router.push({
                      pathname: '/(main)/market/training-detail',
                      params: { id: item.id },
                    })
                  }
                  accessibilityRole="button"
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.thumb}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={[styles.thumb, styles.thumbFallback]} />
                  )}
                  <View style={styles.copy}>
                    {item.modeLabel ? (
                      <View style={styles.modePill}>
                        <Text style={styles.modePillText}>
                          {item.modeLabel.toUpperCase()}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={styles.title} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.meta} numberOfLines={2}>
                      {[
                        enrolled ? 'Already enrolled' : null,
                        item.detail !== 'Saved training' ? item.detail : null,
                        item.priceLabel,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      {added ? ` · Saved ${added}` : ''}
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.row}>
                  <Pressable
                    style={[
                      styles.secondary,
                      enrolled && styles.secondaryEnrolled,
                    ]}
                    onPress={() =>
                      enrolled
                        ? router.push({
                            pathname: '/(main)/market/my-training-progress',
                            params: { id: item.id },
                          })
                        : router.push({
                            pathname: '/(main)/market/training-checkout',
                            params: {
                              id: item.id,
                              title: item.title,
                              price: item.priceLabel,
                            },
                          })
                    }
                  >
                    <Text
                      style={[
                        styles.secondaryText,
                        enrolled && styles.secondaryTextEnrolled,
                      ]}
                    >
                      {enrolled ? 'Continue' : 'Enroll'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.remove}
                    onPress={() => {
                      toggleApi.mutate(
                        { trainingId: item.id, wishlisted: true },
                        {
                          onError: () =>
                            Alert.alert(
                              'Wishlist',
                              'Could not remove from wishlist. Try again.',
                            ),
                        },
                      );
                    }}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              </TrainingCard>
            );
          })
        )}
      </TrainingSection>
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
  },
  cardTop: {
    flexDirection: 'row',
    gap: c(12, 10),
    alignItems: 'center',
  },
  thumb: {
    width: c(72, 64),
    height: c(72, 64),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: '#d7e8db',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
  },
  thumbFallback: {
    backgroundColor: '#e8f0ea',
  },
  copy: {
    flex: 1,
    gap: c(4, 3),
  },
  modePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: c(8, 7),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    backgroundColor: '#eaf1ff',
  },
  modePillText: {
    fontSize: c(10, 9),
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#3c63c8',
  },
  title: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  meta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  row: {
    marginTop: c(12, 10),
    flexDirection: 'row',
    gap: c(8, 6),
  },
  secondary: {
    flex: 1,
    height: c(40, 36),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryEnrolled: {
    backgroundColor: '#e8f6ec',
    borderWidth: 1,
    borderColor: '#b7dfc2',
  },
  secondaryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryTextEnrolled: {
    color: TRAINING_GREEN,
  },
  remove: {
    height: c(40, 36),
    paddingHorizontal: c(16, 14),
    borderRadius: 99,
    backgroundColor: '#e8f6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
});
