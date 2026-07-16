import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/notification.service';
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
} from '@/types/notification.types';
import { isSmallDevice } from '@/utils/responsive';
import { shadowSm } from '@/utils/shadows';

const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F7F8F9';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E5E7EB';
const H_PAD = isSmallDevice ? 16 : 20;

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
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={22} color={PRIMARY} />
        </Pressable>
        <Text style={styles.title}>Notification Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={PRIMARY} />
        </View>
      ) : errorMessage && !preferences ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            onPress={() => void loadPreferences()}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 12 : 14,
    backgroundColor: PAGE_BG,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    flex: 1,
    fontSize: isSmallDevice ? 17 : 18,
    lineHeight: isSmallDevice ? 22 : 24,
    fontWeight: '700',
    color: TEXT_BLACK,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    letterSpacing: 0.7,
    marginTop: isSmallDevice ? 12 : 16,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  card: {
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    overflow: 'hidden',
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 4 : 6,
    ...shadowSm,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: isSmallDevice ? 10 : 12,
  },
  preferenceTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  preferenceLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 15,
    color: TEXT_DESC,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: H_PAD,
    gap: 12,
  },
  errorText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 18 : 20,
    color: TEXT_DESC,
    textAlign: 'center',
  },
  inlineError: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 16 : 18,
    color: '#DC2626',
    marginTop: 12,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PAGE_BG,
    ...shadowSm,
  },
  retryText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  pressed: {
    opacity: 0.9,
  },
});
