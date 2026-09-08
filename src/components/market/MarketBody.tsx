import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  MarketBagIcon,
  MarketBarbellIcon,
  MarketExternalIcon,
  MarketFlaskIcon,
  MarketHeartIcon,
  MarketStarIcon,
  MarketSunIcon,
  MarketUserIcon,
  MarketVerifiedIcon,
} from '@/components/market/MarketIcons';
import {
  MARKET_BORDER,
  MARKET_BUSINESSES,
  MARKET_EVENTS,
  MARKET_GREEN,
  MARKET_MUTED,
  MARKET_OFFERS,
  MARKET_PILLARS,
  MARKET_SOFT,
  MARKET_TEAL,
  type MarketBusiness,
  type MarketPillar,
} from '@/components/market/marketDashboardData';
import { useFeaturedMarketEnterprises } from '@/hooks/useEnterprises';
import { mapEnterprisesToFeaturedBusinesses } from '@/utils/marketBusiness.mapper';
import { c, NU } from '@/utils/newUiCompact';

function PillarIcon({ pillar }: { pillar: MarketPillar }) {
  const props = { color: pillar.color, size: 24 };
  switch (pillar.icon) {
    case 'heart':
      return <MarketHeartIcon {...props} />;
    case 'barbell':
      return <MarketBarbellIcon {...props} />;
    case 'sun':
      return <MarketSunIcon {...props} />;
    case 'flask':
      return <MarketFlaskIcon {...props} />;
  }
}

function SectionLabel({
  title,
  action,
  onActionPress,
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {action ? (
        <Pressable onPress={onActionPress} hitSlop={8} accessibilityRole="button">
          <Text style={styles.seeAll}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FeaturedBusinessCard({ biz }: { biz: MarketBusiness }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.bizCard}
      onPress={() =>
        router.push({
          pathname: '/(main)/market/business-profile',
          params: { id: biz.id },
        })
      }
    >
      <View style={[styles.bizAvatar, { backgroundColor: biz.avatarBg }]}>
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
          <View style={styles.rating}>
            <MarketStarIcon />
            <Text style={styles.ratingText}>{biz.rating}</Text>
          </View>
          <Text style={styles.metaDot}>· {biz.reviews}</Text>
          <Text style={styles.metaDot}>· {biz.meta}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function MarketBody() {
  const router = useRouter();
  const { data, isLoading } = useFeaturedMarketEnterprises(2);
  const featuredBusinesses =
    data && data.length > 0
      ? mapEnterprisesToFeaturedBusinesses(data, 2)
      : isLoading
        ? []
        : MARKET_BUSINESSES;

  return (
    <View style={styles.body}>
      <View style={styles.section}>
        <SectionLabel title="Browse by pillar" />
        <View style={styles.pillarGrid}>
          {MARKET_PILLARS.map((pillar) => (
            <Pressable
              key={pillar.id}
              style={styles.pillarItem}
              onPress={() =>
                router.push({
                  pathname: '/(main)/market/pillar',
                  params: { id: pillar.id },
                })
              }
            >
              <View style={[styles.pillarTile, { backgroundColor: pillar.bg }]}>
                <PillarIcon pillar={pillar} />
              </View>
              <Text style={styles.pillarTitle}>{pillar.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel
          title="Featured businesses"
          action="See all"
          onActionPress={() => router.push('/(main)/market/businesses')}
        />
        {isLoading ? (
          <View style={styles.bizLoading}>
            <ActivityIndicator color={MARKET_GREEN} />
          </View>
        ) : featuredBusinesses.length === 0 ? (
          <Text style={styles.bizEmpty}>No businesses available yet.</Text>
        ) : (
          featuredBusinesses.map((biz) => (
            <FeaturedBusinessCard key={biz.id} biz={biz} />
          ))
        )}
      </View>

      <View style={styles.section}>
        <SectionLabel
          title="Products & services"
          action="See all"
          onActionPress={() => router.push('/(main)/market/offers')}
        />
        <View style={styles.offerGrid}>
          {MARKET_OFFERS.map((offer) => (
            <Pressable
              key={offer.id}
              style={styles.offerCard}
              onPress={() =>
                router.push(
                  offer.kind === 'SERVICE'
                    ? {
                        pathname: '/(main)/market/service-detail',
                        params: { id: offer.id },
                      }
                    : '/(main)/market/listing',
                )
              }
            >
              <View style={[styles.offerMedia, { backgroundColor: offer.mediaBg }]}>
                {offer.icon === 'bag' ? (
                  <MarketBagIcon color={offer.iconColor} />
                ) : (
                  <MarketUserIcon color={offer.iconColor} />
                )}
              </View>
              <View style={styles.offerCopy}>
                <Text
                  style={[
                    styles.offerKind,
                    { color: offer.kindColor, backgroundColor: offer.kindBg },
                  ]}
                >
                  {offer.kind}
                </Text>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerVendor}>{offer.vendor}</Text>
                <Text style={styles.offerPrice}>
                  {offer.price}
                  {offer.priceSuffix ? (
                    <Text style={styles.offerSuffix}>{offer.priceSuffix}</Text>
                  ) : null}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel
          title="Events & courses"
          action="See all"
          onActionPress={() => router.push('/(main)/market/events')}
        />
        {MARKET_EVENTS.map((item) => (
          <Pressable
            key={item.id}
            style={styles.eventCard}
            onPress={() =>
              router.push(
                item.id === 'metabolic'
                  ? '/(main)/market/course-learning'
                  : '/(main)/market/event-detail',
              )
            }
          >
            <View style={[styles.eventSide, { backgroundColor: item.sideBg }]}>
              <Text style={[styles.eventSideTop, { color: item.sideTopColor }]}>
                {item.sideTop}
              </Text>
              <Text
                style={[styles.eventSideBottom, { color: item.sideBottomColor }]}
              >
                {item.sideBottom}
              </Text>
            </View>
            <View style={styles.eventCopy}>
              <View style={styles.eventBadgeRow}>
                <Text
                  style={[
                    styles.eventBadge,
                    { color: item.badgeColor, backgroundColor: item.badgeBg },
                  ]}
                >
                  {item.badge}
                </Text>
                <Text style={styles.eventWhen}>{item.when}</Text>
              </View>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDetail}>{item.detail}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.cta}>
        <View style={styles.ctaCopy}>
          <Text style={styles.ctaTitle}>Own a wellness business?</Text>
          <Text style={styles.ctaBody}>
            Listings are created on the web — visit invigorate.health/business on
            a computer.
          </Text>
        </View>
        <View style={styles.ctaBtn}>
          <MarketExternalIcon />
        </View>
      </View>
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
  section: {
    gap: NU.cardGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: MARKET_MUTED,
  },
  seeAll: {
    fontSize: c(12.5, 11.5),
    fontWeight: '600',
    color: MARKET_GREEN,
  },
  pillarGrid: {
    flexDirection: 'row',
    gap: c(10, 8),
  },
  pillarItem: {
    flex: 1,
    alignItems: 'center',
    gap: c(7, 5),
  },
  pillarTile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: NU.cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    fontSize: c(11.5, 10.5),
    fontWeight: '600',
    color: MARKET_TEAL,
    textAlign: 'center',
  },
  bizLoading: {
    paddingVertical: c(20, 16),
    alignItems: 'center',
  },
  bizEmpty: {
    fontSize: c(13, 12),
    color: MARKET_MUTED,
    paddingVertical: c(8, 6),
  },
  bizCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: c(13, 11),
    alignItems: 'center',
  },
  bizAvatar: {
    width: c(56, 48),
    height: c(56, 48),
    borderRadius: NU.cardRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bizInitials: {
    fontSize: c(19, 16),
    fontWeight: '800',
  },
  bizCopy: {
    flex: 1,
    gap: c(4, 3),
  },
  bizNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(7, 5),
  },
  bizName: {
    fontSize: c(15.5, 14),
    fontWeight: '700',
    color: MARKET_TEAL,
    flexShrink: 1,
  },
  bizSubtitle: {
    fontSize: c(12.5, 11.5),
    color: MARKET_MUTED,
  },
  bizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    flexWrap: 'wrap',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(3, 2),
  },
  ratingText: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: '#c07c27',
  },
  metaDot: {
    fontSize: c(11.5, 10.5),
    color: MARKET_SOFT,
  },
  offerGrid: {
    flexDirection: 'row',
    gap: NU.cardGap,
  },
  offerCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_BORDER,
    borderRadius: NU.cardRadius,
    overflow: 'hidden',
  },
  offerMedia: {
    height: c(96, 84),
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerCopy: {
    paddingTop: c(11, 9),
    paddingHorizontal: NU.cardPadXs,
    paddingBottom: c(13, 11),
    gap: c(4, 3),
  },
  offerKind: {
    fontSize: c(10.5, 10),
    fontWeight: '700',
    paddingVertical: c(2, 2),
    paddingHorizontal: c(6, 5),
    borderRadius: c(4, 3),
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  offerTitle: {
    fontSize: c(13.5, 12.5),
    fontWeight: '700',
    color: MARKET_TEAL,
    lineHeight: c(18, 16),
  },
  offerVendor: {
    fontSize: c(11.5, 10.5),
    color: MARKET_MUTED,
  },
  offerPrice: {
    marginTop: c(2, 1),
    fontSize: NU.link,
    fontWeight: '800',
    color: MARKET_TEAL,
  },
  offerSuffix: {
    fontSize: NU.label,
    fontWeight: '500',
    color: MARKET_SOFT,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MARKET_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: c(13, 11),
    alignItems: 'center',
  },
  eventSide: {
    width: c(58, 50),
    borderRadius: c(13, 11),
    paddingVertical: NU.chipPadV,
    alignItems: 'center',
  },
  eventSideTop: {
    fontSize: c(10.5, 10),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  eventSideBottom: {
    fontSize: c(21, 18),
    fontWeight: '800',
    lineHeight: c(24, 20),
  },
  eventCopy: {
    flex: 1,
    gap: c(4, 3),
  },
  eventBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(7, 5),
    flexWrap: 'wrap',
  },
  eventBadge: {
    paddingVertical: c(3, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: c(4, 3),
    overflow: 'hidden',
    fontSize: NU.label,
    fontWeight: '700',
  },
  eventWhen: {
    fontSize: c(11.5, 10.5),
    color: MARKET_SOFT,
  },
  eventTitle: {
    fontSize: c(15.5, 14),
    fontWeight: '700',
    color: MARKET_TEAL,
    lineHeight: c(20, 18),
  },
  eventDetail: {
    fontSize: c(12.5, 11.5),
    color: MARKET_MUTED,
  },
  cta: {
    backgroundColor: MARKET_TEAL,
    borderRadius: c(18, 16),
    padding: NU.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: NU.rowGap,
  },
  ctaCopy: {
    flex: 1,
    gap: c(4, 3),
  },
  ctaTitle: {
    fontSize: c(15.5, 14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaBody: {
    fontSize: c(12.5, 11.5),
    lineHeight: c(18, 16),
    color: 'rgba(255,255,255,0.72)',
  },
  ctaBtn: {
    width: NU.iconBtn,
    height: NU.iconBtn,
    borderRadius: NU.iconBtnRadius,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
