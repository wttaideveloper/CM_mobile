import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogOutIcon } from '@/components/dashboard/DashboardIcons';
import { EditProfileModal } from '@/components/settings/EditProfileModal';
import { ProfileCard, StatsRow } from '@/components/settings/ProfileCard';
import { SettingsMenuItem } from '@/components/settings/SettingsMenuItem';
import {
  APP_VERSION,
  PROFILE_USER,
  SETTINGS_SECTIONS,
  type SettingsMenuItem as SettingsMenuItemType,
} from '@/constants/settings';
import { useScreenPrivacy } from '@/hooks/useScreenPrivacy';
import { useAuthStore } from '@/stores/auth.store';
import { isSmallDevice } from '@/utils/responsive';
import { SIGN_OUT_RED, styles } from '@/screens/settings/SettingsScreen.styles';

export function SettingsScreen() {
  useScreenPrivacy('settings-profile');
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const fetchAndLogMe = useAuthStore((state) => state.fetchAndLogMe);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const user = useAuthStore((state) => state.user);
  const [editVisible, setEditVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void fetchAndLogMe();
    }, [fetchAndLogMe]),
  );

  const handleOpenEdit = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to edit your profile.');
      return;
    }
    setEditVisible(true);
  };

  const handleMenuPress = (item: SettingsMenuItemType) => {
    if (item.id === 'edit-profile') {
      handleOpenEdit();
      return;
    }
    if (item.id === 'notifications') {
      router.push('/(main)/notification-preferences');
    }
  };

  const displayName = user?.fullName || PROFILE_USER.name;
  const displayEmail = user?.email || PROFILE_USER.email;
  const displayRole = user?.role || PROFILE_USER.role;
  const displayVerified = user?.emailVerified ?? PROFILE_USER.verified;
  const avatarLetter = (displayName.trim()[0] || 'U').toUpperCase();

  const handleSaveProfile = async (payload: { fullName: string }) => {
    await updateProfile(payload);
  };

  const handleSignOutPress = () => {
    Alert.alert('Sign out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + (isSmallDevice ? 20 : 24),
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        <View style={styles.body}>
          <ProfileCard
            name={displayName}
            email={displayEmail}
            role={displayRole}
            avatarLetter={avatarLetter}
            verified={displayVerified}
            onEditPress={handleOpenEdit}
          />
          <StatsRow />

          {SETTINGS_SECTIONS.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, index) => (
                  <SettingsMenuItem
                    key={item.id}
                    item={item}
                    isLast={index === section.items.length - 1}
                    onPress={() => handleMenuPress(item)}
                  />
                ))}
              </View>
            </View>
          ))}

          <Pressable
            onPress={handleSignOutPress}
            style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t('settings.signOut')}
          >
            <LogOutIcon size={isSmallDevice ? 16 : 18} color={SIGN_OUT_RED} />
            <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
          </Pressable>

          <Text style={styles.versionText}>{APP_VERSION}</Text>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editVisible}
        user={user}
        onClose={() => setEditVisible(false)}
        onSave={handleSaveProfile}
      />
    </View>
  );
}
