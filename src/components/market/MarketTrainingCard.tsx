import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  TRAINING_BORDER,
  TRAINING_MUTED,
  TRAINING_TEAL,
  type TrainingListItem,
} from '@/components/market/marketTrainingData';
import { c, NU } from '@/utils/newUiCompact';

type Props = {
  item: TrainingListItem;
};

export function MarketTrainingCard({ item }: Props) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.eventCard}
      onPress={() =>
        router.push({
          pathname: '/(main)/market/training-detail',
          params: { id: item.id },
        })
      }
      accessibilityRole="button"
    >
      <View style={[styles.eventSide, !item.imageUrl && { backgroundColor: item.sideBg }]}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.sideImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <>
            <Text style={[styles.eventSideTop, { color: item.sideTopColor }]}>
              {item.sideTop}
            </Text>
            <Text
              style={[styles.eventSideBottom, { color: item.sideBottomColor }]}
            >
              {item.sideBottom}
            </Text>
          </>
        )}
      </View>
      <View style={styles.eventCopy}>
        <View style={styles.eventBadgeRow}>
          <Text
            style={[
              styles.eventBadge,
              { color: item.badgeColor, backgroundColor: item.badgeBg },
            ]}
          >
            {item.badge}
          </Text>
          <Text style={styles.eventWhen}>{item.when}</Text>
        </View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDetail}>{item.detail}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  eventSide: {
    width: c(88, 76),
    minHeight: c(96, 88),
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(2, 1),
    overflow: 'hidden',
    backgroundColor: '#d7e8db',
  },
  sideImage: {
    ...StyleSheet.absoluteFill,
  },
  eventSideTop: {
    fontSize: c(11, 10),
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  eventSideBottom: {
    fontSize: c(18, 16),
    fontWeight: '800',
  },
  eventCopy: {
    flex: 1,
    paddingVertical: c(12, 10),
    paddingHorizontal: c(12, 10),
    gap: c(4, 3),
    justifyContent: 'center',
  },
  eventBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    flexWrap: 'wrap',
  },
  eventBadge: {
    fontSize: c(10, 9),
    fontWeight: '800',
    paddingHorizontal: c(8, 7),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    overflow: 'hidden',
  },
  eventWhen: {
    fontSize: c(12, 11),
    color: TRAINING_MUTED,
  },
  eventTitle: {
    fontSize: NU.link,
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  eventDetail: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
});
