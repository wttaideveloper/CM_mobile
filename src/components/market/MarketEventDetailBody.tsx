import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BizProfilePinIcon } from '@/components/market/MarketBusinessProfileIcons';
import {
  EventDetailCalendarIcon,
  EventDetailCalSmallIcon,
  EventDetailPersonIcon,
} from '@/components/market/MarketEventDetailIcons';
import { MarketEventDetailSessions } from '@/components/market/MarketEventDetailSessions';
import { ListingChevronIcon } from '@/components/market/MarketListingIcons';
import {
  EVENT_DETAIL_BODY,
  EVENT_DETAIL_BORDER,
  EVENT_DETAIL_GREEN,
  EVENT_DETAIL_MUTED,
  EVENT_DETAIL_SOFT,
  EVENT_DETAIL_TEAL,
  EVENT_DETAIL_TRACK,
  MARKET_EVENT_DETAIL,
} from '@/components/market/marketEventDetailData';
import { c, NU } from '@/utils/newUiCompact';

export function MarketEventDetailBody() {
  const router = useRouter();

  return (
    <View>
      <View style={styles.media}>
        <EventDetailCalendarIcon color={MARKET_EVENT_DETAIL.mediaIcon} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <View style={styles.kindRow}>
            <Text style={styles.badge}>{MARKET_EVENT_DETAIL.badge}</Text>
            <Text style={styles.kindMeta}>{MARKET_EVENT_DETAIL.kindMeta}</Text>
          </View>
          <Text style={styles.title}>{MARKET_EVENT_DETAIL.title}</Text>
          <Text style={styles.description}>{MARKET_EVENT_DETAIL.description}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={[styles.infoRow, styles.infoBorder]}>
            <EventDetailCalSmallIcon />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>{MARKET_EVENT_DETAIL.dateTitle}</Text>
              <Text style={styles.infoMeta}>{MARKET_EVENT_DETAIL.dateMeta}</Text>
            </View>
            <Text style={styles.addLink}>Add</Text>
          </View>
          <View style={[styles.infoRow, styles.infoBorder]}>
            <BizProfilePinIcon />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>
                {MARKET_EVENT_DETAIL.locationTitle}
              </Text>
              <Text style={styles.infoMeta}>
                {MARKET_EVENT_DETAIL.locationMeta}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <EventDetailPersonIcon />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>
                {MARKET_EVENT_DETAIL.capacityTitle}
              </Text>
              <Text style={styles.infoMeta}>
                {MARKET_EVENT_DETAIL.capacityMeta}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.host}
          onPress={() => router.push('/(main)/market/business-profile')}
          accessibilityRole="button"
        >
          <View style={styles.hostAvatar}>
            <Text style={styles.hostInitials}>
              {MARKET_EVENT_DETAIL.hostInitials}
            </Text>
          </View>
          <View style={styles.hostCopy}>
            <Text style={styles.hostName}>{MARKET_EVENT_DETAIL.hostName}</Text>
            <Text style={styles.hostMeta}>{MARKET_EVENT_DETAIL.hostMeta}</Text>
          </View>
          <ListingChevronIcon />
        </Pressable>

        <MarketEventDetailSessions />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    height: c(200, 170),
    backgroundColor: MARKET_EVENT_DETAIL.mediaBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(20, 16),
  },
  titleBlock: {
    gap: c(9, 7),
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  badge: {
    fontSize: NU.label,
    fontWeight: '700',
    color: EVENT_DETAIL_GREEN,
    backgroundColor: '#e6f4e8',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: c(4, 3),
    overflow: 'hidden',
  },
  kindMeta: {
    fontSize: c(11.5, 10.5),
    color: EVENT_DETAIL_SOFT,
  },
  title: {
    fontSize: c(23, 20),
    fontWeight: '800',
    color: EVENT_DETAIL_TEAL,
    letterSpacing: -0.4,
    lineHeight: c(28, 24),
  },
  description: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
    color: EVENT_DETAIL_BODY,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: EVENT_DETAIL_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  infoRow: {
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: c(15, 12),
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  infoBorder: {
    borderBottomWidth: 1,
    borderBottomColor: EVENT_DETAIL_TRACK,
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: EVENT_DETAIL_TEAL,
  },
  infoMeta: {
    fontSize: c(12.5, 11.5),
    color: EVENT_DETAIL_MUTED,
    marginTop: c(2, 1),
  },
  addLink: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: EVENT_DETAIL_GREEN,
  },
  host: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: EVENT_DETAIL_BORDER,
    borderRadius: NU.cardRadius,
    paddingVertical: c(13, 11),
    paddingHorizontal: NU.cardPadSm,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  hostAvatar: {
    width: c(44, 40),
    height: c(44, 40),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: MARKET_EVENT_DETAIL.hostAvatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostInitials: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: MARKET_EVENT_DETAIL.hostAvatarColor,
  },
  hostCopy: {
    flex: 1,
  },
  hostName: {
    fontSize: NU.link,
    fontWeight: '700',
    color: EVENT_DETAIL_TEAL,
  },
  hostMeta: {
    fontSize: NU.bodySm,
    color: EVENT_DETAIL_MUTED,
    marginTop: c(2, 1),
  },
});
