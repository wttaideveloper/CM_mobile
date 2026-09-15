import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingListIcon } from '@/components/market/MarketListingIcons';
import {
  SERVICE_DETAIL_BORDER,
  SERVICE_DETAIL_MUTED,
  SERVICE_DETAIL_TEAL,
  type MarketServiceDetail,
} from '@/components/market/marketServiceDetailData';
import { formatTimeSlotDisplay } from '@/screens/shop/services/ServiceDetailScreenParts.types';
import { c, NU } from '@/utils/newUiCompact';

type MarketServiceDetailFooterProps = {
  service: MarketServiceDetail;
  selectedTimeSlot?: string | null;
  requiresSlot?: boolean;
  onBook?: () => void;
};

export function MarketServiceDetailFooter({
  service,
  selectedTimeSlot = null,
  requiresSlot = false,
  onBook,
}: MarketServiceDetailFooterProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const canBook = !requiresSlot || Boolean(selectedTimeSlot);
  const bookLabel =
    selectedTimeSlot != null
      ? `Book ${formatTimeSlotDisplay(selectedTimeSlot)} · ${service.price}`
      : requiresSlot
        ? 'Select a time slot'
        : service.bookLabel;

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, c(22, 18)) }]}>
      <Pressable
        style={styles.listBtn}
        onPress={() => router.push('/(main)/market/cart')}
        accessibilityRole="button"
        accessibilityLabel="View cart"
      >
        <ListingListIcon />
      </Pressable>
      <Pressable
        style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]}
        disabled={!canBook}
        onPress={onBook ?? (() => router.push('/(main)/market/checkout'))}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canBook }}
      >
        <Text style={[styles.bookText, !canBook && styles.bookTextDisabled]}>
          {bookLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: NU.hPad,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: SERVICE_DETAIL_BORDER,
    flexDirection: 'row',
    gap: c(11, 9),
    alignItems: 'center',
  },
  listBtn: {
    width: c(46, 42),
    height: c(46, 42),
    borderRadius: NU.cardRadiusMd,
    borderWidth: 1,
    borderColor: '#c8e0cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtn: {
    flex: 1,
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: SERVICE_DETAIL_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnDisabled: {
    backgroundColor: '#eef4ee',
  },
  bookText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookTextDisabled: {
    color: SERVICE_DETAIL_MUTED,
  },
});
