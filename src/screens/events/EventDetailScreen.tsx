import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import { EmptyState } from '@/components/EmptyState';
import { getEventById } from '@/constants/events';
import { useDetailBack } from '@/hooks/useDetailBack';
import {
  EventDetailContent,
  EventDetailFooter,
  EventDetailHero,
  getEventRegisterLabel,
} from '@/screens/events/EventDetailScreenParts';
import { styles } from '@/screens/events/EventDetailScreen.styles';

export function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useDetailBack();
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [isFavorite, setIsFavorite] = useState(false);

  const event = id ? getEventById(id) : undefined;

  if (!event) {
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

  const fillPercent = Math.round((event.registered / event.capacity) * 100);
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
