import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronRightIcon,
  LogOutIcon,
} from '@/components/dashboard/DashboardIcons';
import {
  APP_VERSION,
  PROFILE_USER,
  SETTINGS_SECTIONS,
  type SettingsMenuItem,
} from '@/constants/settings';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthUser } from '@/types/auth.types';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F7F8F9';
const TEXT_MUTED = '#9CA3AF';
const TEXT_BLACK = '#111111';
const ICON_BG = '#F5F7F6';
const SIGN_OUT_BG = '#FEF2F2';
const SIGN_OUT_BORDER = '#FECACA';
const SIGN_OUT_RED = '#DC2626';
const H_PAD = isSmallDevice ? 16 : 20;
const AVATAR_SIZE = isSmallDevice ? 44 : 50;
const AVATAR_RADIUS = isSmallDevice ? 12 : 14;
const ICON_SIZE = isSmallDevice ? 28 : 30;
const ICON_RADIUS = isSmallDevice ? 10 : 12;
const PROFILE_CARD_RADIUS = isSmallDevice ? 20 : 24;

function PencilIcon({ size = 15, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileCard({
  name,
  email,
  role,
  avatarLetter,
  verified,
  onEditPress,
}: {
  name: string;
  email: string;
  role: string;
  avatarLetter: string;
  verified?: boolean;
  onEditPress: () => void;
}) {
  return (
    <LinearGradient
      colors={['#163D34', '#1F5D4E', '#2B773F', '#4CAF50']}
      locations={[0, 0.35, 0.7, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.profileCard}
    >
      <View style={styles.profileGlow} pointerEvents="none" />

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{role}</Text>
            </View>
            {verified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onEditPress}
          style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
          hitSlop={6}
        >
          <PencilIcon />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function StatsRow() {
  const stats = [
    { value: String(PROFILE_USER.stats.bookings), label: 'Bookings' },
    { value: String(PROFILE_USER.stats.saved), label: 'Saved' },
    { value: String(PROFILE_USER.stats.reviews), label: 'Reviews' },
  ];

  return (
    <View style={styles.statsRow}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.statCard}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

type ProfileFormState = {
  fullName: string;
  email: string;
};

function buildProfileForm(user: AuthUser | null): ProfileFormState {
  return {
    fullName: user?.fullName?.trim() || PROFILE_USER.name,
    email: user?.email?.trim() || PROFILE_USER.email,
  };
}

function EditProfileModal({
  visible,
  user,
  onClose,
  onSave,
}: {
  visible: boolean;
  user: AuthUser | null;
  onClose: () => void;
  onSave: (payload: { fullName: string }) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<ProfileFormState>(() => buildProfileForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setForm(buildProfileForm(user));
      setError(null);
    } else {
      setKeyboardHeight(0);
    }
  }, [visible, user]);

  useEffect(() => {
    if (!visible) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleSave = async () => {
    const fullName = form.fullName.trim();
    if (!fullName) {
      setError('Full name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({ fullName });
      handleClose();
    } catch (saveError) {
      const message =
        (saveError as { message?: string })?.message ||
        'Could not update profile. Please try again.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={handleClose} />
        <View
          style={[
            styles.modalSheet,
            {
              marginBottom: keyboardHeight,
              paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 12) + 8,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.modalForm}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              value={form.fullName}
              onChangeText={(value) => setForm((current) => ({ ...current, fullName: value }))}
              placeholder="Your full name"
              placeholderTextColor={TEXT_MUTED}
              style={styles.fieldInput}
              autoCapitalize="words"
              autoFocus
              editable={!isSaving}
            />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={form.email}
              style={[styles.fieldInput, styles.fieldInputDisabled]}
              editable={false}
            />
            <Text style={styles.fieldHint}>Email cannot be changed here.</Text>

            {error ? <Text style={styles.fieldError}>{error}</Text> : null}
          </View>

          <Pressable
            onPress={() => void handleSave()}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveBtn,
              (pressed || isSaving) && styles.pressed,
              isSaving && styles.saveBtnDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function MenuItem({
  item,
  isLast,
  onPress,
}: {
  item: SettingsMenuItem;
  isLast: boolean;
  onPress?: () => void;
}) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
      >
        <View style={styles.menuIconWrap}>
          <Text style={styles.menuEmoji}>{item.emoji}</Text>
        </View>

        <View style={styles.menuTextWrap}>
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>

        <ChevronRightIcon size={isSmallDevice ? 16 : 18} color="#D1D5DB" />
      </Pressable>
      {!isLast ? <View style={styles.menuDivider} /> : null}
    </View>
  );
}

export function SettingsScreen() {
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

  const handleMenuPress = (item: SettingsMenuItem) => {
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
          <Text style={styles.title}>Profile & Settings</Text>
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
                  <MenuItem
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
            onPress={logout}
            style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}
          >
            <LogOutIcon size={isSmallDevice ? 16 : 18} color={SIGN_OUT_RED} />
            <Text style={styles.signOutText}>Sign Out</Text>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  scroll: {
    flex: 1,
  },
  header: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 10 : 12,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  title: {
    fontSize: isSmallDevice ? 18 : 20,
    lineHeight: isSmallDevice ? 24 : 26,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  body: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 10 : 12,
  },
  profileCard: {
    borderRadius: PROFILE_CARD_RADIUS,
    overflow: 'hidden',
    marginBottom: isSmallDevice ? 10 : 12,
    minHeight: isSmallDevice ? 90 : 100,
    justifyContent: 'center',
  },
  profileGlow: {
    position: 'absolute',
    top: isSmallDevice ? -8 : -10,
    right: isSmallDevice ? 8 : 12,
    width: isSmallDevice ? 72 : 88,
    height: isSmallDevice ? 72 : 88,
    borderRadius: isSmallDevice ? 36 : 44,
    backgroundColor: 'rgba(76, 175, 80, 0.18)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingTop: isSmallDevice ? 12 : 14,
    paddingBottom: isSmallDevice ? 12 : 14,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: isSmallDevice ? 2 : 4,
  },
  profileEmail: {
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 14 : 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 6 : 8,
    flexWrap: 'wrap',
  },
  roleBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: isSmallDevice ? 7 : 9,
    paddingVertical: isSmallDevice ? 2 : 3,
    borderRadius: isSmallDevice ? 6 : 8,
  },
  roleBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: isSmallDevice ? 7 : 9,
    paddingVertical: isSmallDevice ? 2 : 3,
    borderRadius: isSmallDevice ? 6 : 8,
  },
  verifiedBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    lineHeight: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    ...shadowSm,
  },
  statValue: {
    fontSize: isSmallDevice ? 14 : 16,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  section: {
    marginBottom: isSmallDevice ? 12 : 16,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 12 : 14,
    fontWeight: '600',
    color: TEXT_MUTED,
    letterSpacing: 0.7,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  menuCard: {
    backgroundColor: PAGE_BG,
    borderRadius: isSmallDevice ? 14 : 16,
    overflow: 'hidden',
    ...shadowSm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 8 : 10,
  },
  menuIconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuEmoji: {
    fontSize: isSmallDevice ? 12 : 14,
  },
  menuTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  menuLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: TEXT_BLACK,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 15,
    fontWeight: '400',
    color: TEXT_MUTED,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: (isSmallDevice ? 12 : 14) + ICON_SIZE + (isSmallDevice ? 10 : 12),
    marginRight: isSmallDevice ? 12 : 14,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 6 : 8,
    backgroundColor: SIGN_OUT_BG,
    borderWidth: 1,
    borderColor: SIGN_OUT_BORDER,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingVertical: isSmallDevice ? 11 : 13,
    marginTop: 4,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  signOutText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: SIGN_OUT_RED,
  },
  versionText: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 15,
    fontWeight: '400',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalSheet: {
    backgroundColor: PAGE_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingTop: 16,
    paddingHorizontal: H_PAD,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: isSmallDevice ? 17 : 18,
    lineHeight: isSmallDevice ? 22 : 24,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  modalCloseText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: PRIMARY,
  },
  modalForm: {
    paddingBottom: 12,
  },
  fieldLabel: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: TEXT_BLACK,
    marginBottom: 6,
    marginTop: 10,
  },
  fieldInput: {
    backgroundColor: BODY_BG,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: isSmallDevice ? 14 : 15,
    color: TEXT_BLACK,
  },
  fieldInputDisabled: {
    color: TEXT_MUTED,
    backgroundColor: '#F3F4F6',
  },
  fieldHint: {
    fontSize: isSmallDevice ? 10 : 11,
    lineHeight: isSmallDevice ? 13 : 15,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  fieldError: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 16 : 18,
    color: SIGN_OUT_RED,
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.75,
  },
  saveBtnText: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
