import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { EmptyState } from '@/components/EmptyState';
import { useLeaveWaitlist, useMyWaitlist } from '@/hooks/useEvents';
import type { MyWaitlistEntry } from '@/types/event.types';
import { detailHref } from '@/utils/searchNavigation';
import { EXPIRED, PRIMARY, styles } from '@/screens/events/MyWaitlistScreen.styles';

function CountdownTimer({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function updateTimer() {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`Expires in ${mins}:${secs.toString().padStart(2, '0')}`);
    }
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return <Text style={styles.countdownText}>{timeLeft}</Text>;
}

function MyWaitlistCard({ item }: { item: MyWaitlistEntry }) {
  const router = useRouter();
  const leaveMutation = useLeaveWaitlist();

  const pillStyle = [
    styles.statusPill,
    item.status === 'promoted' && styles.statusPillPromoted,
    item.status === 'payment_pending' && styles.statusPillPending,
    item.status === 'expired' && styles.statusPillExpired,
    item.status === 'left' && styles.statusPillLeft,
  ];
  const pillTextStyle = [
    styles.statusPillText,
    item.status === 'promoted' && styles.statusPillTextPromoted,
    item.status === 'payment_pending' && styles.statusPillTextPending,
    item.status === 'expired' && styles.statusPillTextExpired,
    item.status === 'left' && styles.statusPillTextLeft,
  ];

  const canViewTicket = item.status === 'promoted' && Boolean(item.registrationId);
  // Only an active entry (still in line, or holding an unclaimed payment
  // offer) can be left — same eligibility EventWaitlistScreen's own leave
  // action assumes. Once promoted/expired/left, the entry is already
  // settled and there's nothing left to leave.
  const canLeave = item.status === 'waiting' || item.status === 'payment_pending';

  function handleLeave() {
    if (leaveMutation.isPending) return;

    Alert.alert(
      'Leave waitlist?',
      `You'll lose your place in line for ${item.eventTitle}.`,
      [
        { text: 'Stay on waitlist', style: 'cancel' },
        {
          text: 'Leave Waitlist',
          style: 'destructive',
          onPress: () => {
            leaveMutation.mutate(
              { eventId: item.eventId, entryId: item.id },
              {
                onError: (error) => {
                  Alert.alert(
                    'Couldn’t leave waitlist',
                    error.message?.trim() || 'Something went wrong. Please try again.',
                  );
                },
              },
            );
          },
        },
      ],
    );
  }

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

      {item.status === 'payment_pending' && item.paymentOfferExpiresAt ? (
        <CountdownTimer expiresAt={item.paymentOfferExpiresAt} />
      ) : null}

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

        {canLeave ? (
          <Pressable
            onPress={handleLeave}
            disabled={leaveMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Leave waitlist"
            accessibilityState={{ disabled: leaveMutation.isPending }}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnDanger,
              (pressed || leaveMutation.isPending) && { opacity: 0.7 },
            ]}
          >
            {leaveMutation.isPending ? (
              <ActivityIndicator size="small" color={EXPIRED} />
            ) : (
              <Text style={styles.actionBtnDangerText}>Leave</Text>
            )}
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
