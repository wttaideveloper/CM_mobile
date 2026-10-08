import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  type TrainingListItem,
} from '@/components/trainingsAndCourses/trainingData';
import { TrainingCoverImage } from '@/components/trainingsAndCourses/TrainingCoverImage';
import { useMyTrainingEnrolments } from '@/hooks/useTrainings';
import { hasTrainingCoverImage } from '@/utils/trainingCover';
import { c, NU } from '@/utils/newUiCompact';

type Props = {
  item: TrainingListItem;
};

export function TrainingCard({ item }: Props) {
  const router = useRouter();
  const enrolments = useMyTrainingEnrolments();
  const showCover = hasTrainingCoverImage(item.imageUrl);
  const isEnrolled =
    item.isEnrolled === true || enrolments.isEnrolled(item.id);

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
      <View
        style={[
          styles.eventSide,
          !showCover && { backgroundColor: item.sideBg || '#d7e8db' },
        ]}
      >
        {showCover ? (
          <TrainingCoverImage
            uri={item.imageUrl}
            title={item.title}
            style={styles.sideImage}
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
          <View style={styles.eventBadgeLeft}>
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
          {isEnrolled ? (
            <Text style={styles.enrolledBadge}>Enrolled</Text>
          ) : null}
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.eventDetail} numberOfLines={2}>
          {item.detail}
        </Text>
        {item.averageRating != null && item.averageRating > 0 ? (
          <Text style={styles.eventRating}>
            ★ {item.averageRating.toFixed(1)}
            {item.reviewCount != null && item.reviewCount > 0
              ? ` · ${item.reviewCount} review${item.reviewCount === 1 ? '' : 's'}`
              : ''}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Match previous working card layout (content-sized, no ScrollView stretch).
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
    // Fixed height — stretch + absoluteFill Image was leaving a blank
    // (or exploding) box on Android ScrollView. Card text stays beside this.
    height: c(104, 96),
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EEF1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideImage: {
    width: c(88, 76),
    height: c(104, 96),
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
    minWidth: 0,
    paddingVertical: c(12, 10),
    paddingHorizontal: c(12, 10),
    gap: c(4, 3),
    justifyContent: 'center',
  },
  eventBadgeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: c(8, 6),
  },
  eventBadgeLeft: {
    flex: 1,
    minWidth: 0,
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
  enrolledBadge: {
    flexShrink: 0,
    fontSize: c(10, 9),
    fontWeight: '800',
    paddingHorizontal: c(8, 7),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    overflow: 'hidden',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
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
  eventRating: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_TEAL,
    marginTop: c(2, 1),
  },
});
