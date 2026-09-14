import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
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
import { MarketBusinessAvatar } from '@/components/market/MarketBusinessAvatar';
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
  type MarketOffer,
  type MarketPillar,
} from '@/components/market/marketDashboardData';
import { MARKET_TRAININGS } from '@/components/market/marketTrainingData';
import { MarketTrainingCard } from '@/components/market/MarketTrainingCard';
import { FEATURED_BUSINESSES_ALL } from '@/components/market/marketBusinessListData';
import { useMarketHomeData } from '@/hooks/useMarketHome';
import { useMarketTrainingsPreview } from '@/hooks/useTrainings';
import {
  mapEnterprisesToFeaturedBusinesses,
  mapEnterprisesToMarketBusinessList,
} from '@/utils/marketBusiness.mapper';
import {
  mapFeaturedMarketOffers,
  mapMarketHomeOffers,
} from '@/utils/marketOffers.mapper';
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
      <MarketBusinessAvatar
        imageUrl={biz.imageUrl}
        initials={biz.initials}
        avatarBg={biz.avatarBg}
        avatarColor={biz.avatarColor}
        size={c(56, 48)}
        borderRadius={NU.cardRadiusMd}
        initialsFontSize={c(19, 16)}
      />
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

function FeaturedOfferCard({ offer }: { offer: MarketOffer }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.offerCard}
      onPress={() =>
        router.push(
          offer.kind === 'SERVICE'
            ? {
                pathname: '/(main)/market/service-detail',
                params: { id: offer.id },
              }
            : {
                pathname: '/(main)/market/listing',
                params: { id: offer.id },
              },
        )
      }
    >
      <View style={[styles.offerMedia, { backgroundColor: offer.mediaBg }]}>
        {offer.imageUrl ? (
          <Image
            source={{ uri: offer.imageUrl }}
            style={styles.offerImage}
            contentFit="cover"
            transition={0}
          />
        ) : offer.icon === 'bag' ? (
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
  );
}

type MarketBodyProps = {
  searchQuery?: string;
  activeFilter?: string;
};

export function MarketBody({
  searchQuery = '',
  activeFilter = 'All',
}: MarketBodyProps) {
  const router = useRouter();
  const {
    isSearching,
    enterprises,
    products,
    services,
    isLoading,
    isFetching,
  } = useMarketHomeData(searchQuery);
  const { items: apiTrainingsPreview, isLoading: isTrainingsLoading } =
    useMarketTrainingsPreview();

  const featuredBusinesses =
    enterprises.length > 0
      ? isSearching
        ? mapEnterprisesToMarketBusinessList(enterprises, FEATURED_BUSINESSES_ALL)
        : mapEnterprisesToFeaturedBusinesses(enterprises, 2)
      : isLoading
        ? []
        : isSearching
          ? []
          : MARKET_BUSINESSES;

  const featuredOffers = isLoading
    ? []
    : isSearching
      ? mapMarketHomeOffers(products, services)
      : (() => {
          const mapped = mapFeaturedMarketOffers(products[0], services[0]);
          return mapped.length > 0 ? mapped : MARKET_OFFERS;
        })();

  const showPillars =
    !isSearching && (activeFilter === 'All' || activeFilter === 'Businesses');
  const showBiz = activeFilter === 'All' || activeFilter === 'Businesses';
  const showOffers =
    activeFilter === 'All' ||
    activeFilter === 'Products' ||
    activeFilter === 'Services';
  const showEvents =
    !isSearching && (activeFilter === 'All' || activeFilter === 'Events');
  const showTrainings =
    !isSearching && (activeFilter === 'All' || activeFilter === 'Trainings');

  const visibleOffers = featuredOffers.filter((offer) => {
    if (activeFilter === 'Products') return offer.kind === 'PRODUCT';
    if (activeFilter === 'Services') return offer.kind === 'SERVICE';
    return true;
  });

  const offerRows: MarketOffer[][] = [];
  for (let i = 0; i < visibleOffers.length; i += 2) {
    offerRows.push(visibleOffers.slice(i, i + 2));
  }

  const bizTitle = isSearching ? 'Businesses' : 'Featured businesses';
  const showLoading = isLoading || (isFetching && isSearching);

  return (
    <View style={styles.body}>
      {showPillars ? (
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
      ) : null}

      {showBiz ? (
        <View style={styles.section}>
          <SectionLabel
            title={bizTitle}
            action={isSearching ? undefined : 'See all'}
            onActionPress={
              isSearching
                ? undefined
                : () => router.push('/(main)/market/businesses')
            }
          />
          {showLoading && featuredBusinesses.length === 0 ? (
            <View style={styles.bizLoading}>
              <ActivityIndicator color={MARKET_GREEN} />
            </View>
          ) : featuredBusinesses.length === 0 ? (
            <Text style={styles.bizEmpty}>
              {isSearching
                ? 'No businesses match your search.'
                : 'No businesses available yet.'}
            </Text>
          ) : (
            featuredBusinesses.map((biz) => (
              <FeaturedBusinessCard key={biz.id} biz={biz} />
            ))
          )}
        </View>
      ) : null}

      {showOffers ? (
        <View style={styles.section}>
          <SectionLabel
            title="Products & services"
            action={isSearching ? undefined : 'See all'}
            onActionPress={
              isSearching
                ? undefined
                : () => router.push('/(main)/market/offers')
            }
          />
          {showLoading && visibleOffers.length === 0 ? (
            <View style={styles.bizLoading}>
              <ActivityIndicator color={MARKET_GREEN} />
            </View>
          ) : visibleOffers.length === 0 ? (
            <Text style={styles.bizEmpty}>
              {isSearching
                ? 'No products or services match your search.'
                : 'No products or services yet.'}
            </Text>
          ) : (
            <View style={styles.offerGrid}>
              {offerRows.map((row) => (
                <View
                  key={row.map((item) => `${item.kind}-${item.id}`).join('-')}
                  style={styles.offerRow}
                >
                  {row.map((offer) => (
                    <FeaturedOfferCard
                      key={`${offer.kind}-${offer.id}`}
                      offer={offer}
                    />
                  ))}
                  {row.length === 1 ? <View style={styles.offerSpacer} /> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {showEvents ? (
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
      ) : null}

      {showTrainings ? (
        <View style={styles.section}>
          <SectionLabel
            title="Trainings"
            action="See all"
            onActionPress={() => router.push('/(main)/market/trainings')}
          />
          {isTrainingsLoading && apiTrainingsPreview.length === 0 ? (
            <View style={styles.bizLoading}>
              <ActivityIndicator color={MARKET_GREEN} />
            </View>
          ) : null}
          {apiTrainingsPreview.map((item) => (
            <MarketTrainingCard key={`api-${item.id}`} item={item} />
          ))}
          {MARKET_TRAININGS.slice(0, 2).map((item) => (
            <MarketTrainingCard key={`static-${item.id}`} item={item} />
          ))}
        </View>
      ) : null}

      {!isSearching ? (
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
      ) : null}
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
    gap: NU.cardGap,
  },
  offerRow: {
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
  offerSpacer: {
    flex: 1,
  },
  offerMedia: {
    height: c(96, 84),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  offerImage: {
    width: '100%',
    height: '100%',
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
