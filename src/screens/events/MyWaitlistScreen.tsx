import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import { useMyWaitlist } from '@/hooks/useEvents';
import type { MyWaitlistEntry } from '@/types/event.types';
import { detailHref } from '@/utils/searchNavigation';
import { PRIMARY, styles } from '@/screens/events/MyWaitlistScreen.styles';

function MyWaitlistCard({ item }: { item: MyWaitlistEntry }) {
  const router = useRouter();

  const pillStyle = [
    styles.statusPill,
    item.status === 'promoted' && styles.statusPillPromoted,
    item.status === 'left' && styles.statusPillLeft,
  ];
  const pillTextStyle = [
    styles.statusPillText,
    item.status === 'promoted' && styles.statusPillTextPromoted,
    item.status === 'left' && styles.statusPillTextLeft,
  ];

  const canViewTicket = item.status === 'promoted' && Boolean(item.registrationId);

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.eventTitle}
        </Text>
        <View style={pillStyle}>
          <Text style={pillTextStyle}>{item.statusLabel}</Text>
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
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.actionBtnOutlineText}>View Event</Text>
        </Pressable>

        {canViewTicket ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(main)/event/ticket',
                params: { eventId: item.eventId, registrationId: item.registrationId! },
              })
            }
            accessibilityRole="button"
            accessibilityLabel="View ticket"
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnFilled,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.actionBtnFilledText}>View Ticket</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function MyWaitlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();

  const { entries, isLoading, isError, isFetching, refetch } = useMyWaitlist();

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
            My Waitlist
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <EmptyState variant="error" entity="your waitlist" onAction={() => void refetch()} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            entries.length === 0 && { flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => void refetch()}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <EmptyState
                title="You're not on any waitlists."
                description="Events you join the waitlist for will show up here."
              />
            </View>
          }
          renderItem={({ item }) => <MyWaitlistCard item={item} />}
        />
      )}
    </View>
  );
}
