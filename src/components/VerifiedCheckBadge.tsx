import { StyleSheet, View } from 'react-native';

import { CircleCheckIcon } from '@/components/dashboard/DashboardIcons';

const BADGE_GREEN = '#4CAF50';

type VerifiedCheckBadgeProps = {
  size?: number;
};

export function VerifiedCheckBadge({ size = 16 }: VerifiedCheckBadgeProps) {
  const iconSize = Math.max(10, Math.round(size * 0.7));

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
      <CircleCheckIcon size={iconSize} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: BADGE_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
