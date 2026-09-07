import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BellIcon } from '@/components/dashboard/DashboardIcons';
import { HOME_BELL_ICON_SIZE, HOME_WHITE } from '@/components/home/homeData';
import { homePartsStyles as styles } from '@/components/home/homePartsStyles';
import { fetchNotificationUnreadCount } from '@/services/notification.service';

export function HomeNotificationBell() {
  const { t } = useTranslation();
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await fetchNotificationUnreadCount();
      setUnreadNotifications(data.unread_count);
    } catch (error) {
      if (__DEV__) {
        console.error('[NOTIFICATIONS] Unread count API ← failed', error);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadUnreadCount();
    }, [loadUnreadCount]),
  );

  const badgeLabel =
    unreadNotifications > 99 ? '99+' : String(unreadNotifications);

  return (
    <Pressable
      onPress={() => router.push('/(main)/notifications')}
      style={({ pressed }) => [styles.bellOuter, pressed && styles.pressed]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        unreadNotifications > 0
          ? t('home.notificationsUnread', { count: badgeLabel })
          : t('home.notifications')
      }
    >
      <View style={styles.headerIconWrap}>
        <BellIcon size={HOME_BELL_ICON_SIZE} color={HOME_WHITE} />
      </View>
      <View style={styles.headerIconBadge}>
        <Text style={styles.headerIconBadgeText}>{badgeLabel}</Text>
      </View>
    </Pressable>
  );
}
