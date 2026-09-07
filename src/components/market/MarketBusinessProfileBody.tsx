import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  BizProfileClockIcon,
  BizProfileGlobeIcon,
  BizProfileMailIcon,
  BizProfilePinIcon,
} from '@/components/market/MarketBusinessProfileIcons';
import { MarketBusinessProfileListings } from '@/components/market/MarketBusinessProfileListings';
import { MarketStarIcon } from '@/components/market/MarketIcons';
import {
  BIZ_PROFILE_BODY,
  BIZ_PROFILE_BORDER,
  BIZ_PROFILE_GREEN,
  BIZ_PROFILE_MUTED,
  BIZ_PROFILE_TEAL,
  BIZ_PROFILE_TRACK,
  MARKET_BIZ_PROFILE,
} from '@/components/market/marketBusinessProfileData';
import { c, NU } from '@/utils/newUiCompact';

export function MarketBusinessProfileBody() {
  const router = useRouter();

  return (
    <View style={styles.body}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{MARKET_BIZ_PROFILE.initials}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.fullName}>{MARKET_BIZ_PROFILE.fullName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.rating}>
              <MarketStarIcon />
              <Text style={styles.ratingText}>{MARKET_BIZ_PROFILE.rating}</Text>
            </View>
            <Text style={styles.metaMuted}>{MARKET_BIZ_PROFILE.reviewsMeta}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.messageBtn}
          onPress={() => router.push('/(main)/market/business-chat')}
          accessibilityRole="button"
        >
          <Text style={styles.messageText}>Message</Text>
        </Pressable>
        <Pressable style={styles.websiteBtn} accessibilityRole="button">
          <Text style={styles.websiteText}>Website</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <Text style={styles.about}>{MARKET_BIZ_PROFILE.about}</Text>
      </View>

      <View style={styles.contactCard}>
        <View style={[styles.contactRow, styles.contactBorder]}>
          <BizProfilePinIcon />
          <View style={styles.contactCopy}>
            <Text style={styles.contactTitle}>
              {MARKET_BIZ_PROFILE.addressLine}
            </Text>
            <Text style={styles.contactMeta}>
              {MARKET_BIZ_PROFILE.addressMeta}
            </Text>
          </View>
        </View>
        <View style={[styles.contactRowCenter, styles.contactBorder]}>
          <BizProfileGlobeIcon />
          <Text style={styles.websiteLink}>{MARKET_BIZ_PROFILE.website}</Text>
        </View>
        <View style={[styles.contactRowCenter, styles.contactBorder]}>
          <BizProfileMailIcon />
          <Text style={styles.contactTitle}>{MARKET_BIZ_PROFILE.email}</Text>
        </View>
        <View style={styles.contactRowCenter}>
          <BizProfileClockIcon />
          <Text style={styles.contactTitle}>{MARKET_BIZ_PROFILE.hours}</Text>
        </View>
      </View>

      <MarketBusinessProfileListings />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(22, 18),
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.rowGap,
  },
  avatar: {
    width: c(66, 56),
    height: c(66, 56),
    borderRadius: c(18, 14),
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: NU.name,
    fontWeight: '800',
    color: BIZ_PROFILE_GREEN,
  },
  identityCopy: {
    flex: 1,
    gap: c(5, 4),
  },
  fullName: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    color: BIZ_PROFILE_TEAL,
    letterSpacing: -0.2,
    lineHeight: c(22, 20),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    flexWrap: 'wrap',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(3, 2),
  },
  ratingText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: '#c07c27',
  },
  metaMuted: {
    fontSize: c(12.5, 11.5),
    color: BIZ_PROFILE_MUTED,
  },
  actions: {
    flexDirection: 'row',
    gap: c(10, 8),
  },
  messageBtn: {
    flex: 1,
    height: NU.searchH,
    borderRadius: 99,
    backgroundColor: BIZ_PROFILE_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  websiteBtn: {
    flex: 1,
    height: NU.searchH,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#c8e0cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  websiteText: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: BIZ_PROFILE_TEAL,
  },
  section: {
    gap: c(10, 8),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: BIZ_PROFILE_MUTED,
  },
  about: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
    color: BIZ_PROFILE_BODY,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BIZ_PROFILE_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  contactRow: {
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: NU.cardPad,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'flex-start',
  },
  contactRowCenter: {
    paddingVertical: NU.cardPadSm,
    paddingHorizontal: NU.cardPad,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  contactBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BIZ_PROFILE_TRACK,
  },
  contactCopy: {
    flex: 1,
  },
  contactTitle: {
    flex: 1,
    fontSize: NU.link,
    fontWeight: '600',
    color: BIZ_PROFILE_TEAL,
  },
  contactMeta: {
    fontSize: c(12.5, 11.5),
    color: BIZ_PROFILE_MUTED,
    marginTop: c(2, 1),
  },
  websiteLink: {
    flex: 1,
    fontSize: NU.link,
    fontWeight: '600',
    color: BIZ_PROFILE_GREEN,
  },
});
