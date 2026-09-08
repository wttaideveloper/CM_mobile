import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BizProfileMonitorIcon } from '@/components/market/MarketBusinessProfileIcons';
import { MarketBagIcon, MarketBowlIcon } from '@/components/market/MarketIcons';
import {
  BIZ_PROFILE_BORDER,
  BIZ_PROFILE_EVENTS,
  BIZ_PROFILE_GREEN,
  BIZ_PROFILE_MUTED,
  BIZ_PROFILE_OFFERS,
  BIZ_PROFILE_TEAL,
  type BizProfileOffer,
} from '@/components/market/marketBusinessProfileData';
import { useEnterpriseProducts } from '@/hooks/useProducts';
import { useEnterpriseServices } from '@/hooks/useServices';
import { mapProductsAndServicesToBizOffers } from '@/utils/marketBizOffers.mapper';
import { c, NU } from '@/utils/newUiCompact';

type MarketBusinessProfileListingsProps = {
  enterpriseId?: string;
};

export function MarketBusinessProfileListings({
  enterpriseId = '',
}: MarketBusinessProfileListingsProps) {
  const router = useRouter();
  const {
    data: products = [],
    isLoading: productsLoading,
  } = useEnterpriseProducts(enterpriseId, {
    enabled: Boolean(enterpriseId),
  });
  const {
    data: services = [],
    isLoading: servicesLoading,
  } = useEnterpriseServices(enterpriseId, {
    enabled: Boolean(enterpriseId),
  });

  const isLoading = Boolean(enterpriseId) && (productsLoading || servicesLoading);
  const apiOffers = mapProductsAndServicesToBizOffers(products, services);
  const offers: BizProfileOffer[] =
    enterpriseId && !isLoading
      ? apiOffers
      : enterpriseId
        ? []
        : BIZ_PROFILE_OFFERS;

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Products & services</Text>
          <Text style={styles.count}>{String(offers.length)}</Text>
        </View>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={BIZ_PROFILE_GREEN} />
          </View>
        ) : offers.length === 0 ? (
          <Text style={styles.empty}>No products or services yet.</Text>
        ) : (
          <View style={styles.list}>
            {offers.map((item) => (
              <Pressable
                key={`${item.kind}-${item.id}`}
                style={styles.itemCard}
                onPress={() =>
                  router.push(
                    item.kind === 'service'
                      ? {
                          pathname: '/(main)/market/service-detail',
                          params: { id: item.id },
                        }
                      : {
                          pathname: '/(main)/market/listing',
                          params: { id: item.id },
                        },
                  )
                }
              >
                <View style={[styles.itemIcon, { backgroundColor: item.iconBg }]}>
                  {item.icon === 'bag' ? (
                    <MarketBagIcon color={item.iconColor} size={22} />
                  ) : item.icon === 'bowl' ? (
                    <MarketBowlIcon color={item.iconColor} size={22} />
                  ) : (
                    <BizProfileMonitorIcon color={item.iconColor} />
                  )}
                </View>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Events & courses</Text>
        <View style={styles.list}>
          {BIZ_PROFILE_EVENTS.map((item) => (
            <Pressable
              key={item.id}
              style={styles.itemCard}
              onPress={() =>
                router.push(
                  item.id === 'batch'
                    ? '/(main)/market/course-learning'
                    : '/(main)/market/event-detail',
                )
              }
            >
              <View style={[styles.eventSide, { backgroundColor: item.sideBg }]}>
                <Text style={[styles.eventTop, { color: item.sideTopColor }]}>
                  {item.sideTop}
                </Text>
                <Text
                  style={[styles.eventBottom, { color: item.sideBottomColor }]}
                >
                  {item.sideBottom}
                </Text>
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: item.priceColor }]}>
                {item.price}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: c(10, 8),
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
    color: BIZ_PROFILE_MUTED,
  },
  count: {
    fontSize: c(12.5, 11.5),
    fontWeight: '600',
    color: BIZ_PROFILE_GREEN,
  },
  list: {
    gap: c(11, 9),
  },
  loading: {
    paddingVertical: c(16, 12),
    alignItems: 'center',
  },
  empty: {
    fontSize: c(13, 12),
    color: BIZ_PROFILE_MUTED,
    paddingVertical: c(6, 4),
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BIZ_PROFILE_BORDER,
    borderRadius: NU.cardRadiusMd,
    padding: NU.cardPadXs,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  itemIcon: {
    width: c(52, 46),
    height: c(52, 46),
    borderRadius: c(11, 9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
  },
  itemTitle: {
    fontSize: c(14.5, 13.5),
    fontWeight: '700',
    color: BIZ_PROFILE_TEAL,
  },
  itemSubtitle: {
    fontSize: NU.bodySm,
    color: BIZ_PROFILE_MUTED,
    marginTop: c(2, 1),
  },
  itemPrice: {
    fontSize: c(14.5, 13.5),
    fontWeight: '800',
    color: BIZ_PROFILE_TEAL,
  },
  eventSide: {
    width: c(52, 46),
    borderRadius: c(11, 9),
    paddingVertical: c(7, 5),
    alignItems: 'center',
  },
  eventTop: {
    fontSize: c(9.5, 8.5),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  eventBottom: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    lineHeight: c(20, 18),
  },
});
