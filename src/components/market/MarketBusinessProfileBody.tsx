import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
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
} from '@/components/market/marketBusinessProfileData';
import type { MarketBizProfileView } from '@/utils/marketBizProfile.mapper';
import { c, NU } from '@/utils/newUiCompact';

type MarketBusinessProfileBodyProps = {
  profile: MarketBizProfileView;
  enterpriseId?: string;
};

export function MarketBusinessProfileBody({
  profile,
  enterpriseId = '',
}: MarketBusinessProfileBodyProps) {
  const router = useRouter();
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(profile.logoUrl) && !logoFailed;

  useEffect(() => {
    setLogoFailed(false);
  }, [profile.logoUrl, enterpriseId]);

  const openWebsite = () => {
    if (!profile.websiteUrl) return;
    void Linking.openURL(profile.websiteUrl);
  };

  return (
    <View style={styles.body}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          {showLogo ? (
            <Image
              source={{ uri: profile.logoUrl! }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={0}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <Text style={styles.initials}>{profile.initials}</Text>
          )}
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.fullName}>{profile.fullName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.rating}>
              <MarketStarIcon />
              <Text style={styles.ratingText}>{profile.rating}</Text>
            </View>
            <Text style={styles.metaMuted}>{profile.reviewsMeta}</Text>
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
        <Pressable
          style={[styles.websiteBtn, !profile.websiteUrl && styles.websiteBtnDisabled]}
          onPress={openWebsite}
          disabled={!profile.websiteUrl}
          accessibilityRole="button"
        >
          <Text style={styles.websiteText}>Website</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <Text style={styles.about}>{profile.about}</Text>
      </View>

      <View style={styles.contactCard}>
        <View style={[styles.contactRow, styles.contactBorder]}>
          <BizProfilePinIcon />
          <View style={styles.contactCopy}>
            <Text style={styles.contactTitle}>{profile.addressLine}</Text>
            <Text style={styles.contactMeta}>{profile.addressMeta}</Text>
          </View>
        </View>
        <View style={[styles.contactRowCenter, styles.contactBorder]}>
          <BizProfileGlobeIcon />
          <Text style={styles.websiteLink}>{profile.website}</Text>
        </View>
        <View style={[styles.contactRowCenter, styles.contactBorder]}>
          <BizProfileMailIcon />
          <Text style={styles.contactTitle}>{profile.email}</Text>
        </View>
        <View style={styles.contactRowCenter}>
          <BizProfileClockIcon />
          <Text style={styles.contactTitle}>{profile.hours}</Text>
        </View>
      </View>

      <MarketBusinessProfileListings enterpriseId={enterpriseId} />
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  websiteBtnDisabled: {
    opacity: 0.55,
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
