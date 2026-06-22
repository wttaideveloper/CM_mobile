import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '../constants/authTheme';

type AuthBadgeProps = {
  label: string;
  align?: 'left' | 'center';
  dense?: boolean;
};

export function AuthBadge({ label, align = 'left', dense = false }: AuthBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        dense && styles.badgeDense,
        align === 'center' ? styles.badgeCenter : styles.badgeLeft,
      ]}
    >
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#C1FECE',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: authTheme.badge.borderRadius,
  },
  badgeDense: {
    marginBottom: 12,
  },
  badgeLeft: {
    alignSelf: 'flex-start',
  },
  badgeCenter: {
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#538B58',
    letterSpacing: authTheme.badgeText.letterSpacing,
  },
});
