import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  EVENT_LIST_MUTED,
  EVENT_LIST_TEAL,
} from '@/components/market/marketEventListData';
import { MY_REGISTERED_EVENTS } from '@/components/market/marketMyEventsData';
import {
  TRAINING_GREEN,
  TRAINING_MUTED,
} from '@/components/market/marketTrainingData';
import {
  TrainingCard,
  TrainingSection,
} from '@/components/market/MarketTrainingUi';
import { MarketTrainingScreenShell } from '@/screens/market/MarketTrainingScreenShell';
import { c, NU } from '@/utils/newUiCompact';

export function MarketMyEventsScreen() {
  const router = useRouter();

  return (
    <MarketTrainingScreenShell eyebrow="Registered" title="My Events">
      <TrainingSection label={`${MY_REGISTERED_EVENTS.length} events`}>
        <Text style={styles.helper}>
          Your RSVPs and registrations. Tap an event for details.
        </Text>
        {MY_REGISTERED_EVENTS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname: '/(main)/market/event-detail',
                params: { id: item.id },
              })
            }
            accessibilityRole="button"
          >
            <TrainingCard>
              <View style={styles.row}>
                <View style={[styles.side, { backgroundColor: item.sideBg }]}>
                  <Text style={[styles.sideTop, { color: item.sideTopColor }]}>
                    {item.sideTop}
                  </Text>
                  <Text
                    style={[styles.sideBottom, { color: item.sideBottomColor }]}
                  >
                    {item.sideBottom}
                  </Text>
                </View>
                <View style={styles.copy}>
                  <View style={styles.badgeRow}>
                    <Text
                      style={[
                        styles.status,
                        {
                          color: item.statusColor,
                          backgroundColor: item.statusBg,
                        },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                    <Text style={styles.when}>{item.when}</Text>
                  </View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.detail}>{item.detail}</Text>
                  <Text style={styles.cta}>View event ›</Text>
                </View>
              </View>
            </TrainingCard>
          </Pressable>
        ))}
      </TrainingSection>
    </MarketTrainingScreenShell>
  );
}

const styles = StyleSheet.create({
  helper: {
    marginBottom: c(4, 2),
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
    lineHeight: c(18, 16),
  },
  row: {
    flexDirection: 'row',
    gap: NU.cardGap,
  },
  side: {
    width: c(56, 48),
    borderRadius: NU.cardRadiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: c(12, 10),
  },
  sideTop: {
    fontSize: c(11, 10),
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  sideBottom: {
    marginTop: c(2, 1),
    fontSize: c(18, 16),
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    gap: c(4, 3),
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: c(8, 6),
  },
  status: {
    fontSize: NU.label,
    fontWeight: '700',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(7, 6),
    borderRadius: c(5, 4),
    overflow: 'hidden',
  },
  when: {
    fontSize: c(12, 11),
    color: EVENT_LIST_MUTED,
    fontWeight: '600',
  },
  title: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: EVENT_LIST_TEAL,
  },
  detail: {
    fontSize: c(12.5, 11.5),
    color: EVENT_LIST_MUTED,
    lineHeight: c(18, 16),
  },
  cta: {
    marginTop: c(4, 2),
    fontSize: NU.link,
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
});
