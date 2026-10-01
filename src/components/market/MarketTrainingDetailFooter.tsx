import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketHeartIcon } from '@/components/market/MarketIcons';
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import { c, NU } from '@/utils/newUiCompact';

export type TrainingDetailFooterCta = 'enroll' | 'continue' | 'pending';

type Props = {
  wishlisted?: boolean;
  cta?: TrainingDetailFooterCta;
  busy?: boolean;
  onToggleWishlist?: () => void;
  onEnroll?: () => void;
  onContinue?: () => void;
};

export function MarketTrainingDetailFooter({
  wishlisted,
  cta = 'enroll',
  busy,
  onToggleWishlist,
  onEnroll,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();
  const showWishlist = cta === 'enroll';

  return (
    <View
      style={[
        styles.footer,
        { paddingBottom: Math.max(insets.bottom, c(22, 18)) },
      ]}
    >
      {showWishlist ? (
        <Pressable
          style={[
            styles.wishBtn,
            wishlisted && styles.wishBtnActive,
            busy && styles.wishBtnBusy,
          ]}
          onPress={onToggleWishlist}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={
            wishlisted ? 'In wishlist — view wishlist' : 'Add to wishlist'
          }
          accessibilityState={{ selected: Boolean(wishlisted), busy }}
        >
          <View
            style={[styles.wishIconWrap, wishlisted && styles.wishIconWrapActive]}
          >
            <MarketHeartIcon
              color={wishlisted ? '#FFFFFF' : TRAINING_TEAL}
              size={18}
              filled={Boolean(wishlisted)}
            />
          </View>
          <View style={styles.wishCopy}>
            <Text
              style={[styles.wishLabel, wishlisted && styles.wishLabelActive]}
              numberOfLines={1}
            >
              {wishlisted ? 'In wishlist' : 'Wishlist'}
            </Text>
            <Text style={styles.wishHint} numberOfLines={1}>
              {wishlisted ? 'View saved' : 'Save for later'}
            </Text>
          </View>
        </Pressable>
      ) : null}

      {cta === 'continue' ? (
        <Pressable
          style={styles.continueBtn}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel="Already enrolled — go to learning"
        >
          <Text style={styles.continueEyebrow}>Already enrolled</Text>
          <Text style={styles.continueText}>Go to learning</Text>
        </Pressable>
      ) : cta === 'pending' ? (
        <View
          style={styles.pendingBtn}
          accessibilityRole="text"
          accessibilityLabel="Waiting for admin approval"
        >
          <Text style={styles.pendingEyebrow}>Enrolment submitted</Text>
          <Text style={styles.pendingText}>Waiting for approval</Text>
        </View>
      ) : (
        <Pressable
          style={styles.enrollBtn}
          onPress={onEnroll}
          accessibilityRole="button"
        >
          <Text style={styles.enrollText}>Enroll now</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: NU.hPad,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: TRAINING_BORDER,
    flexDirection: 'row',
    gap: c(11, 9),
    alignItems: 'center',
  },
  wishBtn: {
    minWidth: c(132, 120),
    height: c(52, 48),
    paddingHorizontal: c(10, 8),
    borderRadius: c(16, 14),
    borderWidth: 1,
    borderColor: '#d5e6da',
    backgroundColor: '#f7fbf8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  wishBtnActive: {
    backgroundColor: '#eef8f1',
    borderColor: '#b7dfc2',
  },
  wishBtnBusy: {
    opacity: 0.65,
  },
  wishIconWrap: {
    width: c(34, 30),
    height: c(34, 30),
    borderRadius: 99,
    backgroundColor: '#e5f0ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishIconWrapActive: {
    backgroundColor: TRAINING_GREEN,
  },
  wishCopy: {
    flexShrink: 1,
    gap: 1,
  },
  wishLabel: {
    fontSize: c(13, 12),
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  wishLabelActive: {
    color: TRAINING_GREEN,
  },
  wishHint: {
    fontSize: c(10.5, 10),
    fontWeight: '600',
    color: TRAINING_MUTED,
  },
  enrollBtn: {
    flex: 1,
    height: c(52, 48),
    borderRadius: c(16, 14),
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  continueBtn: {
    flex: 1,
    height: c(56, 52),
    borderRadius: c(16, 14),
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  continueEyebrow: {
    fontSize: c(10.5, 10),
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.78)',
  },
  continueText: {
    fontSize: c(16, 15),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pendingBtn: {
    flex: 1,
    height: c(56, 52),
    borderRadius: c(16, 14),
    backgroundColor: '#eef3f0',
    borderWidth: 1,
    borderColor: '#d5e6da',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  pendingEyebrow: {
    fontSize: c(10.5, 10),
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  pendingText: {
    fontSize: c(14, 13),
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
});
