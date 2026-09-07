import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';

import { isSmallDevice } from '@/utils/responsive';

const BONE = '#E5EBE7';
const BONE_SOFT = '#F0F4F1';

type SkeletonBlockProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/** Soft pulsing bone used to build layout-shaped loaders (§6 loading pattern). */
export function SkeletonBlock({
  width = '100%',
  height = 14,
  radius = 8,
  style,
}: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: BONE,
          opacity,
        },
        style,
      ]}
    />
  );
}

type SkeletonListProps = {
  count?: number;
  children: (index: number) => ReactNode;
  gap?: number;
  style?: ViewStyle;
};

export function SkeletonList({ count = 4, children, gap = 12, style }: SkeletonListProps) {
  return (
    <View
      style={style}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
    >
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={index < count - 1 ? { marginBottom: gap } : undefined}>
          {children(index)}
        </View>
      ))}
    </View>
  );
}

export function HomeEnterpriseSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <SkeletonList count={count} gap={isSmallDevice ? 10 : 12}>
      {() => (
        <View style={styles.enterpriseCard}>
          <SkeletonBlock
            width={isSmallDevice ? 48 : 54}
            height={isSmallDevice ? 48 : 54}
            radius={isSmallDevice ? 12 : 14}
          />
          <View style={styles.enterpriseMain}>
            <SkeletonBlock width="72%" height={14} />
            <SkeletonBlock width="48%" height={12} style={{ marginTop: 8 }} />
            <SkeletonBlock width="56%" height={11} style={{ marginTop: 8 }} />
          </View>
        </View>
      )}
    </SkeletonList>
  );
}

export function ChatInboxSkeletonList({ count = 8 }: { count?: number }) {
  return (
    <SkeletonList count={count} gap={0} style={styles.inboxList}>
      {() => (
        <View style={styles.inboxRow}>
          <SkeletonBlock width={52} height={52} radius={26} />
          <View style={styles.inboxBody}>
            <View style={styles.inboxTop}>
              <SkeletonBlock width="55%" height={14} />
              <SkeletonBlock width={40} height={12} />
            </View>
            <SkeletonBlock width="78%" height={12} style={{ marginTop: 10 }} />
          </View>
        </View>
      )}
    </SkeletonList>
  );
}

export function ServiceCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <SkeletonList count={count} gap={12} style={styles.paddedList}>
      {() => (
        <View style={styles.serviceCard}>
          <SkeletonBlock
            width={isSmallDevice ? 72 : 80}
            height={isSmallDevice ? 72 : 80}
            radius={14}
          />
          <View style={styles.serviceMain}>
            <SkeletonBlock width="70%" height={14} />
            <SkeletonBlock width="45%" height={12} style={{ marginTop: 8 }} />
            <SkeletonBlock width="88%" height={11} style={{ marginTop: 10 }} />
            <SkeletonBlock width="34%" height={12} style={{ marginTop: 12 }} />
          </View>
        </View>
      )}
    </SkeletonList>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  const rows = Math.ceil(count / 2);

  return (
    <View
      style={styles.productGrid}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
    >
      {Array.from({ length: rows }, (_, rowIndex) => (
        <View key={rowIndex} style={styles.productRow}>
          <ProductSkeletonCard />
          <ProductSkeletonCard />
        </View>
      ))}
    </View>
  );
}

function ProductSkeletonCard() {
  return (
    <View style={styles.productCard}>
      <SkeletonBlock width="100%" height={isSmallDevice ? 110 : 128} radius={0} />
      <View style={styles.productBody}>
        <SkeletonBlock width="40%" height={11} />
        <SkeletonBlock width="78%" height={13} style={{ marginTop: 8 }} />
        <SkeletonBlock width="50%" height={11} style={{ marginTop: 8 }} />
        <SkeletonBlock width="36%" height={14} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

export function ChatMessageSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <SkeletonList count={count} gap={10} style={styles.chatMessageList}>
      {(index) => {
        const isUser = index % 3 === 0;
        return (
          <View style={[styles.chatBubbleRow, isUser && styles.chatBubbleRowUser]}>
            <SkeletonBlock
              width={isUser ? '62%' : '74%'}
              height={isUser ? 44 : 56}
              radius={16}
              style={{ backgroundColor: BONE_SOFT }}
            />
          </View>
        );
      }}
    </SkeletonList>
  );
}

const styles = StyleSheet.create({
  enterpriseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallDevice ? 14 : 18,
    padding: isSmallDevice ? 10 : 14,
    gap: isSmallDevice ? 10 : 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  enterpriseMain: {
    flex: 1,
  },
  inboxList: {
    paddingTop: 4,
  },
  inboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  inboxBody: {
    flex: 1,
  },
  inboxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paddedList: {
    paddingTop: 4,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6EBE7',
    padding: isSmallDevice ? 12 : 14,
    gap: 12,
  },
  serviceMain: {
    flex: 1,
    paddingTop: 2,
  },
  productGrid: {
    paddingTop: 4,
  },
  productRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6EBE7',
    overflow: 'hidden',
  },
  productBody: {
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingTop: isSmallDevice ? 8 : 10,
    paddingBottom: isSmallDevice ? 10 : 12,
  },
  chatMessageList: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  chatBubbleRow: {
    alignItems: 'flex-start',
  },
  chatBubbleRowUser: {
    alignItems: 'flex-end',
  },
});

export const skeletonColors = {
  bone: BONE,
  boneSoft: BONE_SOFT,
};
