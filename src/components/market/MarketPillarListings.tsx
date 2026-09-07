import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BizProfileMonitorIcon } from '@/components/market/MarketBusinessProfileIcons';
import {
  MarketBagIcon,
  MarketBowlIcon,
  MarketStarIcon,
  MarketUserIcon,
  MarketVerifiedIcon,
} from '@/components/market/MarketIcons';
import {
  PILLAR_BORDER,
  PILLAR_GREEN,
  PILLAR_MUTED,
  PILLAR_SOFT,
  PILLAR_TEAL,
  type PillarBrowseContent,
} from '@/components/market/marketPillarData';
import { c, NU } from '@/utils/newUiCompact';

type MarketPillarListingsProps = {
  pillar: PillarBrowseContent;
  showBiz: boolean;
  showOffers: boolean;
  showEvents: boolean;
  offers: PillarBrowseContent['offers'];
};

function OfferGlyph({
  icon,
  color,
}: {
  icon: PillarBrowseContent['offers'][number]['icon'];
  color: string;
}) {
  if (icon === 'bag') return <MarketBagIcon color={color} size={26} />;
  if (icon === 'bowl') return <MarketBowlIcon color={color} size={26} />;
  if (icon === 'monitor') return <BizProfileMonitorIcon color={color} size={26} />;
  return <MarketUserIcon color={color} size={26} />;
}

export function MarketPillarListings({
  pillar,
  showBiz,
  showOffers,
  showEvents,
  offers,
}: MarketPillarListingsProps) {
  const router = useRouter();

  return (
    <>
      {showBiz ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Businesses</Text>
          {pillar.businesses.map((biz) => (
            <Pressable
              key={biz.id}
              style={styles.bizCard}
              onPress={() => router.push('/(main)/market/business-profile')}
            >
              <View
                style={[styles.bizAvatar, { backgroundColor: biz.avatarBg }]}
              >
                <Text style={[styles.bizInitials, { color: biz.avatarColor }]}>
                  {biz.initials}
                </Text>
              </View>
              <View style={styles.bizCopy}>
                <View style={styles.bizNameRow}>
                  <Text style={styles.bizName}>{biz.name}</Text>
                  {biz.verified ? <MarketVerifiedIcon /> : null}
                </View>
                <Text style={styles.bizSubtitle}>{biz.subtitle}</Text>
                <View style={styles.bizMeta}>
                  <MarketStarIcon />
                  <Text style={styles.ratingText}>{biz.rating}</Text>
                  <Text style={styles.metaDot}>· {biz.meta}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {showOffers && offers.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Products & services</Text>
          {offers.map((offer) => (
            <Pressable
              key={offer.id}
              style={styles.offerCard}
              onPress={() =>
                router.push(
                  offer.route === 'service'
                    ? {
                        pathname: '/(main)/market/service-detail',
                        params: { id: offer.id },
                      }
                    : '/(main)/market/listing',
                )
              }
            >
              <View
                style={[styles.offerMedia, { backgroundColor: offer.mediaBg }]}
              >
                <OfferGlyph icon={offer.icon} color={offer.iconColor} />
              </View>
              <View style={styles.offerCopy}>
                <Text
                  style={[
                    styles.offerKind,
                    {
                      color: offer.kind === 'PRODUCT' ? PILLAR_GREEN : '#8352c0',
                      backgroundColor:
                        offer.kind === 'PRODUCT' ? '#e6f4e8' : '#f2e9fb',
                    },
                  ]}
                >
                  {offer.kind}
                </Text>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerVendor}>{offer.vendor}</Text>
              </View>
              <Text style={styles.offerPrice}>
                {offer.price}
                {offer.priceSuffix ? (
                  <Text style={styles.offerSuffix}>{offer.priceSuffix}</Text>
                ) : null}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {showEvents && pillar.events.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Events & courses</Text>
          {pillar.events.map((event) => (
            <Pressable
              key={event.id}
              style={styles.eventCard}
              onPress={() =>
                router.push(
                  event.route === 'course'
                    ? '/(main)/market/course-learning'
                    : '/(main)/market/event-detail',
                )
              }
            >
              <View style={[styles.eventSide, { backgroundColor: event.sideBg }]}>
                <Text style={[styles.eventTop, { color: event.sideTopColor }]}>
                  {event.sideTop}
                </Text>
                <Text
                  style={[styles.eventBottom, { color: event.sideBottomColor }]}
                >
                  {event.sideBottom}
                </Text>
              </View>
              <View style={styles.eventCopy}>
                <View style={styles.eventBadgeRow}>
                  <Text
                    style={[
                      styles.eventBadge,
                      {
                        color: event.badgeColor,
                        backgroundColor: event.badgeBg,
                      },
                    ]}
                  >
                    {event.badge}
                  </Text>
                  <Text style={styles.eventWhen}>{event.when}</Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDetail}>{event.detail}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: c(11, 9),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: PILLAR_MUTED,
  },
  bizCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: PILLAR_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  bizAvatar: {
    width: c(48, 42),
    height: c(48, 42),
    borderRadius: NU.cardRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bizInitials: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
  },
  bizCopy: {
    flex: 1,
  },
  bizNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(6, 4),
  },
  bizName: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: PILLAR_TEAL,
  },
  bizSubtitle: {
    fontSize: c(12.5, 11.5),
    color: PILLAR_MUTED,
    marginTop: c(2, 1),
  },
  bizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(4, 3),
    marginTop: c(5, 4),
  },
  ratingText: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: PILLAR_TEAL,
  },
  metaDot: {
    fontSize: c(12.5, 11.5),
    color: PILLAR_SOFT,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: PILLAR_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadXs,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  offerMedia: {
    width: c(52, 44),
    height: c(52, 44),
    borderRadius: NU.cardRadiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  offerKind: {
    alignSelf: 'flex-start',
    fontSize: c(10.5, 10),
    fontWeight: '700',
    paddingVertical: c(2, 2),
    paddingHorizontal: c(6, 5),
    borderRadius: c(4, 3),
    overflow: 'hidden',
  },
  offerTitle: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: PILLAR_TEAL,
  },
  offerVendor: {
    fontSize: NU.bodySm,
    color: PILLAR_MUTED,
  },
  offerPrice: {
    fontSize: NU.cardTitle,
    fontWeight: '800',
    color: PILLAR_TEAL,
  },
  offerSuffix: {
    fontSize: NU.label,
    fontWeight: '500',
    color: PILLAR_SOFT,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: PILLAR_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadXs,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  eventSide: {
    width: c(52, 44),
    borderRadius: c(11, 9),
    paddingVertical: c(8, 6),
    alignItems: 'center',
  },
  eventTop: {
    fontSize: c(9.5, 9),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  eventBottom: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    lineHeight: c(20, 18),
  },
  eventCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  eventBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  eventBadge: {
    fontSize: c(10, 9),
    fontWeight: '700',
    paddingVertical: c(2, 2),
    paddingHorizontal: c(6, 5),
    borderRadius: c(4, 3),
    overflow: 'hidden',
  },
  eventWhen: {
    fontSize: c(11.5, 10.5),
    color: PILLAR_SOFT,
  },
  eventTitle: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: PILLAR_TEAL,
  },
  eventDetail: {
    fontSize: NU.bodySm,
    color: PILLAR_MUTED,
  },
});
