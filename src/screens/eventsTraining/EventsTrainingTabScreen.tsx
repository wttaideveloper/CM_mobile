import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EVENTS_TRAINING_BG,
  EVENTS_TRAINING_BORDER,
  EVENTS_TRAINING_MUTED,
  EVENTS_TRAINING_TEAL,
  EVENTS_TRAINING_TRACK,
  EventsTrainingTabHeader,
  type EventsTrainingTab,
} from '@/components/eventsTraining/EventsTrainingTabHeader';
import { MarketEventListBody } from '@/components/market/MarketEventListBody';
import { MarketTrainingCard } from '@/components/market/MarketTrainingCard';
import {
  MARKET_TRAININGS,
  TRAINING_GREEN,
  TRAINING_MUTED,
} from '@/components/market/marketTrainingData';
import { useTrainingsList } from '@/hooks/useTrainings';
import { c, NU } from '@/utils/newUiCompact';

function SectionHeader({
  label,
  count,
  hint,
}: {
  label: string;
  count?: number;
  hint?: string;
}) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionLabel}>{label}</Text>
        {typeof count === 'number' ? (
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{count}</Text>
          </View>
        ) : null}
      </View>
      {hint ? <Text style={styles.helper}>{hint}</Text> : null}
    </View>
  );
}

function EventsPanel() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('All');

  return (
    <ScrollView
      style={styles.panelScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.panelContent,
        { paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <MarketEventListBody filter={filter} onFilterChange={setFilter} />
    </ScrollView>
  );
}

function TrainingPanel() {
  const insets = useSafeAreaInsets();
  const {
    items: apiItems,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    total,
  } = useTrainingsList({
    page: 1,
    page_size: 50,
  });

  const staticItems = useMemo(() => {
    const apiIds = new Set(apiItems.map((item) => item.id));
    return MARKET_TRAININGS.filter((item) => !apiIds.has(item.id));
  }, [apiItems]);

  return (
    <ScrollView
      style={styles.panelScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.panelContent,
        { paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.trainingBody}>
        <SectionHeader
          label="Live trainings"
          count={apiItems.length || total}
          hint="Pulled from /api/v1/trainings/"
        />

        {isLoading && apiItems.length === 0 ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={TRAINING_GREEN} />
            <Text style={styles.stateText}>Loading trainings…</Text>
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

        {!isLoading && !isError && apiItems.length === 0 ? (
          <View style={styles.emptySoft}>
            <Text style={styles.stateText}>No API trainings yet.</Text>
          </View>
        ) : null}

        <View style={styles.cardStack}>
          {apiItems.map((item) => (
            <MarketTrainingCard key={`api-${item.id}`} item={item} />
          ))}
        </View>

        {isFetching && apiItems.length > 0 ? (
          <ActivityIndicator color={TRAINING_GREEN} style={styles.fetching} />
        ) : null}

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>UI reference</Text>
          <View style={styles.dividerLine} />
        </View>

        <SectionHeader
          label="Static samples"
          count={staticItems.length}
          hint="Kept at the end so you can compare layout"
        />

        <View style={styles.cardStack}>
          {staticItems.map((item) => (
            <MarketTrainingCard key={`static-${item.id}`} item={item} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export function EventsTrainingTabScreen() {
  const [activeTab, setActiveTab] = useState<EventsTrainingTab>('Events');

  return (
    <View style={styles.screen}>
      <EventsTrainingTabHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        subtitle={
          activeTab === 'Events'
            ? 'Classes, meetups and courses near you'
            : 'Cohorts, labs and skill programs to join'
        }
      />
      {activeTab === 'Events' ? <EventsPanel /> : <TrainingPanel />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: EVENTS_TRAINING_BG,
  },
  panelScroll: {
    flex: 1,
  },
  panelContent: {
    flexGrow: 1,
  },
  trainingBody: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    gap: NU.cardGap,
  },
  sectionHead: {
    gap: c(4, 3),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: EVENTS_TRAINING_MUTED,
  },
  countPill: {
    minWidth: c(24, 22),
    paddingHorizontal: c(8, 6),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    backgroundColor: EVENTS_TRAINING_TRACK,
    alignItems: 'center',
  },
  countPillText: {
    fontSize: c(11.5, 10.5),
    fontWeight: '800',
    color: EVENTS_TRAINING_TEAL,
  },
  helper: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  cardStack: {
    gap: NU.cardGap,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    marginTop: c(6, 4),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: EVENTS_TRAINING_BORDER,
  },
  dividerText: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: EVENTS_TRAINING_MUTED,
  },
  stateBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: EVENTS_TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(22, 18),
    paddingHorizontal: c(15, 12),
    alignItems: 'center',
    gap: c(10, 8),
  },
  emptySoft: {
    backgroundColor: EVENTS_TRAINING_TRACK,
    borderRadius: NU.cardRadiusSm,
    paddingVertical: c(14, 12),
    paddingHorizontal: c(14, 12),
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
    backgroundColor: EVENTS_TRAINING_TEAL,
  },
  retryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fetching: {
    marginTop: c(4, 2),
  },
});
