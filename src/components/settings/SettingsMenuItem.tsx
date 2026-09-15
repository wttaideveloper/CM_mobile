import { Pressable, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/dashboard/DashboardIcons';
import type { SettingsMenuItem as SettingsMenuItemType } from '@/constants/settings';
import { styles } from '@/screens/settings/SettingsScreen.styles';
import { isSmallDevice } from '@/utils/responsive';

type SettingsMenuItemProps = {
  item: SettingsMenuItemType;
  isLast: boolean;
  active?: boolean;
  onPress?: () => void;
};

export function SettingsMenuItem({
  item,
  isLast,
  active = true,
  onPress,
}: SettingsMenuItemProps) {
  return (
    <View>
      <Pressable
        onPress={active ? onPress : undefined}
        disabled={!active}
        style={({ pressed }) => [
          styles.menuItem,
          !active && styles.menuItemDisabled,
          pressed && active && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${item.label}. ${item.subtitle}`}
        accessibilityState={{ disabled: !active }}
        accessibilityHint={active ? undefined : 'Not available yet'}
      >
        <View style={styles.menuIconWrap}>
          <Text style={styles.menuEmoji}>{item.emoji}</Text>
        </View>

        <View style={styles.menuTextWrap}>
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>

        {active ? (
          <ChevronRightIcon size={isSmallDevice ? 16 : 18} color="#D1D5DB" />
        ) : null}
      </Pressable>
      {!isLast ? <View style={styles.menuDivider} /> : null}
    </View>
  );
}
