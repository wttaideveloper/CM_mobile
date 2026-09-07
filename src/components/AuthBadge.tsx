import { StyleSheet, Text, View } from 'react-native';

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
    backgroundColor: '#B7FECC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 8,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#07473E',
    letterSpacing: 0,
  },
});
