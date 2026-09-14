import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MarketHeartIcon } from '@/components/market/MarketIcons';
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/market/marketTrainingData';
import { c, NU } from '@/utils/newUiCompact';

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onGoToWishlist: () => void;
};

export function MarketTrainingWishlistPopup({
  visible,
  title = 'Saved to wishlist',
  subtitle = 'You can find this training anytime under My Wishlist.',
  onClose,
  onGoToWishlist,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button">
        <Pressable
          style={styles.card}
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal
        >
          <View style={styles.iconWrap}>
            <MarketHeartIcon color={TRAINING_GREEN} size={26} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={onGoToWishlist}
            accessibilityRole="button"
          >
            <Text style={styles.primaryText}>Go to wishlist</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryText}>Keep browsing</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(12, 28, 22, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: c(28, 24),
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: c(22, 20),
    paddingHorizontal: c(22, 18),
    paddingTop: c(26, 22),
    paddingBottom: c(18, 16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    shadowColor: '#0c1c16',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  iconWrap: {
    width: c(56, 50),
    height: c(56, 50),
    borderRadius: 99,
    backgroundColor: '#e8f6ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: c(14, 12),
  },
  title: {
    fontSize: c(18, 16),
    fontWeight: '800',
    color: TRAINING_TEAL,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: c(8, 6),
    marginBottom: c(18, 16),
    fontSize: c(13.5, 12.5),
    lineHeight: c(20, 18),
    color: TRAINING_MUTED,
    textAlign: 'center',
  },
  primaryBtn: {
    alignSelf: 'stretch',
    height: c(48, 44),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    alignSelf: 'stretch',
    height: c(44, 40),
    marginTop: c(8, 6),
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: TRAINING_MUTED,
  },
});
