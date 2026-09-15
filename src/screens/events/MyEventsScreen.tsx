import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import { useMyRegistrations } from '@/hooks/useEvents';
import type { MyEventBucket, MyEventRegistration } from '@/types/event.types';
import { detailHref } from '@/utils/searchNavigation';
import { PRIMARY, styles } from '@/screens/events/MyEventsScreen.styles';

const TABS: { key: MyEventBucket; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function MyEventCard({ item }: { item: MyEventRegistration }) {
  const router = useRouter();

  const pillStyle = [
    styles.statusPill,
    item.bucket === 'cancelled' && styles.statusPillCancelled,
    item.bucket === 'completed' && styles.statusPillCompleted,
  ];
  const pillTextStyle = [
    styles.statusPillText,
    item.bucket === 'cancelled' && styles.statusPillTextCancelled,
    item.bucket === 'completed' && styles.statusPillTextCompleted,
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.eventTitle}
        </Text>
        <View style={pillStyle}>
          <Text style={pillTextStyle}>{item.registrationStatusLabel}</Text>
        </View>
      </View>
      <Text style={styles.cardMeta}>{item.eventStartLabel}</Text>

      <View style={styles.cardActions}>
        <Pressable
          onPress={() => router.push(detailHref('/(main)/event', item.eventId))}
          accessibilityRole="button"
          accessibilityLabel="View event details"
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnOutline,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionBtnOutlineText}>View Details</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(main)/event/ticket',
              params: { eventId: item.eventId, registrationId: item.registrationId },
            })
          }
          disabled={!item.hasQr}
          accessibilityRole="button"
          accessibilityLabel="View ticket"
          accessibilityState={{ disabled: !item.hasQr }}
          accessibilityHint={item.hasQr ? undefined : 'No ticket available for this registration'}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnFilled,
            !item.hasQr && { opacity: 0.5 },
            pressed && item.hasQr && styles.pressed,
          ]}
        >
          <Text style={styles.actionBtnFilledText}>View Ticket</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function MyEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [activeTab, setActiveTab] = useState<MyEventBucket>('upcoming');

  const { registrations, isLoading, isError, refetch } = useMyRegistrations();

  const filtered = useMemo(
    () => registrations.filter((item) => item.bucket === activeTab),
    [registrations, activeTab],
  );

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <ChevronLeftIcon size={22} color={PRIMARY} />
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">
            My Events
          </Text>
        </View>

        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
                style={[styles.tab, isActive && styles.tabActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <EmptyState
            variant="error"
            entity="registered events"
            onAction={() => void refetch()}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.registrationId}
          contentContainerStyle={[
            styles.listContent,
            filtered.length === 0 && { flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <EmptyState
                title="No registered events yet."
                description={
                  activeTab === 'upcoming'
                    ? "Events you register for will show up here."
                    : `You have no ${activeTab} events.`
                }
              />
            </View>
          }
          renderItem={({ item }) => <MyEventCard item={item} />}
        />
      )}
    </View>
  );
}
