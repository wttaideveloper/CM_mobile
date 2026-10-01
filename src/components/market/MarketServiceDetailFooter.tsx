import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListingListIcon } from '@/components/market/MarketListingIcons';
import { MarketChatIcon } from '@/components/market/MarketIcons';
import {
  SERVICE_DETAIL_BORDER,
  SERVICE_DETAIL_GREEN,
  SERVICE_DETAIL_MUTED,
  SERVICE_DETAIL_TEAL,
  type MarketServiceDetail,
} from '@/components/market/marketServiceDetailData';
import { useOpenServiceChat } from '@/hooks/useOpenServiceChat';
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
  const { openServiceChat, isOpeningChat } = useOpenServiceChat();
  const canBook = !requiresSlot || Boolean(selectedTimeSlot);
  const providerUserId = service.providerUserId?.trim() || null;
  const canChat = Boolean(providerUserId);
  const bookLabel =
    selectedTimeSlot != null
      ? `Book ${formatTimeSlotDisplay(selectedTimeSlot)} · ${service.price}`
      : requiresSlot
        ? 'Select a time slot'
        : service.bookLabel;

  const openChat = () => {
    if (!providerUserId) {
      Alert.alert('Chat unavailable', 'This service has no provider to chat with.');
      return;
    }
    void openServiceChat({
      id: service.id,
      name: service.title,
      provider: service.provider ?? service.vendorName,
      providerUserId,
      enterpriseName: service.vendorName,
    });
  };

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
        style={[styles.chatBtn, (isOpeningChat || !canChat) && styles.chatBtnDisabled]}
        onPress={openChat}
        disabled={isOpeningChat || !canChat}
        accessibilityRole="button"
        accessibilityLabel="Chat"
        accessibilityState={{ disabled: isOpeningChat || !canChat }}
      >
        {isOpeningChat ? (
          <ActivityIndicator size="small" color={SERVICE_DETAIL_GREEN} />
        ) : (
          <>
            <MarketChatIcon
              color={canChat ? SERVICE_DETAIL_GREEN : SERVICE_DETAIL_MUTED}
              size={16}
            />
            <Text
              style={[
                styles.chatText,
                { color: canChat ? SERVICE_DETAIL_GREEN : SERVICE_DETAIL_MUTED },
              ]}
            >
              Chat
            </Text>
          </>
        )}
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
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(6, 5),
    height: c(46, 42),
    paddingHorizontal: c(14, 12),
    borderRadius: NU.cardRadiusMd,
    borderWidth: 1,
    borderColor: '#c8e0cc',
    backgroundColor: '#e6f4e8',
  },
  chatBtnDisabled: {
    opacity: 0.45,
  },
  chatText: {
    fontSize: NU.link,
    fontWeight: '700',
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
