import { Pressable, Text, View } from 'react-native';

import { PREVIEW_LIMIT, styles } from '@/screens/search/SearchDataScreen.styles';

export function SearchSectionHeading({
  title,
  count,
  onViewAll,
}: {
  title: string;
  count: number;
  onViewAll?: () => void;
}) {
  const showViewAll = count > PREVIEW_LIMIT && onViewAll;

  return (
    <View style={styles.sectionHeadingRow}>
      <Text style={styles.sectionHeading} numberOfLines={1}>
        {title}{' '}
        <Text style={styles.sectionCount}>{count}</Text>
      </Text>
      {showViewAll ? (
        <Pressable
          onPress={onViewAll}
          hitSlop={8}
          style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
