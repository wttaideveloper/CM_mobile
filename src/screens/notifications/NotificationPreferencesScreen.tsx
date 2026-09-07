import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { H_PAD, PRIMARY, styles } from '@/screens/notifications/NotificationPreferencesScreen.styles';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { PreferenceSkeletonList } from '@/components/ui/Skeleton.screens';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/notification.service';
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
} from '@/types/notification.types';
import { isSmallDevice } from '@/utils/responsive';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PREFERENCE_ITEMS = [
  {
    key: 'email_enabled' as const,
    label: 'Email Notifications',
    subtitle: 'Receive updates by email',
  },
  {
    key: 'push_enabled' as const,
    label: 'Push / App Notifications',
    subtitle: 'Alerts on this device via Firebase',
  },
  {
    key: 'sms_enabled' as const,
    label: 'SMS / Text Notifications',
    subtitle: 'Text messages via Bravo SMS',
  },
  {
    key: 'in_app_enabled' as const,
    label: 'In-App Notifications',
    subtitle: 'Badge and notification history in the app',
  },
];

function PreferenceRow({
  label,
  subtitle,
  value,
  disabled,
  onValueChange,
}: {
  label: string;
  subtitle: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceTextWrap}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled, checked: value }}
        trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
        thumbColor={value ? PRIMARY : '#F9FAFB'}
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );
}

export function NotificationPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchNotificationPreferences();
      setPreferences(data);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not load notification preferences.';

      setErrorMessage(message);

      if (__DEV__) {
        console.error('[NOTIFICATIONS] Preferences GET ← failed', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPreferences();
    }, [loadPreferences]),
  );

  const persistPreferences = async (payload: UpdateNotificationPreferencesRequest) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const data = await updateNotificationPreferences(payload);
      setPreferences(data);
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not update notification preferences.';

      setErrorMessage(message);

      if (__DEV__) {
        console.error('[NOTIFICATIONS] Preferences PUT ← failed', error);
      }

      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (
    key: keyof Pick<
      NotificationPreferences,
      'email_enabled' | 'push_enabled' | 'sms_enabled' | 'in_app_enabled'
    >,
    nextValue: boolean,
  ) => {
    if (!preferences || isSaving) return;

    const previous = preferences;
    setPreferences({ ...preferences, [key]: nextValue });

    try {
      await persistPreferences({ [key]: nextValue });
    } catch {
      setPreferences(previous);
    }
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.header, { paddingTop: 12 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={22} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Notification Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={{ paddingTop: 12 }}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: H_PAD }]}>CHANNELS</Text>
          <PreferenceSkeletonList />
        </View>
      ) : errorMessage && !preferences ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            onPress={() => void loadPreferences()}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : preferences ? (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: H_PAD,
            paddingBottom: insets.bottom + (isSmallDevice ? 20 : 24),
          }}
        >
          <Text style={styles.sectionTitle}>CHANNELS</Text>
          <View style={styles.card}>
            {PREFERENCE_ITEMS.map((item, index) => (
              <View key={item.key}>
                <PreferenceRow
                  label={item.label}
                  subtitle={item.subtitle}
                  value={preferences[item.key]}
                  disabled={isSaving}
                  onValueChange={(next) => void handleToggle(item.key, next)}
                />
                {index < PREFERENCE_ITEMS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>

          {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}
        </ScrollView>
      ) : null}
    </View>
  );
}
