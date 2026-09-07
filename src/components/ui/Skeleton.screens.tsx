import { View, StyleSheet } from 'react-native';

import { SkeletonBlock, SkeletonList } from '@/components/ui/Skeleton';
import { isSmallDevice } from '@/utils/responsive';

/** Notifications list — icon + title/body/time rows. */
export function NotificationSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <SkeletonList count={count} gap={isSmallDevice ? 8 : 10} style={styles.padded}>
      {() => (
        <View style={styles.notificationCard}>
          <SkeletonBlock width={44} height={44} radius={14} />
          <View style={styles.notificationMain}>
            <SkeletonBlock width="62%" height={14} />
            <SkeletonBlock width="88%" height={12} style={{ marginTop: 8 }} />
            <SkeletonBlock width="28%" height={11} style={{ marginTop: 10 }} />
          </View>
        </View>
      )}
    </SkeletonList>
  );
}

/** Settings-style preference rows. */
export function PreferenceSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <SkeletonList count={count} gap={0} style={styles.prefCard}>
      {(index) => (
        <View
          style={[
            styles.prefRow,
            index < count - 1 ? styles.prefRowBorder : null,
          ]}
        >
          <View style={styles.prefMain}>
            <SkeletonBlock width="48%" height={14} />
            <SkeletonBlock width="72%" height={11} style={{ marginTop: 8 }} />
          </View>
          <SkeletonBlock width={48} height={28} radius={14} />
        </View>
      )}
    </SkeletonList>
  );
}

/** Search results loading — mixed section previews. */
export function SearchResultsSkeleton() {
  return (
    <View
      style={styles.padded}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
    >
      <SkeletonBlock width="40%" height={14} style={{ marginBottom: 12 }} />
      <SkeletonList count={2} gap={10}>
        {() => (
          <View style={styles.searchRow}>
            <SkeletonBlock width={48} height={48} radius={12} />
            <View style={styles.searchMain}>
              <SkeletonBlock width="70%" height={13} />
              <SkeletonBlock width="50%" height={11} style={{ marginTop: 8 }} />
            </View>
          </View>
        )}
      </SkeletonList>

      <SkeletonBlock width="36%" height={14} style={{ marginTop: 22, marginBottom: 12 }} />
      <SkeletonList count={2} gap={12}>
        {() => (
          <View style={styles.searchService}>
            <SkeletonBlock width={72} height={72} radius={14} />
            <View style={styles.searchMain}>
              <SkeletonBlock width="65%" height={13} />
              <SkeletonBlock width="40%" height={11} style={{ marginTop: 8 }} />
              <SkeletonBlock width="30%" height={12} style={{ marginTop: 10 }} />
            </View>
          </View>
        )}
      </SkeletonList>
    </View>
  );
}

/** Explore enterprise detail initial load (hero + profile bones). */
export function ExploreScreenSkeleton() {
  return (
    <View
      style={styles.exploreRoot}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
    >
      <SkeletonBlock width="100%" height={isSmallDevice ? 200 : 220} radius={0} />
      <View style={styles.exploreBody}>
        <View style={styles.exploreProfile}>
          <SkeletonBlock width={72} height={72} radius={20} />
          <View style={styles.exploreProfileMain}>
            <SkeletonBlock width="70%" height={18} />
            <SkeletonBlock width="45%" height={12} style={{ marginTop: 10 }} />
            <SkeletonBlock width="55%" height={12} style={{ marginTop: 8 }} />
          </View>
        </View>
        <View style={styles.exploreStats}>
          <SkeletonBlock width="23%" height={58} radius={14} />
          <SkeletonBlock width="23%" height={58} radius={14} />
          <SkeletonBlock width="23%" height={58} radius={14} />
          <SkeletonBlock width="23%" height={58} radius={14} />
        </View>
        <SkeletonBlock width="100%" height={44} radius={14} style={{ marginTop: 16 }} />
        <SkeletonBlock width="100%" height={40} radius={14} style={{ marginTop: 16 }} />
        <SkeletonBlock width="90%" height={12} style={{ marginTop: 18 }} />
        <SkeletonBlock width="80%" height={12} style={{ marginTop: 10 }} />
        <SkeletonBlock width="70%" height={12} style={{ marginTop: 10 }} />
      </View>
    </View>
  );
}

/** Horizontal product strip (Explore products tab). */
export function HorizontalProductSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View
      style={styles.horizontalRow}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
    >
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.horizontalCard}>
          <SkeletonBlock
            width={isSmallDevice ? 108 : 116}
            height={isSmallDevice ? 108 : 116}
            radius={16}
          />
          <SkeletonBlock width="80%" height={12} style={{ marginTop: 10 }} />
          <SkeletonBlock width="50%" height={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDEA',
    padding: 14,
    gap: 12,
  },
  notificationMain: {
    flex: 1,
  },
  prefCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDEA',
    overflow: 'hidden',
    marginHorizontal: isSmallDevice ? 16 : 20,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  prefRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDEA',
  },
  prefMain: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchService: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  searchMain: {
    flex: 1,
  },
  exploreRoot: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  exploreBody: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: 8,
  },
  exploreProfile: {
    flexDirection: 'row',
    gap: 14,
    marginTop: -24,
    marginBottom: 16,
  },
  exploreProfileMain: {
    flex: 1,
    paddingTop: 28,
  },
  exploreStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  horizontalRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 4,
  },
  horizontalCard: {
    width: isSmallDevice ? 108 : 116,
  },
});
