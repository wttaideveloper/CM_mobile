import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MarketTrainingCard } from '@/components/market/MarketTrainingCard';
import {
  MARKET_TRAININGS,
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TYPE_CARDS,
  type TrainingListItem,
} from '@/components/market/marketTrainingData';
import { TrainingSection } from '@/components/market/MarketTrainingUi';
import { useTrainingsList } from '@/hooks/useTrainings';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { c, NU } from '@/utils/newUiCompact';

type TypeFilter = (typeof TRAINING_TYPE_CARDS)[number]['id'];

export function MarketTrainingListScreen() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('Virtual');
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const selectedType = TRAINING_TYPE_CARDS.find((item) => item.id === typeFilter)!;

  const {
    items: apiItems,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useTrainingsList({
    search: debouncedSearch || undefined,
    page: 1,
    page_size: 50,
  });

  const items = useMemo(() => {
    const apiIds = new Set(apiItems.map((item) => item.id));
    const staticExtras = MARKET_TRAININGS.filter((item) => !apiIds.has(item.id));
    const merged: TrainingListItem[] = [...apiItems, ...staticExtras];

    return merged.filter((item) => {
      if (item.mode !== selectedType.mode) return false;
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
      );
    });
  }, [apiItems, selectedType.mode, debouncedSearch]);

  return (
    <MarketTrainingScreenShell eyebrow="Browse" title="Trainings">
      <TrainingSection label="Choose training type">
        <Text style={styles.helper}>
          Pick Virtual, Hybrid, or Physical — same types as on the training
          detail screen.
        </Text>
        <View style={styles.typeRow}>
          {TRAINING_TYPE_CARDS.map((type) => {
            const active = type.id === typeFilter;
            return (
              <Pressable
                key={type.id}
                style={[
                  styles.typeCard,
                  { backgroundColor: type.bg, borderColor: type.bg },
                  active && {
                    borderColor: type.color,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setTypeFilter(type.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.typeTitle, { color: type.color }]}>
                  {type.title}
                </Text>
                <Text style={styles.typeSubtitle}>{type.subtitle}</Text>
                {active ? (
                  <Text style={[styles.typeActive, { color: type.color }]}>
                    Selected
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </TrainingSection>

      <TrainingSection label={`Search ${selectedType.title.toLowerCase()}`}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder={`Search ${selectedType.title.toLowerCase()} trainings`}
          placeholderTextColor={TRAINING_MUTED}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </TrainingSection>

      <TrainingSection
        label={`${items.length} ${selectedType.title.toLowerCase()} training${items.length === 1 ? '' : 's'}`}
      >
        {isLoading && items.length === 0 ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={TRAINING_GREEN} />
          </View>
        ) : null}

        {isError && apiItems.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              {error?.message || 'Could not load trainings.'}
            </Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => refetch()}
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>
                {isFetching ? 'Retrying…' : 'Retry'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <Text style={styles.stateText}>
            No {selectedType.title.toLowerCase()} trainings yet. Try another
            type.
          </Text>
        ) : null}

        {items.map((item) => (
          <MarketTrainingCard key={item.id} item={item} />
        ))}

        {isFetching && apiItems.length > 0 ? (
          <ActivityIndicator color={TRAINING_GREEN} style={styles.fetching} />
        ) : null}
      </TrainingSection>
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  helper: {
    marginBottom: c(2, 1),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  typeRow: {
    flexDirection: 'row',
    gap: c(8, 6),
  },
  typeCard: {
    flex: 1,
    borderRadius: NU.cardRadiusSm,
    borderWidth: 1,
    paddingVertical: c(12, 10),
    paddingHorizontal: c(8, 6),
    gap: c(4, 3),
    minHeight: c(88, 78),
  },
  typeTitle: {
    fontSize: NU.link,
    fontWeight: '800',
  },
  typeSubtitle: {
    fontSize: c(11, 10),
    color: TRAINING_MUTED,
    lineHeight: c(15, 14),
  },
  typeActive: {
    marginTop: 'auto',
    fontSize: c(11, 10),
    fontWeight: '800',
  },
  search: {
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingHorizontal: c(12, 10),
    paddingVertical: c(12, 10),
    backgroundColor: '#FFFFFF',
    fontSize: NU.link,
    color: TRAINING_TEAL,
  },
  stateBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(22, 18),
    paddingHorizontal: c(15, 12),
    alignItems: 'center',
    gap: c(10, 8),
  },
  stateText: {
    fontSize: NU.body,
    color: TRAINING_MUTED,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: c(14, 12),
    paddingVertical: c(8, 7),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
  },
  retryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fetching: {
    marginTop: c(8, 6),
  },
});
