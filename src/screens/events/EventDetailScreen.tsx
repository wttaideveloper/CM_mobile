import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { useEvent } from '@/hooks/useEvents';
import { useDetailBack } from '@/hooks/useDetailBack';
import {
  EventDetailContent,
  EventDetailFooter,
  EventDetailHero,
  getEventRegisterLabel,
} from '@/screens/events/EventDetailScreenParts';
import { PRIMARY, styles } from '@/screens/events/EventDetailScreen.styles';

export function EventDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const router = useRouter();
  const goBack = useDetailBack();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [isFavorite, setIsFavorite] = useState(false);

  const { event, isLoading, isError } = useEvent(id, { enabled: Boolean(id) });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      </View>
    );
  }

  if (!event || isError) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <EmptyState
          variant="notFound"
          entity="event"
          onAction={goBack}
          actionLabel="Go back"
        />
      </View>
    );
  }

  const fillPercent =
    event.capacity > 0 ? Math.round((event.registered / event.capacity) * 100) : 0;
  const spotsRemaining = event.capacity - event.registered;
  const registerLabel = getEventRegisterLabel(event);

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.body}>
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 76 }}
        >
          <EventDetailHero
            event={event}
            isFavorite={isFavorite}
            onBack={goBack}
            onToggleFavorite={() => setIsFavorite((current) => !current)}
          />
          <EventDetailContent
            event={event}
            fillPercent={fillPercent}
            spotsRemaining={spotsRemaining}
          />
        </ScrollView>

        <EventDetailFooter
          registerLabel={registerLabel}
          paddingBottom={insets.bottom + 10}
          onRegister={() => router.replace('/(main)/(tabs)/events/courses')}
        />
      </View>
    </View>
  );
}
