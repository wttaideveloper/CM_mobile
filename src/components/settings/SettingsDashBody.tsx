import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  SettingsDashChevronIcon,
  SettingsDashIcon,
} from '@/components/settings/SettingsDashIcons';
import {
  SETTINGS_BODY,
  SETTINGS_BORDER,
  SETTINGS_DANGER,
  SETTINGS_DANGER_BG,
  SETTINGS_GREEN,
  SETTINGS_GROUPS,
  SETTINGS_ICON,
  SETTINGS_ICON_BG,
  SETTINGS_INK,
  SETTINGS_PROFILE,
  SETTINGS_PROFILE_BORDER,
  SETTINGS_ROW_BORDER,
  SETTINGS_TEAL,
  SETTINGS_TOGGLE_OFF,
  SETTINGS_TOGGLE_ON,
  SETTINGS_TRACK,
  type SettingsRow,
} from '@/components/settings/settingsDashData';
import { useAuthStore } from '@/stores/auth.store';
import { c, NU } from '@/utils/newUiCompact';

type ToggleState = {
  push: boolean;
  digest: boolean;
  provider: boolean;
  reminders: boolean;
};

type SettingsDashBodyProps = {
  toggles: ToggleState;
  onToggle: (key: keyof ToggleState) => void;
};

export function SettingsDashBody({ toggles, onToggle }: SettingsDashBodyProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const displayName = user?.fullName || SETTINGS_PROFILE.name;
  const displayEmail = user?.email || SETTINGS_PROFILE.email;
  const initials = (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || SETTINGS_PROFILE.initials
  );

  const handleRowPress = (row: SettingsRow) => {
    if (row.kind === 'toggle') return;
    if (row.href) {
      router.push(row.href as never);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account',
      'This is a preview action. Account deletion is not wired yet.',
      [{ text: 'OK' }],
    );
  };

  return (
    <View style={styles.body}>
      <View style={styles.profileBlock}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>
        </View>

        <View style={styles.hwiCard}>
          <Text style={styles.hwiLabel}>HWI™ Score</Text>
          <View style={styles.hwiTrack}>
            <View
              style={[
                styles.hwiFill,
                { width: `${SETTINGS_PROFILE.hwiScore}%` },
              ]}
            />
          </View>
          <View style={styles.hwiScoreRow}>
            <Text style={styles.hwiScore}>{SETTINGS_PROFILE.hwiScore}</Text>
            <Text style={styles.hwiMax}>/ 100</Text>
          </View>
        </View>
      </View>

      {SETTINGS_GROUPS.map((group) => (
        <View key={group.id} style={styles.group}>
          <Text style={styles.groupLabel}>{group.label}</Text>
          <View style={styles.menuCard}>
            {group.rows.map((row, index) => {
              const isLast = index === group.rows.length - 1;
              const rowStyle = [styles.row, !isLast && styles.rowBorder];
              const content = (
                <>
                  <View style={styles.iconWrap}>
                    <SettingsDashIcon kind={row.icon} color={SETTINGS_ICON} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{row.title}</Text>
                    <Text style={styles.rowSub}>{row.subtitle}</Text>
                  </View>
                  {row.kind === 'toggle' ? (
                    <Switch
                      value={toggles[row.toggleKey]}
                      onValueChange={() => onToggle(row.toggleKey)}
                      trackColor={{
                        false: SETTINGS_TOGGLE_OFF,
                        true: SETTINGS_TOGGLE_ON,
                      }}
                      thumbColor="#FFFFFF"
                    />
                  ) : row.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{row.badge}</Text>
                    </View>
                  ) : (
                    <SettingsDashChevronIcon />
                  )}
                </>
              );

              if (row.kind === 'toggle') {
                return (
                  <View key={row.id} style={rowStyle}>
                    {content}
                  </View>
                );
              }

              return (
                <Pressable
                  key={row.id}
                  style={rowStyle}
                  onPress={() => handleRowPress(row)}
                  accessibilityRole="button"
                  accessibilityLabel={row.title}
                >
                  {content}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.menuCard}>
        <Pressable
          style={[styles.row, styles.rowBorder]}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <View style={[styles.iconWrap, styles.dangerIcon]}>
            <SettingsDashIcon kind="logout" color={SETTINGS_DANGER} />
          </View>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
        <Pressable
          style={styles.row}
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
        >
          <View style={[styles.iconWrap, styles.dangerIcon]}>
            <SettingsDashIcon kind="trash" color={SETTINGS_DANGER} />
          </View>
          <Text style={styles.deleteText}>Delete Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(22, 18),
  },
  profileBlock: {
    gap: NU.groupGap,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SETTINGS_PROFILE_BORDER,
    borderRadius: NU.cardRadiusSm,
    padding: c(18, 14),
    alignItems: 'center',
    gap: NU.cardGap,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0f2e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: c(30, 26),
    fontWeight: '800',
    color: SETTINGS_GREEN,
  },
  profileCopy: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: NU.cardTitleXl,
    fontWeight: '600',
    color: SETTINGS_TEAL,
  },
  profileEmail: {
    marginTop: c(4, 3),
    fontSize: NU.link,
    color: SETTINGS_BODY,
  },
  hwiCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SETTINGS_PROFILE_BORDER,
    borderRadius: NU.cardRadiusSm,
    padding: NU.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.cardGap,
  },
  hwiLabel: {
    fontSize: NU.label,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: SETTINGS_TEAL,
  },
  hwiTrack: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    backgroundColor: SETTINGS_TRACK,
    overflow: 'hidden',
  },
  hwiFill: {
    height: 6,
    borderRadius: 99,
    backgroundColor: SETTINGS_GREEN,
  },
  hwiScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: c(4, 3),
  },
  hwiScore: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: '#07473e',
  },
  hwiMax: {
    fontSize: NU.label,
    color: SETTINGS_TEAL,
  },
  group: {
    gap: c(8, 6),
  },
  groupLabel: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: SETTINGS_TEAL,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: SETTINGS_BORDER,
    borderRadius: c(8, 7),
    overflow: 'hidden',
  },
  row: {
    paddingVertical: NU.groupGap,
    paddingHorizontal: NU.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.rowGap,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: SETTINGS_ROW_BORDER,
  },
  iconWrap: {
    width: c(36, 32),
    height: c(36, 32),
    borderRadius: c(10, 8),
    backgroundColor: SETTINGS_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: {
    backgroundColor: SETTINGS_DANGER_BG,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: NU.link,
    fontWeight: '500',
    color: SETTINGS_INK,
  },
  rowSub: {
    marginTop: c(2, 2),
    fontSize: NU.bodySm,
    color: SETTINGS_BODY,
  },
  badge: {
    paddingVertical: c(2, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: NU.iconBtnRadius,
    backgroundColor: '#d4edda',
  },
  badgeText: {
    fontSize: NU.label,
    fontWeight: '600',
    color: '#07473e',
  },
  signOutText: {
    flex: 1,
    fontSize: NU.link,
    fontWeight: '500',
    color: SETTINGS_INK,
  },
  deleteText: {
    flex: 1,
    fontSize: NU.link,
    fontWeight: '500',
    color: SETTINGS_DANGER,
  },
});
