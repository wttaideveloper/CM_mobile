import { useRouter } from 'expo-router';
import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronRightIcon,
  LogOutIcon,
} from '@/components/dashboard/DashboardIcons';
import { PROFILE_USER, SETTINGS_SECTIONS } from '@/constants/settings';
import { useAuthStore } from '@/stores/auth.store';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const EMERALD_50 = '#eaf4ec80';
const SIGN_OUT_BG = '#fef2f2';
const SIGN_OUT_BORDER = '#FECACA';
const SIGN_OUT_RED = '#DC2626';
const H_PAD = 20;

function SettingsMenuItem({
  label,
  isLast,
  onPress,
}: {
  label: string;
  isLast: boolean;
  onPress?: () => void;
}) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.menuItem,
          pressed && styles.menuItemPressed,
        ]}
      >
        <Text style={styles.menuItemText}>{label}</Text>
        <ChevronRightIcon size={18} color="#C5D5CC" />
      </Pressable>
      {!isLast && <View style={styles.menuDivider} />}
    </View>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const statusBarFill = useStatusBarBackground();
  const logout = useAuthStore((state) => state.logout);

  const handleMenuPress = (label: string) => {
    if (label === 'Notifications') {
      router.push('/(main)/notifications');
    }
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar />

      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.profileBand}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{PROFILE_USER.avatarLetter}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{PROFILE_USER.name}</Text>
              <Text style={styles.profileEmail}>{PROFILE_USER.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{PROFILE_USER.role}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {SETTINGS_SECTIONS.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, index) => (
                  <SettingsMenuItem
                    key={item}
                    label={item}
                    isLast={index === section.items.length - 1}
                    onPress={() => handleMenuPress(item)}
                  />
                ))}
              </View>
            </View>
          ))}

          <Pressable
            onPress={logout}
            style={({ pressed }) => [
              styles.signOutBtn,
              pressed && styles.signOutPressed,
            ]}
          >
            <LogOutIcon size={18} color={SIGN_OUT_RED} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: BODY_BG,
  },
  scroll: {
    flex: 1,
  },
  titleWrap: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 8 :  12,
    paddingBottom: isSmallDevice ? 16 :  20,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 32,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  profileBand: {
    backgroundColor: EMERALD_50,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    paddingVertical: isSmallDevice ? 16 :  20,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 12 :  14,
    paddingHorizontal: H_PAD,
  },
  avatar: {
    width: isSmallDevice ? 48 : 52,
    height: isSmallDevice ? 48 :  52,
    borderRadius: isSmallDevice ? 12 :  14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: isSmallDevice ? 15 : 17,
    lineHeight: 24,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 1 :  2,
  },
  profileEmail: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    fontWeight: '400',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 :  8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MINT,
    paddingHorizontal: isSmallDevice ? 8 :  10,
    paddingVertical: isSmallDevice ? 3 :  4,
    borderRadius: isSmallDevice ? 10 :  12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  roleBadgeText: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '600',
    color: PRIMARY,
  },
  body: {
    paddingHorizontal: H_PAD,
  },
  section: {
    marginBottom: isSmallDevice ? 16 :  20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: 16,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.6,
    marginBottom: isSmallDevice ? 8 :  10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 14 :  16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 12 :  16,
    paddingVertical: isSmallDevice ? 12 :  15,
    backgroundColor: '#FFFFFF',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: isSmallDevice ? 12 :  16,
    marginRight: isSmallDevice ? 12 :  16,
  },
  menuItemPressed: {
    opacity: 0.92,
  },
  menuItemText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '600',
    color: TEXT_BLACK,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 6 :  8,
    backgroundColor: SIGN_OUT_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    borderWidth: 0.5,
    borderColor: SIGN_OUT_BORDER,
    paddingVertical: 16,
    marginTop: 4,
  },
  signOutPressed: {
    opacity: 0.9,
  },
  signOutText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    fontWeight: '700',
    color: SIGN_OUT_RED,
  },
});
