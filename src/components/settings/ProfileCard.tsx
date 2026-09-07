import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

import { PROFILE_USER } from '@/constants/settings';
import { styles } from '@/screens/settings/SettingsScreen.styles';

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

type ProfileCardProps = {
  name: string;
  email: string;
  role: string;
  avatarLetter: string;
  verified?: boolean;
  onEditPress: () => void;
};

export function ProfileCard({
  name,
  email,
  role,
  avatarLetter,
  verified,
  onEditPress,
}: ProfileCardProps) {
  const { t } = useTranslation();

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
          accessibilityRole="button"
          accessibilityLabel={t('settings.editProfileA11y')}
        >
          <PencilIcon />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

export function StatsRow() {
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
