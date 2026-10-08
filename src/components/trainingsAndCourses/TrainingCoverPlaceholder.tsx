import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  trainingCoverColors,
  trainingCoverInitials,
} from '@/utils/trainingCover';
import { c } from '@/utils/newUiCompact';

type TrainingCoverPlaceholderProps = {
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/** Initials + soft background when a training/course has no cover image. */
export function TrainingCoverPlaceholder({
  title,
  style,
  textStyle,
}: TrainingCoverPlaceholderProps) {
  const colors = trainingCoverColors(title);
  const initials = trainingCoverInitials(title);

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.backgroundColor },
        style,
      ]}
      pointerEvents="none"
      accessibilityLabel={`${title} cover placeholder`}
    >
      <Text
        style={[styles.initials, { color: colors.color }, textStyle]}
        numberOfLines={1}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Absolute fill only — never height:'100%' / flex:1 (those stretch list cards
  // to the full ScrollView height when a single item is present).
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d7e8db',
  },
  initials: {
    fontSize: c(20, 18),
    lineHeight: c(24, 22),
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
    color: '#257d3f',
    includeFontPadding: false,
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : null),
  },
});
